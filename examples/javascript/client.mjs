/** Server-side SoluCaptcha HTTP client. Node.js 22+, no third-party dependencies. */
import { setTimeout as sleep } from "node:timers/promises";
export const API_ORIGIN = "https://api.solucaptcha.com";
export const TASK_TYPES = Object.freeze([
  "turnstile",
  "interstitial",
  "akamai",
  "perimeterx",
  "datadome",
  "imperva",
  "botbye",
  "aliyun",
  "awswaf",
]);
const MAX_BYTES = 2 * 1024 * 1024;
export class SoluCaptchaError extends Error {
  constructor(code, taskId) {
    super(code + (taskId ? ` (taskId: ${taskId})` : ""));
    this.name = "SoluCaptchaError";
    this.code = code;
    this.taskId = taskId;
  }
}
export function validateTask(task) {
  if (
    !task ||
    typeof task !== "object" ||
    Array.isArray(task) ||
    !TASK_TYPES.includes(task.type)
  )
    throw new TypeError(
      "Choose a supported task type; OCR is not enabled in these examples",
    );
  let url;
  try {
    url = new URL(task.websiteURL);
  } catch {
    throw new TypeError("websiteURL must be an HTTP(S) URL");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new TypeError("websiteURL must not contain embedded credentials");
  if (
    task.type === "turnstile" &&
    (typeof task.websiteKey !== "string" || !task.websiteKey.trim())
  )
    throw new TypeError("Turnstile requires websiteKey");
  return task;
}
function taskId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value))
    throw new TypeError("Invalid taskId");
  return value;
}
export class SoluCaptchaClient {
  #key;
  #fetch;
  constructor(
    apiKey = "",
    { requestTimeoutMs = 15000, fetchImpl = globalThis.fetch } = {},
  ) {
    if (
      typeof apiKey !== "string" ||
      apiKey.length > 512 ||
      /[\s\x00-\x1f]/.test(apiKey)
    )
      throw new TypeError("Invalid API key format");
    if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs <= 0)
      throw new TypeError("requestTimeoutMs must be a positive integer");
    this.#key = apiKey;
    this.#fetch = fetchImpl;
    this.requestTimeoutMs = requestTimeoutMs;
  }
  static fromEnv(options) {
    const key = process.env.SOLUCAPTCHA_API_KEY;
    if (!key)
      throw new TypeError("Set SOLUCAPTCHA_API_KEY in your server environment");
    return new SoluCaptchaClient(key, options);
  }
  async #request(path, payload, timeoutMs = this.requestTimeoutMs) {
    if (
      !["/health", "/getBalance", "/createTask", "/getTaskResult"].includes(
        path,
      )
    )
      throw new TypeError("Unsupported public endpoint");
    if (payload && !this.#key)
      throw new TypeError("Set SOLUCAPTCHA_API_KEY in your server environment");
    let response, raw;
    try {
      response = await this.#fetch(API_ORIGIN + path, {
        method: payload ? "POST" : "GET",
        redirect: "error",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "SoluCaptcha-Examples/1.0",
        },
        ...(payload
          ? { body: JSON.stringify({ ...payload, clientKey: this.#key }) }
          : {}),
        signal: AbortSignal.timeout(
          Math.max(1, Math.min(this.requestTimeoutMs, Math.ceil(timeoutMs))),
        ),
      });
      if (!response.ok) throw new SoluCaptchaError(`HTTP_${response.status}`);
      if (
        !/^application\/json\b/i.test(
          response.headers.get("content-type") || "",
        )
      )
        throw new SoluCaptchaError("UNEXPECTED_CONTENT_TYPE");
      if (Number(response.headers.get("content-length")) > MAX_BYTES)
        throw new SoluCaptchaError("RESPONSE_TOO_LARGE");
      raw = await response.text();
    } catch (error) {
      if (error instanceof SoluCaptchaError) throw error;
      // createTask is never retried automatically: the response may have been lost.
      throw new SoluCaptchaError(
        path === "/createTask"
          ? "NETWORK_ERROR_CHECK_DASHBOARD_BEFORE_RECREATING_TASK"
          : "NETWORK_ERROR",
      );
    }
    if (Buffer.byteLength(raw) > MAX_BYTES)
      throw new SoluCaptchaError("RESPONSE_TOO_LARGE");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new SoluCaptchaError("INVALID_JSON_RESPONSE");
    }
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new SoluCaptchaError("INVALID_API_RESPONSE");
    if (payload) {
      if (!Number.isInteger(data.errorId))
        throw new SoluCaptchaError("MISSING_ERROR_ID");
      if (data.errorId !== 0)
        throw new SoluCaptchaError(
          typeof data.errorCode === "string" &&
          /^[A-Z0-9_]{1,80}$/.test(data.errorCode)
            ? data.errorCode
            : "API_ERROR",
        );
    }
    return data;
  }
  health() {
    return this.#request("/health");
  }
  async getBalance() {
    const value = (await this.#request("/getBalance", {})).balance;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
      throw new SoluCaptchaError("INVALID_BALANCE_RESPONSE");
    return value;
  }
  async createTask(task) {
    return taskId(
      (await this.#request("/createTask", { task: validateTask(task) })).taskId,
    );
  }
  getTaskResult(id, { timeoutMs = this.requestTimeoutMs } = {}) {
    return this.#request("/getTaskResult", { taskId: taskId(id) }, timeoutMs);
  }
  async waitForResult(id, { timeoutMs = 180000, intervalMs = 2500 } = {}) {
    id = taskId(id);
    if (![timeoutMs, intervalMs].every((v) => Number.isSafeInteger(v) && v > 0))
      throw new TypeError("timeoutMs and intervalMs must be positive integers");
    const deadline = performance.now() + timeoutMs;
    while (performance.now() < deadline) {
      let data;
      try {
        data = await this.getTaskResult(id, {
          timeoutMs: deadline - performance.now(),
        });
      } catch (error) {
        if (error instanceof SoluCaptchaError)
          throw new SoluCaptchaError(error.code, id);
        throw error;
      }
      if (data.status === "completed") {
        if (
          !data.solution ||
          typeof data.solution !== "object" ||
          Array.isArray(data.solution)
        )
          throw new SoluCaptchaError("MISSING_SOLUTION", id);
        return data;
      }
      if (data.status === "failed")
        throw new SoluCaptchaError("TASK_FAILED", id);
      if (!["pending", "processing"].includes(data.status))
        throw new SoluCaptchaError("UNEXPECTED_TASK_STATUS", id);
      await sleep(
        Math.max(0, Math.min(intervalMs, deadline - performance.now())),
      );
    }
    throw new SoluCaptchaError("POLL_TIMEOUT_RESUME_EXISTING_TASK", id);
  }
}
