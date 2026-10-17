# Integração com JavaScript e Node.js

Integre a SoluCaptcha com Node.js usando fetch nativo, exemplos sem dependências, polling com timeout, saldo e retomada pelo taskId.

Atualizado em 2026-10-17.

Guia para Node.js 22 ou superior, com fetch nativo e sem dependências de execução. Execute os exemplos no servidor; a chave da API não deve ser enviada ao frontend.

A URL base da API é https://api.solucaptcha.com. Os clientes deste repositório enviam JSON por HTTPS para /createTask, /getTaskResult e /getBalance, usando clientKey no corpo da requisição.

## Antes de começar

Crie sua conta, verifique o email e gere uma chave de API no dashboard. Adicione créditos antes de criar tarefas reais. A chave deve permanecer no seu servidor; não coloque a chave no navegador, em URLs, capturas de tela ou commits.

[Gerenciar chaves de API](https://solucaptcha.com/pt-br/dashboard/api-keys) · [Adicionar créditos](https://solucaptcha.com/pt-br/dashboard/credits) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples
```

## Validar sem criar tarefas

```bash
node examples/javascript/solve.mjs --task payloads/turnstile.json --dry-run
```

Dry-run funciona sem chave e sem rede. A chave websiteKey do payload Turnstile é pública e pertence ao widget de teste; clientKey é sua credencial secreta e vem do ambiente. Ajuste websiteURL e websiteKey para sua aplicação autorizada.

## Configurar a chave no ambiente

No terminal do seu servidor, escolha o comando do seu sistema. Substitua YOUR_API_KEY pela sua chave. O arquivo .env.example é uma referência: os exemplos não carregam arquivos .env automaticamente.

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

## Executar a integração

```bash
node examples/javascript/solve.mjs --task payloads/turnstile.json --output solution.json
```

O programa cria uma única tarefa, mostra o taskId e consulta seu resultado. A solução só é gravada quando você informa --output; o arquivo precisa ser novo. Não publique tokens, cookies ou esse arquivo no GitHub.

## Usar o cliente na sua aplicação

O cliente está no arquivo examples/javascript/client.mjs do repositório. O import abaixo funciona a partir da raiz do projeto clonado; não depende de um pacote npm da SoluCaptcha.

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

## Retomar uma tarefa e consultar saldo

```bash
node examples/javascript/solve.mjs --task-id YOUR_TASK_ID --output solution.json
node examples/javascript/balance.mjs
node examples/javascript/health.mjs
```

## Como o fluxo funciona

- POST /createTask recebe clientKey e task e retorna taskId. Crie a tarefa uma única vez.
- POST /getTaskResult recebe clientKey e o mesmo taskId. Aguarde pending ou processing até completed.
- Use solution quando status for completed. Erros também podem vir com HTTP 200 e errorId diferente de zero.
- Se a consulta atingir o timeout, retome pelo taskId já criado. Não crie outra tarefa automaticamente. Se a resposta da criação se perder, confira o dashboard antes de tentar novamente.

[createTask](https://solucaptcha.com/pt-br/docs) · [getTaskResult](https://solucaptcha.com/pt-br/docs/get-task-result) · [Códigos de erro](https://solucaptcha.com/pt-br/docs/api-error-types)

## Testar sem chamar a API real

```bash
npm test
node tools/check-repository.mjs
```

Os testes usam HTTP simulado, validam erros mesmo quando o HTTP é 200, timeout, redirects e a ausência de repetição automática de createTask. Eles verificam o contrato do cliente, não a eficácia contra desafios reais.

[Arquivos JavaScript no GitHub](https://github.com/7LCodes/solucaptcha-examples/tree/main/examples/javascript) · [Status dos serviços](https://solucaptcha.com/pt-br/status)
