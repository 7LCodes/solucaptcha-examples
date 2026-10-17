import json
from solucaptcha_client import SoluCaptchaClient

if __name__ == "__main__":
    print(json.dumps(SoluCaptchaClient().health(), indent=2))
