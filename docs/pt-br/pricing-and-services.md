# Preços e serviços disponíveis

Entenda o catálogo público da SoluCaptcha, os tipos de tarefa, preços em USD por 1.000 resoluções, saldo, reservas e disponibilidade.

Atualizado em 2026-10-17.

Os preços são administrados no catálogo da SoluCaptcha e podem mudar. A tabela ao vivo no site e o endpoint público abaixo são as referências para os valores atuais; este guia e o GitHub não fixam uma tabela de preços que possa ficar desatualizada.

As tarefas e o saldo usam a API em https://api.solucaptcha.com. O catálogo público de preços é fornecido pelo site em https://solucaptcha.com/api/portal/catalog e não exige chave.

[Tabela de preços atual](https://solucaptcha.com/pt-br/pricing) · [Catálogo público em JSON](https://solucaptcha.com/api/portal/catalog) · [Status e incidentes](https://solucaptcha.com/pt-br/status)

## Serviços e identificadores de tarefa

| Serviço | task.type |
| --- | --- |
| Cloudflare Turnstile | turnstile |
| Cloudflare Challenge | interstitial |
| Akamai Bot Manager | akamai |
| PerimeterX | perimeterx |
| DataDome | datadome |
| Imperva / Incapsula | imperva |
| BotBye | botbye |
| Aliyun Captcha | aliyun |
| AWS WAF CAPTCHA | awswaf |

Ter um preço publicado não significa que o serviço está operacional. Consulte o status antes de integrar. OCR / Image to text recebe dados de imagem e está fora do escopo destes exemplos baseados em URL. Consulte o status atual e o contrato correspondente antes de usar OCR. Um health positivo descreve infraestrutura disponível, não uma taxa de sucesso garantida.

## Entender USD por 1.000 resoluções

pricePerThousandCents representa centavos de USD por 1.000 resoluções. Divida por 100 para obter USD por 1.000. Para estimar uma única resolução, divida esse valor em USD por 1.000. Exemplo apenas matemático: se o campo fosse 100, seriam US$1,00 por 1.000, ou US$0,001 por resolução. Esse exemplo não é uma cotação de serviço.

## Consultar preços com JavaScript

```javascript
const response = await fetch("https://solucaptcha.com/api/portal/catalog", {
  redirect: "error", signal: AbortSignal.timeout(15000),
  headers: { Accept: "application/json", "User-Agent": "SoluCaptcha-Examples/1.0" }
});
if (!response.ok) throw new Error("HTTP " + response.status);
const { items } = await response.json();
for (const item of items) {
  console.log(item.name, "USD / 1000:", item.pricePerThousandCents / 100);
}
```

## Consultar preços com Python

```python
import json
from urllib.request import Request, urlopen

request = Request("https://solucaptcha.com/api/portal/catalog", headers={
    "Accept": "application/json", "User-Agent": "SoluCaptcha-Examples/1.0"
})
with urlopen(request, timeout=15) as response:
    catalog = json.load(response)
for item in catalog["items"]:
    print(item["name"], "USD / 1000:", item["pricePerThousandCents"] / 100)
```

O catálogo é público e não recebe sua chave. Os campos públicos são name, description, pricePerThousandCents e estimatedSeconds. Tempos estimados variam por desafio e não são SLA.

## Reservas, cobranças e saldo

- A criação de tarefa pode reservar créditos e reduzir temporariamente o saldo disponível.
- Sucesso confirma a cobrança; falha libera a reserva após a confirmação financeira.
- Consulte cost para a cobrança confirmada; reservedCost pode informar a reserva de uma tarefa ativa.
- O saldo disponível é compartilhado pelas chaves da mesma conta. Mudanças de preço posteriores não alteram o preço já reservado de uma tarefa.

[getBalance](https://solucaptcha.com/pt-br/docs/get-balance) · [Depósitos e saldo](https://solucaptcha.com/pt-br/docs/deposits) · [Demos dos serviços](https://solucaptcha.com/pt-br/demos) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)
