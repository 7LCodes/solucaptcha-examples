# Security policy

Never report a vulnerability with API keys, tokens, cookies, customer information or reproduction steps exposing another account in a public issue.

Use the repository's private vulnerability reporting feature when available, or contact [SoluCaptcha support](https://solucaptcha.com/en-us/contact). State the affected example/version and a minimal, redacted reproduction. Do not test against other people's accounts or applications.

The examples read credentials from the server environment, reject API redirects, do not automatically retry task creation and avoid printing solutions. This is not a security guarantee: review code and your deployment before production use.

If a real key was exposed, revoke it in your dashboard and create a replacement. Deleting a commit or issue is not a substitute for revocation.
