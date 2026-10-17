// One structured source produces the public Markdown guides and website HTML.
const h = (text) => ({ type: "heading", text });
const p = (text) => ({ type: "paragraph", text });
const code = (language, content) => ({ type: "code", language, content });
const list = (items) => ({ type: "list", items });
const links = (items) => ({ type: "links", items });
const link = (label, href) => ({ label, href });
const table = (headers, rows) => ({ type: "table", headers, rows });
const repo = "https://github.com/7LCodes/solucaptcha-examples";
const task = {
  type: "turnstile",
  websiteURL: "https://solucaptcha.com/en-us/demos/turnstile",
  websiteKey: "1x00000000000000000000AA",
};
const shared = (locale) => [
  p(
    locale === "pt-br"
      ? "A URL base da API é https://api.solucaptcha.com. Os clientes deste repositório enviam JSON por HTTPS para /createTask, /getTaskResult e /getBalance, usando clientKey no corpo da requisição."
      : "The API base URL is https://api.solucaptcha.com. These repository clients send JSON over HTTPS to /createTask, /getTaskResult and /getBalance, using clientKey in the request body.",
  ),
  h(locale === "pt-br" ? "Antes de começar" : "Before you start"),
  p(
    locale === "pt-br"
      ? "Crie sua conta, verifique o email e gere uma chave de API no dashboard. Adicione créditos antes de criar tarefas reais. A chave deve permanecer no seu servidor; não coloque a chave no navegador, em URLs, capturas de tela ou commits."
      : "Create an account, verify your email and generate an API key in the dashboard. Add credits before creating real tasks. Keep the key on your server; do not put it in browser code, URLs, screenshots or commits.",
  ),
  links([
    link(
      locale === "pt-br" ? "Gerenciar chaves de API" : "Manage API keys",
      `https://solucaptcha.com/${locale}/dashboard/api-keys`,
    ),
    link(
      locale === "pt-br" ? "Adicionar créditos" : "Add credits",
      `https://solucaptcha.com/${locale}/dashboard/credits`,
    ),
    link("GitHub", repo),
  ]),
  code("bash", `git clone ${repo}.git\ncd solucaptcha-examples`),
];
const environment = (locale) => [
  h(
    locale === "pt-br"
      ? "Configurar a chave no ambiente"
      : "Set the environment variable",
  ),
  p(
    locale === "pt-br"
      ? "No terminal do seu servidor, escolha o comando do seu sistema. Substitua YOUR_API_KEY pela sua chave. O arquivo .env.example é uma referência: os exemplos não carregam arquivos .env automaticamente."
      : "In your server terminal, choose the command for your operating system. Replace YOUR_API_KEY with your own key. The .env.example file is a reference: these examples do not automatically load .env files.",
  ),
  code("bash", 'export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"'),
  code("powershell", '$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"'),
];
const lifecycle = (locale) => [
  h(locale === "pt-br" ? "Como o fluxo funciona" : "How the lifecycle works"),
  list(
    locale === "pt-br"
      ? [
          "POST /createTask recebe clientKey e task e retorna taskId. Crie a tarefa uma única vez.",
          "POST /getTaskResult recebe clientKey e o mesmo taskId. Aguarde pending ou processing até completed.",
          "Use solution quando status for completed. Erros também podem vir com HTTP 200 e errorId diferente de zero.",
          "Se a consulta atingir o timeout, retome pelo taskId já criado. Não crie outra tarefa automaticamente. Se a resposta da criação se perder, confira o dashboard antes de tentar novamente.",
        ]
      : [
          "POST /createTask accepts clientKey and task and returns taskId. Create the task exactly once.",
          "POST /getTaskResult accepts clientKey and that same taskId. Poll pending or processing until completed.",
          "Use solution when status is completed. API errors can also arrive with HTTP 200 and a nonzero errorId.",
          "If polling times out, resume the existing taskId. Do not automatically create another task. If the creation response is lost, check the dashboard before trying again.",
        ],
  ),
  links([
    link("createTask", `https://solucaptcha.com/${locale}/docs`),
    link(
      "getTaskResult",
      `https://solucaptcha.com/${locale}/docs/get-task-result`,
    ),
    link(
      locale === "pt-br" ? "Códigos de erro" : "Error codes",
      `https://solucaptcha.com/${locale}/docs/api-error-types`,
    ),
  ]),
];
function python(locale) {
  const pt = locale === "pt-br";
  return {
    title: pt
      ? "Como integrar a SoluCaptcha em Python"
      : "Integrate SoluCaptcha with Python",
    description: pt
      ? "Integre a API SoluCaptcha em Python com exemplos executáveis, chave por variável de ambiente, polling, consulta de saldo e retomada de tarefas."
      : "Integrate the SoluCaptcha API with runnable Python examples, environment-based credentials, polling, balance checks and task resumption.",
    blocks: [
      p(
        pt
          ? "Guia prático para Python 3.11 ou superior, usando somente a biblioteca padrão. Os exemplos são programas de servidor e usam os endpoints públicos reais da SoluCaptcha."
          : "A practical guide for Python 3.11 or later using only the standard library. These server-side examples use the real public SoluCaptcha endpoints.",
      ),
      ...shared(locale),
      h(
        pt
          ? "Validar o exemplo sem gastar créditos"
          : "Validate locally without spending credits",
      ),
      p(
        pt
          ? "O modo dry-run valida o JSON sem rede, sem chave e sem criar tarefa. O payload Turnstile usa a chave pública de teste do widget da demo. Para sua aplicação, use uma URL autorizada e a chave pública correspondente."
          : "Dry-run validates the JSON without network access, an API key or task creation. The Turnstile payload uses the public test key of the demo widget. For your application, use an authorized URL and its matching public site key.",
      ),
      code(
        "bash",
        "python examples/python/solve.py --task payloads/turnstile.json --dry-run",
      ),
      ...environment(locale),
      h(
        pt
          ? "Criar uma tarefa e consultar o resultado"
          : "Create a task and poll the result",
      ),
      code(
        "bash",
        "python examples/python/solve.py --task payloads/turnstile.json --output solution.json",
      ),
      p(
        pt
          ? "O programa mostra o taskId antes de iniciar as consultas. Por padrão, não imprime tokens ou cookies de solução. --output salva a solução em um novo arquivo local e recusa sobrescrever arquivos existentes. Proteja esse arquivo e não o publique."
          : "The program prints taskId before polling. Tokens and solution cookies are not printed by default. --output saves the solution to a new local file and refuses to overwrite existing files. Protect this file and do not publish it.",
      ),
      h(
        pt
          ? "Usar o cliente na sua aplicação"
          : "Use the client in your application",
      ),
      p(
        pt
          ? "O módulo solucaptcha_client.py está em examples/python neste repositório. Coloque-o junto ao seu programa ou ajuste o caminho de importação. Ele é um exemplo local, não um pacote publicado no PyPI."
          : "The solucaptcha_client.py module lives in examples/python in this repository. Put it beside your program or configure your import path. It is a local example, not a published PyPI package.",
      ),
      code(
        "python",
        `from solucaptcha_client import SoluCaptchaClient\n\nclient = SoluCaptchaClient.from_env()\ntask = ${JSON.stringify(task, null, 4)}\ntask_id = client.create_task(task)\nresult = client.wait_for_result(task_id)\nsolution = result["solution"]\n# Use solution in your authorized server-side application.`,
      ),
      h(
        pt
          ? "Retomar uma consulta e consultar saldo"
          : "Resume polling and check balance",
      ),
      code(
        "bash",
        "python examples/python/solve.py --task-id YOUR_TASK_ID --output solution.json\npython examples/python/balance.py\npython examples/python/health.py",
      ),
      p(
        pt
          ? "A retomada consulta a tarefa existente, sem criar uma nova. balance.py exige sua chave; health.py consulta metadados públicos e não precisa de chave."
          : "Resumption queries the existing task without creating a new one. balance.py requires your key; health.py requests public metadata and needs no key.",
      ),
      ...lifecycle(locale),
      h(pt ? "Testes e limites" : "Tests and limits"),
      p(
        pt
          ? "Execute os testes isolados abaixo. Eles simulam HTTP e não resolvem captchas reais, não precisam de credenciais e não gastam créditos. A disponibilidade e o sucesso de cada desafio devem ser validados no seu caso de uso autorizado."
          : "Run the isolated tests below. They mock HTTP and do not solve real captchas, require credentials or spend credits. Validate availability and challenge success for your authorized use case.",
      ),
      code("bash", "python -m unittest discover -s tests/python -v"),
      links([
        link(
          pt ? "Arquivos Python no GitHub" : "Python source on GitHub",
          repo + "/tree/main/examples/python",
        ),
        link(
          pt ? "Status dos serviços" : "Service status",
          `https://solucaptcha.com/${locale}/status`,
        ),
      ]),
    ],
  };
}
function javascript(locale) {
  const pt = locale === "pt-br";
  return {
    title: pt
      ? "Integração com JavaScript e Node.js"
      : "Integrate SoluCaptcha with JavaScript and Node.js",
    description: pt
      ? "Integre a SoluCaptcha com Node.js usando fetch nativo, exemplos sem dependências, polling com timeout, saldo e retomada pelo taskId."
      : "Integrate SoluCaptcha with Node.js using native fetch, dependency-free examples, bounded polling, balance checks and taskId resumption.",
    blocks: [
      p(
        pt
          ? "Guia para Node.js 22 ou superior, com fetch nativo e sem dependências de execução. Execute os exemplos no servidor; a chave da API não deve ser enviada ao frontend."
          : "A guide for Node.js 22 or later with native fetch and no runtime dependencies. Run the examples on your server; the API key must not be sent to the frontend.",
      ),
      ...shared(locale),
      h(pt ? "Validar sem criar tarefas" : "Validate without creating tasks"),
      code(
        "bash",
        "node examples/javascript/solve.mjs --task payloads/turnstile.json --dry-run",
      ),
      p(
        pt
          ? "Dry-run funciona sem chave e sem rede. A chave websiteKey do payload Turnstile é pública e pertence ao widget de teste; clientKey é sua credencial secreta e vem do ambiente. Ajuste websiteURL e websiteKey para sua aplicação autorizada."
          : "Dry-run works without a key or network access. The Turnstile payload websiteKey is public and belongs to the test widget; clientKey is your secret credential and comes from the environment. Set websiteURL and websiteKey for your authorized application.",
      ),
      ...environment(locale),
      h(pt ? "Executar a integração" : "Run the integration"),
      code(
        "bash",
        "node examples/javascript/solve.mjs --task payloads/turnstile.json --output solution.json",
      ),
      p(
        pt
          ? "O programa cria uma única tarefa, mostra o taskId e consulta seu resultado. A solução só é gravada quando você informa --output; o arquivo precisa ser novo. Não publique tokens, cookies ou esse arquivo no GitHub."
          : "The program creates a single task, prints taskId and polls its result. The solution is saved only when you pass --output; the file must be new. Do not publish tokens, cookies or this file on GitHub.",
      ),
      h(
        pt
          ? "Usar o cliente na sua aplicação"
          : "Use the client in your application",
      ),
      p(
        pt
          ? "O cliente está no arquivo examples/javascript/client.mjs do repositório. O import abaixo funciona a partir da raiz do projeto clonado; não depende de um pacote npm da SoluCaptcha."
          : "The client is the examples/javascript/client.mjs file in this repository. This import works from the cloned project root; it does not depend on a SoluCaptcha npm package.",
      ),
      code(
        "javascript",
        `import { SoluCaptchaClient } from "./examples/javascript/client.mjs";\n\nconst client = SoluCaptchaClient.fromEnv();\nconst taskId = await client.createTask(${JSON.stringify(task, null, 2)});\nconst result = await client.waitForResult(taskId);\nconst solution = result.solution;\n// Use solution in your authorized server-side application.`,
      ),
      h(
        pt
          ? "Retomar uma tarefa e consultar saldo"
          : "Resume a task and check balance",
      ),
      code(
        "bash",
        "node examples/javascript/solve.mjs --task-id YOUR_TASK_ID --output solution.json\nnode examples/javascript/balance.mjs\nnode examples/javascript/health.mjs",
      ),
      ...lifecycle(locale),
      h(
        pt
          ? "Testar sem chamar a API real"
          : "Test without calling the real API",
      ),
      code("bash", "npm test\nnode tools/check-repository.mjs"),
      p(
        pt
          ? "Os testes usam HTTP simulado, validam erros mesmo quando o HTTP é 200, timeout, redirects e a ausência de repetição automática de createTask. Eles verificam o contrato do cliente, não a eficácia contra desafios reais."
          : "Tests mock HTTP and cover API errors even when HTTP is 200, deadlines, redirects and the absence of automatic createTask retries. They check the client contract, not effectiveness against real challenges.",
      ),
      links([
        link(
          pt ? "Arquivos JavaScript no GitHub" : "JavaScript source on GitHub",
          repo + "/tree/main/examples/javascript",
        ),
        link(
          pt ? "Status dos serviços" : "Service status",
          `https://solucaptcha.com/${locale}/status`,
        ),
      ]),
    ],
  };
}
function pricing(locale) {
  const pt = locale === "pt-br";
  return {
    title: pt
      ? "Preços e serviços disponíveis"
      : "Pricing and available services",
    description: pt
      ? "Entenda o catálogo público da SoluCaptcha, os tipos de tarefa, preços em USD por 1.000 resoluções, saldo, reservas e disponibilidade."
      : "Understand the SoluCaptcha public catalog, task types, USD prices per 1,000 resolutions, balance, reservations and live availability.",
    blocks: [
      p(
        pt
          ? "Os preços são administrados no catálogo da SoluCaptcha e podem mudar. A tabela ao vivo no site e o endpoint público abaixo são as referências para os valores atuais; este guia e o GitHub não fixam uma tabela de preços que possa ficar desatualizada."
          : "Prices are managed in the SoluCaptcha catalog and may change. The live table on the website and the public endpoint below are the references for current values; this guide and GitHub do not freeze a price list that could become stale.",
      ),
      p(
        pt
          ? "As tarefas e o saldo usam a API em https://api.solucaptcha.com. O catálogo público de preços é fornecido pelo site em https://solucaptcha.com/api/portal/catalog e não exige chave."
          : "Tasks and balance use the API at https://api.solucaptcha.com. The public pricing catalog is served by the website at https://solucaptcha.com/api/portal/catalog and requires no API key.",
      ),
      links([
        link(
          pt ? "Tabela de preços atual" : "Current pricing",
          `https://solucaptcha.com/${locale}/pricing`,
        ),
        link(
          pt ? "Catálogo público em JSON" : "Public JSON catalog",
          "https://solucaptcha.com/api/portal/catalog",
        ),
        link(
          pt ? "Status e incidentes" : "Status and incidents",
          `https://solucaptcha.com/${locale}/status`,
        ),
      ]),
      h(
        pt
          ? "Serviços e identificadores de tarefa"
          : "Services and task identifiers",
      ),
      table(
        [pt ? "Serviço" : "Service", "task.type"],
        [
          ["Cloudflare Turnstile", "turnstile"],
          ["Cloudflare Challenge", "interstitial"],
          ["Akamai Bot Manager", "akamai"],
          ["PerimeterX", "perimeterx"],
          ["DataDome", "datadome"],
          ["Imperva / Incapsula", "imperva"],
          ["BotBye", "botbye"],
          ["Aliyun Captcha", "aliyun"],
          ["AWS WAF CAPTCHA", "awswaf"],
        ],
      ),
      p(
        pt
          ? "Ter um preço publicado não significa que o serviço está operacional. Consulte o status antes de integrar. OCR / Image to text recebe dados de imagem e está fora do escopo destes exemplos baseados em URL. Consulte o status atual e o contrato correspondente antes de usar OCR. Um health positivo descreve infraestrutura disponível, não uma taxa de sucesso garantida."
          : "A published price does not mean a service is operational. Check live status before integrating. OCR / Image to text accepts image data and is outside the scope of these URL-based examples. Check current status and the corresponding contract before using OCR. Healthy metadata describes infrastructure availability, not a guaranteed success rate.",
      ),
      h(
        pt
          ? "Entender USD por 1.000 resoluções"
          : "Understand USD per 1,000 resolutions",
      ),
      p(
        pt
          ? "pricePerThousandCents representa centavos de USD por 1.000 resoluções. Divida por 100 para obter USD por 1.000. Para estimar uma única resolução, divida esse valor em USD por 1.000. Exemplo apenas matemático: se o campo fosse 100, seriam US$1,00 por 1.000, ou US$0,001 por resolução. Esse exemplo não é uma cotação de serviço."
          : "pricePerThousandCents is USD cents per 1,000 resolutions. Divide by 100 to obtain USD per 1,000. To estimate one resolution, divide that USD value by 1,000. Mathematical example only: if the field were 100, that would mean US$1.00 per 1,000, or US$0.001 per resolution. This example is not a service quote.",
      ),
      h(pt ? "Consultar preços com JavaScript" : "Read prices with JavaScript"),
      code(
        "javascript",
        `const response = await fetch("https://solucaptcha.com/api/portal/catalog", {\n  redirect: "error", signal: AbortSignal.timeout(15000),\n  headers: { Accept: "application/json", "User-Agent": "SoluCaptcha-Examples/1.0" }\n});\nif (!response.ok) throw new Error("HTTP " + response.status);\nconst { items } = await response.json();\nfor (const item of items) {\n  console.log(item.name, "USD / 1000:", item.pricePerThousandCents / 100);\n}`,
      ),
      h(pt ? "Consultar preços com Python" : "Read prices with Python"),
      code(
        "python",
        `import json\nfrom urllib.request import Request, urlopen\n\nrequest = Request("https://solucaptcha.com/api/portal/catalog", headers={\n    "Accept": "application/json", "User-Agent": "SoluCaptcha-Examples/1.0"\n})\nwith urlopen(request, timeout=15) as response:\n    catalog = json.load(response)\nfor item in catalog["items"]:\n    print(item["name"], "USD / 1000:", item["pricePerThousandCents"] / 100)`,
      ),
      p(
        pt
          ? "O catálogo é público e não recebe sua chave. Os campos públicos são name, description, pricePerThousandCents e estimatedSeconds. Tempos estimados variam por desafio e não são SLA."
          : "The catalog is public and does not receive your key. Public fields are name, description, pricePerThousandCents and estimatedSeconds. Estimated times vary by challenge and are not an SLA.",
      ),
      h(
        pt
          ? "Reservas, cobranças e saldo"
          : "Reservations, charges and balance",
      ),
      list(
        pt
          ? [
              "A criação de tarefa pode reservar créditos e reduzir temporariamente o saldo disponível.",
              "Sucesso confirma a cobrança; falha libera a reserva após a confirmação financeira.",
              "Consulte cost para a cobrança confirmada; reservedCost pode informar a reserva de uma tarefa ativa.",
              "O saldo disponível é compartilhado pelas chaves da mesma conta. Mudanças de preço posteriores não alteram o preço já reservado de uma tarefa.",
            ]
          : [
              "Creating a task can reserve credits and temporarily reduce available balance.",
              "Success confirms the charge; failure releases the reservation after financial confirmation.",
              "Read cost for the confirmed charge; reservedCost can describe an active task reservation.",
              "Available balance is shared by keys in the same account. Later price changes do not alter an existing task reservation.",
            ],
      ),
      links([
        link(
          "getBalance",
          `https://solucaptcha.com/${locale}/docs/get-balance`,
        ),
        link(
          pt ? "Depósitos e saldo" : "Deposits and balance",
          `https://solucaptcha.com/${locale}/docs/deposits`,
        ),
        link(
          pt ? "Demos dos serviços" : "Service demos",
          `https://solucaptcha.com/${locale}/demos`,
        ),
        link("GitHub", repo),
      ]),
    ],
  };
}
export const updatedAt = "2026-10-17";
export const guides = Object.fromEntries(
  ["pt-br", "en-us"].map((locale) => [
    locale,
    {
      "guides/python": python(locale),
      "guides/javascript": javascript(locale),
      "guides/pricing-and-services": pricing(locale),
    },
  ]),
);
