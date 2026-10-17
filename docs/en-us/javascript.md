# Integrate SoluCaptcha with JavaScript and Node.js

Integrate SoluCaptcha with Node.js using native fetch, dependency-free examples, bounded polling, balance checks and taskId resumption.

Updated 2026-10-17.

A guide for Node.js 22 or later with native fetch and no runtime dependencies. Run the examples on your server; the API key must not be sent to the frontend.

The API base URL is https://api.solucaptcha.com. These repository clients send JSON over HTTPS to /createTask, /getTaskResult and /getBalance, using clientKey in the request body.

## Before you start

Create an account, verify your email and generate an API key in the dashboard. Add credits before creating real tasks. Keep the key on your server; do not put it in browser code, URLs, screenshots or commits.

[Manage API keys](https://solucaptcha.com/en-us/dashboard/api-keys) · [Add credits](https://solucaptcha.com/en-us/dashboard/credits) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples
```

## Validate without creating tasks

```bash
node examples/javascript/solve.mjs --task payloads/turnstile.json --dry-run
```

Dry-run works without a key or network access. The Turnstile payload websiteKey is public and belongs to the test widget; clientKey is your secret credential and comes from the environment. Set websiteURL and websiteKey for your authorized application.

## Set the environment variable

In your server terminal, choose the command for your operating system. Replace YOUR_API_KEY with your own key. The .env.example file is a reference: these examples do not automatically load .env files.

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

## Run the integration

```bash
node examples/javascript/solve.mjs --task payloads/turnstile.json --output solution.json
```

The program creates a single task, prints taskId and polls its result. The solution is saved only when you pass --output; the file must be new. Do not publish tokens, cookies or this file on GitHub.

## Use the client in your application

The client is the examples/javascript/client.mjs file in this repository. This import works from the cloned project root; it does not depend on a SoluCaptcha npm package.

```javascript
import { SoluCaptchaClient } from "./examples/javascript/client.mjs";

const client = SoluCaptchaClient.fromEnv();
const taskId = await client.createTask({
  "type": "turnstile",
  "websiteURL": "https://solucaptcha.com/en-us/demos/turnstile",
  "websiteKey": "1x00000000000000000000AA"
});
const result = await client.waitForResult(taskId);
const solution = result.solution;
// Use solution in your authorized server-side application.
```

## Resume a task and check balance

```bash
node examples/javascript/solve.mjs --task-id YOUR_TASK_ID --output solution.json
node examples/javascript/balance.mjs
node examples/javascript/health.mjs
```

## How the lifecycle works

- POST /createTask accepts clientKey and task and returns taskId. Create the task exactly once.
- POST /getTaskResult accepts clientKey and that same taskId. Poll pending or processing until completed.
- Use solution when status is completed. API errors can also arrive with HTTP 200 and a nonzero errorId.
- If polling times out, resume the existing taskId. Do not automatically create another task. If the creation response is lost, check the dashboard before trying again.

[createTask](https://solucaptcha.com/en-us/docs) · [getTaskResult](https://solucaptcha.com/en-us/docs/get-task-result) · [Error codes](https://solucaptcha.com/en-us/docs/api-error-types)

## Test without calling the real API

```bash
npm test
node tools/check-repository.mjs
```

Tests mock HTTP and cover API errors even when HTTP is 200, deadlines, redirects and the absence of automatic createTask retries. They check the client contract, not effectiveness against real challenges.

[JavaScript source on GitHub](https://github.com/7LCodes/solucaptcha-examples/tree/main/examples/javascript) · [Service status](https://solucaptcha.com/en-us/status)
