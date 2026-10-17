from solucaptcha_client import SoluCaptchaClient

if __name__ == "__main__":
    print(f"Available balance: USD {SoluCaptchaClient.from_env().get_balance():.5f}")
