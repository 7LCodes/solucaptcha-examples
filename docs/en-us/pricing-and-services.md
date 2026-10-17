# Pricing and available services

Understand the SoluCaptcha public catalog, task types, USD prices per 1,000 resolutions, balance, reservations and live availability.

Updated 2026-10-17.

Prices are managed in the SoluCaptcha catalog and may change. The live table on the website and the public endpoint below are the references for current values; this guide and GitHub do not freeze a price list that could become stale.

Tasks and balance use the API at https://api.solucaptcha.com. The public pricing catalog is served by the website at https://solucaptcha.com/api/portal/catalog and requires no API key.

[Current pricing](https://solucaptcha.com/en-us/pricing) · [Public JSON catalog](https://solucaptcha.com/api/portal/catalog) · [Status and incidents](https://solucaptcha.com/en-us/status)

## Services and task identifiers

| Service | task.type |
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

A published price does not mean a service is operational. Check live status before integrating. OCR / Image to text accepts image data and is outside the scope of these URL-based examples. Check current status and the corresponding contract before using OCR. Healthy metadata describes infrastructure availability, not a guaranteed success rate.

## Understand USD per 1,000 resolutions

pricePerThousandCents is USD cents per 1,000 resolutions. Divide by 100 to obtain USD per 1,000. To estimate one resolution, divide that USD value by 1,000. Mathematical example only: if the field were 100, that would mean US$1.00 per 1,000, or US$0.001 per resolution. This example is not a service quote.

## Read prices with JavaScript

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

## Read prices with Python

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

The catalog is public and does not receive your key. Public fields are name, description, pricePerThousandCents and estimatedSeconds. Estimated times vary by challenge and are not an SLA.

## Reservations, charges and balance

- Creating a task can reserve credits and temporarily reduce available balance.
- Success confirms the charge; failure releases the reservation after financial confirmation.
- Read cost for the confirmed charge; reservedCost can describe an active task reservation.
- Available balance is shared by keys in the same account. Later price changes do not alter an existing task reservation.

[getBalance](https://solucaptcha.com/en-us/docs/get-balance) · [Deposits and balance](https://solucaptcha.com/en-us/docs/deposits) · [Service demos](https://solucaptcha.com/en-us/demos) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)
