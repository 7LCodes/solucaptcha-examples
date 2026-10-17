<p align="center"><a href="https://solucaptcha.com/en-us"><img src="assets/cover.svg" alt="SoluCaptcha developer examples" width="100%"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.pt-BR.md">Português</a> · <a href="https://solucaptcha.com/en-us/docs">Documentation</a> · <a href="https://solucaptcha.com/en-us/status">Status</a></p>

<p align="center"><img src="assets/badges/python.svg" alt="Python 3.11+"> <img src="assets/badges/javascript.svg" alt="Node.js 22+"> <img src="assets/badges/dependencies.svg" alt="Zero runtime dependencies"> <a href="https://github.com/7LCodes/solucaptcha-examples/actions/workflows/ci.yml"><img src="https://github.com/7LCodes/solucaptcha-examples/actions/workflows/ci.yml/badge.svg" alt="Continuous integration"></a> <a href="LICENSE"><img src="assets/badges/license.svg" alt="MIT License"></a></p>

# SoluCaptcha integration examples

Server-side **Python and JavaScript** examples with small HTTP clients, ready-to-edit payloads and guides in English and Portuguese. No runtime dependencies and no unpublished SDK to install.

> Use these examples only with applications you own or are authorized to test. Creating real tasks uses credits. Dry-run and automated tests use no network or balance.

## Start here

| Goal | Guide |
| --- | --- |
| Integrate with Python | [Python](docs/en-us/python.md) |
| Integrate with JavaScript | [JavaScript / Node.js](docs/en-us/javascript.md) |
| Understand services and pricing | [Pricing and services](docs/en-us/pricing-and-services.md) |
| Choose a payload | [payloads/](payloads/) |
| Read the HTTP contract | [HTTP reference](docs/en-us/http-reference.md) |
| Troubleshoot | [Troubleshooting](docs/en-us/troubleshooting.md) |

## Quick start: no key, no charge

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples

# Python
python examples/python/solve.py --task payloads/turnstile.json --dry-run

# JavaScript / Node.js
node examples/javascript/solve.mjs --task payloads/turnstile.json --dry-run
```

Then generate a key in the [dashboard](https://solucaptcha.com/en-us/dashboard/api-keys), set SOLUCAPTCHA_API_KEY on your server and follow a language guide. The .env.example file is not loaded automatically.

Linux / macOS:

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

Windows PowerShell:

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

Create one task and save its solution to a new private local file:

```bash
python examples/python/solve.py --task payloads/turnstile.json --output solution.json
# OR / OU
node examples/javascript/solve.mjs --task payloads/turnstile.json --output solution.json
```

The client prints taskId before polling. To resume an existing task, pass --task-id YOUR_TASK_ID; this does not create another task. Solutions are not printed by default and output files are never overwritten.

## Services and payloads

| Service | `task.type` | Payload | Demo |
| --- | --- | --- | --- |
| Cloudflare Turnstile | `turnstile` | [turnstile.json](payloads/turnstile.json) | [Demo](https://solucaptcha.com/en-us/demos/turnstile) |
| Cloudflare Challenge | `interstitial` | [interstitial.json](payloads/interstitial.json) | [Demo](https://solucaptcha.com/en-us/demos/interstitial) |
| Akamai Bot Manager | `akamai` | [akamai.json](payloads/akamai.json) | [Demo](https://solucaptcha.com/en-us/demos/akamai) |
| PerimeterX | `perimeterx` | [perimeterx.json](payloads/perimeterx.json) | [Demo](https://solucaptcha.com/en-us/demos/perimeterx) |
| DataDome | `datadome` | [datadome.json](payloads/datadome.json) | [Demo](https://solucaptcha.com/en-us/demos/datadome) |
| Imperva / Incapsula | `imperva` | [imperva.json](payloads/imperva.json) | [Demo](https://solucaptcha.com/en-us/demos/imperva) |
| BotBye | `botbye` | [botbye.json](payloads/botbye.json) | [Demo](https://solucaptcha.com/en-us/demos/botbye) |
| Aliyun Captcha | `aliyun` | [aliyun.json](payloads/aliyun.json) | [Demo](https://solucaptcha.com/en-us/demos/aliyun) |
| AWS WAF CAPTCHA | `awswaf` | [awswaf.json](payloads/awswaf.json) | [Demo](https://solucaptcha.com/en-us/demos/awswaf) |

Payloads are configuration templates, not evidence of availability or challenge success. Set websiteURL and, for Turnstile, websiteKey for your authorized application. The Turnstile test key is public. OCR is excluded because it is disabled in the documented configuration.

[Current prices](https://solucaptcha.com/en-us/pricing) · [Live status](https://solucaptcha.com/en-us/status)

## Repository map

```text
assets/                 Brand artwork and local badges
examples/
  python/               Standard-library HTTP client and CLI examples
  javascript/           Native-fetch HTTP client and CLI examples
payloads/               Nine editable task payloads
docs/
  en-us/                English guides and HTTP reference
  pt-br/                Guias e referência HTTP em português
generated/              Sanitized website guide output
tests/                  Isolated Python and JavaScript tests
tools/                  Guide builder and repository checks
.github/                CI, issue forms and contribution templates
```

## Quality and tests

```bash
npm test
python -m unittest discover -s tests/python -v
node tools/build-guides.mjs --check
node tools/check-repository.mjs
```

CI covers Linux and Windows, Python/Node.js versions, payloads, internal links, sensitive files and guide consistency. Tests are isolated and do not establish effectiveness against real captchas. CI needs no secrets.

## Security and contributions

- [How to contribute](CONTRIBUTING.md)
- [Report a vulnerability](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)
- [MIT License](LICENSE)

For account, billing or ticket issues, use [official support](https://solucaptcha.com/en-us/contact). Do not publish keys, solutions, cookies or customer data in issues.
