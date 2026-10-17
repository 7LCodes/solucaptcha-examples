import json
from solucaptcha_client import SoluCaptchaClient

if __name__ == "__main__":
    data = SoluCaptchaClient().health()
    print(json.dumps({key: data.get(key) for key in ("status", "capacity", "supportedTaskTypes")}, indent=2))
