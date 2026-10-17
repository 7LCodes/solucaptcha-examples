# Troubleshooting

| Symptom | Action |
| --- | --- |
| `Set SOLUCAPTCHA_API_KEY` | Set the variable in the terminal/server. .env.example is not loaded automatically. |
| `HTTP_429` | Reduce request frequency and review account limits. |
| `UNEXPECTED_CONTENT_TYPE` | An HTML or edge-protection page replaced JSON. Check the domain and service status; do not disable TLS validation. |
| `POLL_TIMEOUT_RESUME_EXISTING_TASK` | Resume with --task-id; do not create another task. |
| `NETWORK_ERROR_CHECK_DASHBOARD_BEFORE_RECREATING_TASK` | The creation response may have been lost. Check the dashboard before recreating. |
| `ERROR_UNSUPPORTED_TASK` | Check task.type and status. OCR is excluded from these examples. |
| `File exists` / `EEXIST` | Choose a new --output filename; examples do not overwrite solutions. |

When requesting support, provide only taskId and the error code. Do not post keys, cookies or solutions in issues. Health metadata indicates infrastructure availability, not guaranteed challenge success.

[Status](https://solucaptcha.com/en-us/status) · [Support](https://solucaptcha.com/en-us/contact) · [HTTP](http-reference.md)
