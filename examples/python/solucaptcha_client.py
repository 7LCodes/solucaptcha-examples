"""Small server-side SoluCaptcha HTTP client. Python 3.11+, standard library only."""
import json
import math
import os
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

API_ORIGIN = "https://api.solucaptcha.com"
TASK_TYPES = frozenset(("turnstile", "interstitial", "akamai", "perimeterx", "datadome", "imperva", "botbye", "aliyun", "awswaf"))
MAX_BYTES = 2 * 1024 * 1024

class SoluCaptchaError(Exception):
    """Safe error message: request bodies, credentials and solutions are excluded."""
    def __init__(self, code, *, task_id=None):
        self.code = code
        self.task_id = task_id
        super().__init__(code + (f" (taskId: {task_id})" if task_id else ""))

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def validate_task(task):
    if not isinstance(task, dict) or task.get("type") not in TASK_TYPES:
        raise ValueError("Choose a supported task type; OCR is not enabled in these examples")
    url = urlsplit(task.get("websiteURL", ""))
    if url.scheme not in ("https", "http") or not url.hostname or url.username or url.password:
        raise ValueError("websiteURL must be an HTTP(S) URL without embedded credentials")
    if task["type"] == "turnstile" and not str(task.get("websiteKey", "")).strip():
        raise ValueError("Turnstile requires websiteKey")
    return task

def task_id(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", value):
        raise ValueError("Invalid taskId")
    return value

class SoluCaptchaClient:
    def __init__(self, api_key="", *, request_timeout=15, transport=None):
        if not isinstance(api_key, str) or len(api_key) > 512 or re.search(r"[\s\x00-\x1f]", api_key):
            raise ValueError("Invalid API key format")
        if not isinstance(request_timeout, (int, float)) or not math.isfinite(request_timeout) or request_timeout <= 0:
            raise ValueError("request_timeout must be positive")
        self.__key = api_key
        self.request_timeout = request_timeout
        self._open = transport or build_opener(NoRedirect()).open

    @classmethod
    def from_env(cls, **kwargs):
        key = os.environ.get("SOLUCAPTCHA_API_KEY", "")
        if not key:
            raise ValueError("Set SOLUCAPTCHA_API_KEY in your server environment")
        return cls(key, **kwargs)

    def _request(self, path, payload=None, *, timeout=None):
        if path not in ("/health", "/getBalance", "/createTask", "/getTaskResult"):
            raise ValueError("Unsupported public endpoint")
        if payload is not None and not self.__key:
            raise ValueError("Set SOLUCAPTCHA_API_KEY in your server environment")
        body = None if payload is None else json.dumps({**payload, "clientKey": self.__key}).encode("utf-8")
        request = Request(API_ORIGIN + path, data=body, method="GET" if body is None else "POST", headers={"Accept": "application/json", "Content-Type": "application/json", "User-Agent": "SoluCaptcha-Examples/1.0"})
        try:
            with self._open(request, timeout=min(self.request_timeout, timeout or self.request_timeout)) as response:
                if response.status != 200:
                    raise SoluCaptchaError(f"HTTP_{response.status}")
                if response.headers.get_content_type() != "application/json":
                    raise SoluCaptchaError("UNEXPECTED_CONTENT_TYPE")
                raw = response.read(MAX_BYTES + 1)
        except HTTPError as error:
            error.close()
            raise SoluCaptchaError(f"HTTP_{error.code}") from None
        except (URLError, TimeoutError, OSError):
            # Never retry createTask automatically: the server may have accepted it.
            raise SoluCaptchaError("NETWORK_ERROR_CHECK_DASHBOARD_BEFORE_RECREATING_TASK" if path == "/createTask" else "NETWORK_ERROR") from None
        if len(raw) > MAX_BYTES:
            raise SoluCaptchaError("RESPONSE_TOO_LARGE")
        try:
            data = json.loads(raw)
        except (ValueError, UnicodeError):
            raise SoluCaptchaError("INVALID_JSON_RESPONSE") from None
        if not isinstance(data, dict):
            raise SoluCaptchaError("INVALID_API_RESPONSE")
        if body is not None:
            if type(data.get("errorId")) is not int:
                raise SoluCaptchaError("MISSING_ERROR_ID")
            if data["errorId"] != 0:
                code = data.get("errorCode", "API_ERROR")
                raise SoluCaptchaError(code if isinstance(code, str) and re.fullmatch(r"[A-Z0-9_]{1,80}", code) else "API_ERROR")
        return data

    def health(self):
        """Public health metadata; does not create tasks or require an API key."""
        return self._request("/health")

    def get_balance(self):
        value = self._request("/getBalance", {}).get("balance")
        if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
            raise SoluCaptchaError("INVALID_BALANCE_RESPONSE")
        return value

    def create_task(self, task):
        return task_id(self._request("/createTask", {"task": validate_task(task)}).get("taskId"))

    def get_task_result(self, identifier, *, timeout=None):
        return self._request("/getTaskResult", {"taskId": task_id(identifier)}, timeout=timeout)

    def wait_for_result(self, identifier, *, timeout=180, interval=2.5):
        identifier = task_id(identifier)
        if not all(isinstance(v, (int, float)) and math.isfinite(v) and v > 0 for v in (timeout, interval)):
            raise ValueError("timeout and interval must be positive")
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            try:
                data = self.get_task_result(identifier, timeout=remaining)
            except SoluCaptchaError as error:
                raise SoluCaptchaError(error.code, task_id=identifier) from None
            state = data.get("status")
            if state == "completed":
                if not isinstance(data.get("solution"), dict):
                    raise SoluCaptchaError("MISSING_SOLUTION", task_id=identifier)
                return data
            if state == "failed":
                raise SoluCaptchaError("TASK_FAILED", task_id=identifier)
            if state not in ("pending", "processing"):
                raise SoluCaptchaError("UNEXPECTED_TASK_STATUS", task_id=identifier)
            time.sleep(max(0, min(interval, deadline - time.monotonic())))
        raise SoluCaptchaError("POLL_TIMEOUT_RESUME_EXISTING_TASK", task_id=identifier)
