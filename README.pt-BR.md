<p align="center"><a href="https://solucaptcha.com/pt-br"><img src="assets/cover.svg" alt="SoluCaptcha developer examples" width="100%"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.pt-BR.md">Português</a> · <a href="https://solucaptcha.com/pt-br/docs">Documentação</a> · <a href="https://solucaptcha.com/pt-br/status">Status</a></p>

<p align="center"><img src="assets/badges/python.svg" alt="Python 3.11+"> <img src="assets/badges/javascript.svg" alt="Node.js 22+"> <img src="assets/badges/dependencies.svg" alt="Zero runtime dependencies"> <a href="https://github.com/7LCodes/solucaptcha-examples/actions/workflows/ci.yml"><img src="https://github.com/7LCodes/solucaptcha-examples/actions/workflows/ci.yml/badge.svg" alt="Continuous integration"></a> <a href="LICENSE"><img src="assets/badges/license.svg" alt="MIT License"></a></p>

# Exemplos de integração SoluCaptcha

Exemplos de servidor em **Python e JavaScript**, com clientes HTTP pequenos, payloads prontos e guias em português e inglês. Sem dependências de execução e sem precisar instalar um SDK não publicado.

> Use os exemplos somente em aplicações próprias ou ambientes para os quais você tenha autorização. A criação de tarefas reais usa créditos. Dry-run e testes automatizados não usam rede nem saldo.

## Comece aqui

| Objetivo | Guia |
| --- | --- |
| Integrar com Python | [Python](docs/pt-br/python.md) |
| Integrar com JavaScript | [JavaScript / Node.js](docs/pt-br/javascript.md) |
| Entender serviços e preços | [Preços e serviços](docs/pt-br/pricing-and-services.md) |
| Escolher um payload | [payloads/](payloads/) |
| Consultar o contrato HTTP | [HTTP reference](docs/pt-br/http-reference.md) |
| Resolver problemas | [Solução de problemas](docs/pt-br/troubleshooting.md) |

## Início rápido: sem chave e sem cobrança

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples

# Python
python examples/python/solve.py --task payloads/turnstile.json --dry-run

# JavaScript / Node.js
node examples/javascript/solve.mjs --task payloads/turnstile.json --dry-run
```

Depois, gere sua chave no [dashboard](https://solucaptcha.com/pt-br/dashboard/api-keys), configure SOLUCAPTCHA_API_KEY no servidor e siga o guia do seu idioma. O arquivo .env.example não é carregado automaticamente.

Linux / macOS:

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

Windows PowerShell:

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

Criar uma única tarefa e salvar a solução em um arquivo privado novo:

```bash
python examples/python/solve.py --task payloads/turnstile.json --output solution.json
# OR / OU
node examples/javascript/solve.mjs --task payloads/turnstile.json --output solution.json
```

O cliente mostra taskId antes das consultas. Para retomar uma tarefa existente, use --task-id YOUR_TASK_ID; isso não cria outra tarefa. Os exemplos não imprimem soluções por padrão e recusam sobrescrever o arquivo de saída.

## Serviços e payloads

| Serviço | `task.type` | Payload | Demo |
| --- | --- | --- | --- |
| Cloudflare Turnstile | `turnstile` | [turnstile.json](payloads/turnstile.json) | [Demo](https://solucaptcha.com/pt-br/demos/turnstile) |
| Cloudflare Challenge | `interstitial` | [interstitial.json](payloads/interstitial.json) | [Demo](https://solucaptcha.com/pt-br/demos/interstitial) |
| Akamai Bot Manager | `akamai` | [akamai.json](payloads/akamai.json) | [Demo](https://solucaptcha.com/pt-br/demos/akamai) |
| PerimeterX | `perimeterx` | [perimeterx.json](payloads/perimeterx.json) | [Demo](https://solucaptcha.com/pt-br/demos/perimeterx) |
| DataDome | `datadome` | [datadome.json](payloads/datadome.json) | [Demo](https://solucaptcha.com/pt-br/demos/datadome) |
| Imperva / Incapsula | `imperva` | [imperva.json](payloads/imperva.json) | [Demo](https://solucaptcha.com/pt-br/demos/imperva) |
| BotBye | `botbye` | [botbye.json](payloads/botbye.json) | [Demo](https://solucaptcha.com/pt-br/demos/botbye) |
| Aliyun Captcha | `aliyun` | [aliyun.json](payloads/aliyun.json) | [Demo](https://solucaptcha.com/pt-br/demos/aliyun) |
| AWS WAF CAPTCHA | `awswaf` | [awswaf.json](payloads/awswaf.json) | [Demo](https://solucaptcha.com/pt-br/demos/awswaf) |

Os payloads são modelos de configuração, não prova de disponibilidade ou sucesso de um desafio. Ajuste websiteURL e, no Turnstile, websiteKey para sua aplicação autorizada. A chave de teste do Turnstile é pública. OCR não está incluído porque está desativado na configuração documentada.

[Preços atuais](https://solucaptcha.com/pt-br/pricing) · [Status ao vivo](https://solucaptcha.com/pt-br/status)

## Organização

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

## Qualidade e testes

```bash
npm test
python -m unittest discover -s tests/python -v
node tools/build-guides.mjs --check
node tools/check-repository.mjs
```

A CI verifica Linux e Windows, versões de Python/Node.js, payloads, links internos, arquivos sensíveis e consistência dos guias. Os testes são isolados e não comprovam eficácia contra captchas reais. Não é necessário configurar segredos na CI.

## Segurança e contribuições

- [Como contribuir](CONTRIBUTING.md)
- [Relatar uma vulnerabilidade](SECURITY.md)
- [Código de conduta](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)
- [MIT License](LICENSE)

Para problemas de conta, cobrança ou tickets, use o [suporte oficial](https://solucaptcha.com/pt-br/contact). Não publique chaves, soluções, cookies ou dados de clientes em issues.
