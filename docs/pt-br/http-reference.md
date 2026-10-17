# Referência HTTP pública

Origem da API: `https://api.solucaptcha.com`. As operações autenticadas usam `clientKey` no corpo JSON de uma requisição POST. Mantenha a chave no servidor.

| Endpoint | Método | Finalidade | Chave de API |
| --- | --- | --- | --- |
| `/health` | GET | Metadados públicos dos serviços | Não |
| `/getBalance` | POST | Saldo disponível da conta em USD | Sim |
| `/createTask` | POST | Criar uma única tarefa; retorna `taskId` | Sim |
| `/getTaskResult` | POST | Consultar uma tarefa existente | Sim |

## Criar tarefa

```json
{"clientKey":"YOUR_API_KEY","task":{"type":"turnstile","websiteURL":"https://solucaptcha.com/en-us/demos/turnstile","websiteKey":"1x00000000000000000000AA"}}
```

## Consultar resultado

```json
{"clientKey":"YOUR_API_KEY","taskId":"YOUR_TASK_ID"}
```

`pending` e `processing` não são finais. `completed` inclui `solution`. `failed` é final. HTTP 200 sozinho não indica sucesso: verifique `errorId === 0` e trate `errorCode` em caso de falha. Os clientes exibem códigos de erro seguros, sem registrar os corpos das requisições ou respostas.

Não repita `createTask` automaticamente depois de um timeout: a tarefa pode já existir. Guarde taskId quando houver e retome a consulta. Se a criação não retornou um ID, confira seu dashboard antes de criar outra tarefa.

O catálogo público é separado: GET `https://solucaptcha.com/api/portal/catalog`, sem `clientKey`. A publicação no catálogo não comprova disponibilidade ao vivo. Rotas privadas de operador, webhooks, sessão e infraestrutura não fazem parte dos exemplos.

[Documentação completa](https://solucaptcha.com/pt-br/docs) · [Códigos de erro](https://solucaptcha.com/pt-br/docs/api-error-types) · [Guia de preços](pricing-and-services.md)
