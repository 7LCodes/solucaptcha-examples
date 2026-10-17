# Public HTTP reference

API origin: `https://api.solucaptcha.com`. Authenticated operations use `clientKey` in a JSON POST body. Keep the key server-side.

| Endpoint | Method | Purpose | API key |
| --- | --- | --- | --- |
| `/health` | GET | Public service metadata | No |
| `/getBalance` | POST | Available account balance in USD | Yes |
| `/createTask` | POST | Create a task once; returns `taskId` | Yes |
| `/getTaskResult` | POST | Poll an existing task | Yes |

## Task request

```json
{"clientKey":"YOUR_API_KEY","task":{"type":"turnstile","websiteURL":"https://solucaptcha.com/en-us/demos/turnstile","websiteKey":"1x00000000000000000000AA"}}
```

## Poll request

```json
{"clientKey":"YOUR_API_KEY","taskId":"YOUR_TASK_ID"}
```

`pending` and `processing` are nonterminal. `completed` includes `solution`. `failed` is terminal. HTTP 200 alone is not success: check `errorId === 0` and handle `errorCode` otherwise. The example clients surface safe error codes and do not log raw request/response bodies.

Never automatically retry `createTask` after a network timeout: the task might already exist. Save taskId when available and resume polling. If creation did not return an ID, inspect your dashboard before creating another task.

The public price catalog is separate: GET `https://solucaptcha.com/api/portal/catalog`, without `clientKey`. A service listing is distinct from its live availability. No private operator, webhook, session or infrastructure endpoints are part of these examples.

[Full documentation](https://solucaptcha.com/en-us/docs) · [Error codes](https://solucaptcha.com/en-us/docs/api-error-types) · [Pricing guide](pricing-and-services.md)
