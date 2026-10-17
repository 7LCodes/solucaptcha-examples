# Como integrar a SoluCaptcha em Python

Integre a API SoluCaptcha em Python com exemplos executáveis, chave por variável de ambiente, polling, consulta de saldo e retomada de tarefas.

Atualizado em 2026-10-17.

Guia prático para Python 3.11 ou superior, usando somente a biblioteca padrão. Os exemplos são programas de servidor e usam os endpoints públicos reais da SoluCaptcha.

A URL base da API é https://api.solucaptcha.com. Os clientes deste repositório enviam JSON por HTTPS para /createTask, /getTaskResult e /getBalance, usando clientKey no corpo da requisição.

## Antes de começar

Crie sua conta, verifique o email e gere uma chave de API no dashboard. Adicione créditos antes de criar tarefas reais. A chave deve permanecer no seu servidor; não coloque a chave no navegador, em URLs, capturas de tela ou commits.

[Gerenciar chaves de API](https://solucaptcha.com/pt-br/dashboard/api-keys) · [Adicionar créditos](https://solucaptcha.com/pt-br/dashboard/credits) · [GitHub](https://github.com/7LCodes/solucaptcha-examples)

```bash
git clone https://github.com/7LCodes/solucaptcha-examples.git
cd solucaptcha-examples
```

## Validar o exemplo sem gastar créditos

O modo dry-run valida o JSON sem rede, sem chave e sem criar tarefa. O payload Turnstile usa a chave pública de teste do widget da demo. Para sua aplicação, use uma URL autorizada e a chave pública correspondente.

```bash
python examples/python/solve.py --task payloads/turnstile.json --dry-run
```

## Configurar a chave no ambiente

No terminal do seu servidor, escolha o comando do seu sistema. Substitua YOUR_API_KEY pela sua chave. O arquivo .env.example é uma referência: os exemplos não carregam arquivos .env automaticamente.

```bash
export SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

```powershell
$env:SOLUCAPTCHA_API_KEY="YOUR_API_KEY"
```

## Criar uma tarefa e consultar o resultado

```bash
python examples/python/solve.py --task payloads/turnstile.json --output solution.json
```

O programa mostra o taskId antes de iniciar as consultas. Por padrão, não imprime tokens ou cookies de solução. --output salva a solução em um novo arquivo local e recusa sobrescrever arquivos existentes. Proteja esse arquivo e não o publique.

## Usar o cliente na sua aplicação

O módulo solucaptcha_client.py está em examples/python neste repositório. Coloque-o junto ao seu programa ou ajuste o caminho de importação. Ele é um exemplo local, não um pacote publicado no PyPI.

```python
from solucaptcha_client import SoluCaptchaClient

client = SoluCaptchaClient.from_env()
task = {
    "type": "turnstile",
    "websiteURL": "https://solucaptcha.com/en-us/demos/turnstile",
    "websiteKey": "1x00000000000000000000AA"
}
task_id = client.create_task(task)
result = client.wait_for_result(task_id)
solution = result["solution"]
# Use solution in your authorized server-side application.
```

## Retomar uma consulta e consultar saldo

```bash
python examples/python/solve.py --task-id YOUR_TASK_ID --output solution.json
python examples/python/balance.py
python examples/python/health.py
```

A retomada consulta a tarefa existente, sem criar uma nova. balance.py exige sua chave; health.py consulta metadados públicos e não precisa de chave.

## Como o fluxo funciona

- POST /createTask recebe clientKey e task e retorna taskId. Crie a tarefa uma única vez.
- POST /getTaskResult recebe clientKey e o mesmo taskId. Aguarde pending ou processing até completed.
- Use solution quando status for completed. Erros também podem vir com HTTP 200 e errorId diferente de zero.
- Se a consulta atingir o timeout, retome pelo taskId já criado. Não crie outra tarefa automaticamente. Se a resposta da criação se perder, confira o dashboard antes de tentar novamente.

[createTask](https://solucaptcha.com/pt-br/docs) · [getTaskResult](https://solucaptcha.com/pt-br/docs/get-task-result) · [Códigos de erro](https://solucaptcha.com/pt-br/docs/api-error-types)

## Testes e limites

Execute os testes isolados abaixo. Eles simulam HTTP e não resolvem captchas reais, não precisam de credenciais e não gastam créditos. A disponibilidade e o sucesso de cada desafio devem ser validados no seu caso de uso autorizado.

```bash
python -m unittest discover -s tests/python -v
```

[Arquivos Python no GitHub](https://github.com/7LCodes/solucaptcha-examples/tree/main/examples/python) · [Status dos serviços](https://solucaptcha.com/pt-br/status)
