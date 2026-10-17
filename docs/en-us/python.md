# Integrate SoluCaptcha with Python

Integrate the SoluCaptcha API with runnable Python examples, environment-based credentials, polling, balance checks and task resumption.

Updated 2026-10-17.

A practical guide for Python 3.11 or later using only the standard library. These server-side examples use the real public SoluCaptcha endpoints.

The API base URL is https://api.solucaptcha.com. These repository clients send JSON over HTTPS to /createTask, /getTaskResult and /getBalance, using clientKey in the request body.

## Before you start

Create an account, verify your email and generate an API key in the dashboard. Add credits before creating real tasks. Keep the key on your server; do not put it in browser code, URLs, screenshots or commits.

[Manage API keys](https://solucaptcha.com/en-us/dashboard/api-keys) · [Add credits](https://solucaptcha.com/en-us/dashboard/credits) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples
```

## Validate locally without spending credits

Dry-run validates the JSON without network access, an API key or task creation. The Turnstile payload uses the public test key of the demo widget. For your application, use an authorized URL and its matching public site key.

```bash
python examples/python/solve.py --task payloads/turnstile.json --dry-run
```

## Set the environment variable

In your server terminal, choose the command for your operating system. Replace YOUR_API_KEY with your own key. The .env.example file is a reference: these examples do not automatically load .env files.

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

## Create a task and poll the result

```bash
python examples/python/solve.py --task payloads/turnstile.json --output solution.json
```

The program prints taskId before polling. Tokens and solution cookies are not printed by default. --output saves the solution to a new local file and refuses to overwrite existing files. Protect this file and do not publish it.

## Use the client in your application

The solucaptcha_client.py module lives in examples/python in this repository. Put it beside your program or configure your import path. It is a local example, not a published PyPI package.

```python
from solucaptcha_client import SoluCaptchaClient

client = SoluCaptchaClient.from_env()
task = {
    "type": "turnstile",
    "websiteURL": "https://solucaptcha.com/en-us/demos/turnstile",
    "websiteKey": "1x00000000000000000000AA"
}
task_id = client.create_task(task)
result = client.wait_for_result(task_id)
solution = result["solution"]
# Use solution in your authorized server-side application.
```

## Resume polling and check balance

```bash
python examples/python/solve.py --task-id YOUR_TASK_ID --output solution.json
python examples/python/balance.py
python examples/python/health.py
```

Resumption queries the existing task without creating a new one. balance.py requires your key; health.py requests public metadata and needs no key.

## How the lifecycle works

- POST /createTask accepts clientKey and task and returns taskId. Create the task exactly once.
- POST /getTaskResult accepts clientKey and that same taskId. Poll pending or processing until completed.
- Use solution when status is completed. API errors can also arrive with HTTP 200 and a nonzero errorId.
- If polling times out, resume the existing taskId. Do not automatically create another task. If the creation response is lost, check the dashboard before trying again.

[createTask](https://solucaptcha.com/en-us/docs) · [getTaskResult](https://solucaptcha.com/en-us/docs/get-task-result) · [Error codes](https://solucaptcha.com/en-us/docs/api-error-types)

## Tests and limits

Run the isolated tests below. They mock HTTP and do not solve real captchas, require credentials or spend credits. Validate availability and challenge success for your authorized use case.

```bash
python -m unittest discover -s tests/python -v
```

[Python source on GitHub](https://github.com/7LCodes/solucaptcha-examples/tree/main/examples/python) · [Service status](https://solucaptcha.com/en-us/status)
