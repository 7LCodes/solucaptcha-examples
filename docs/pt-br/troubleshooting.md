# Solução de problemas

| Sintoma | Ação |
| --- | --- |
| `Set SOLUCAPTCHA_API_KEY` | Configure a variável no terminal/servidor. .env.example não é carregado automaticamente. |
| `HTTP_429` | Reduza a frequência de consultas e verifique os limites da sua conta. |
| `UNEXPECTED_CONTENT_TYPE` | Uma página HTML ou proteção de borda substituiu o JSON. Confira o domínio e o status; não desative validação TLS. |
| `POLL_TIMEOUT_RESUME_EXISTING_TASK` | Retome com --task-id; não crie outra tarefa. |
| `NETWORK_ERROR_CHECK_DASHBOARD_BEFORE_RECREATING_TASK` | A resposta da criação pode ter se perdido. Confira o dashboard antes de recriar. |
| `ERROR_UNSUPPORTED_TASK` | Confira task.type e o status. OCR está excluído dos exemplos. |
| `File exists` / `EEXIST` | Use outro nome para --output; os exemplos não sobrescrevem soluções existentes. |

Ao pedir suporte, envie apenas taskId e código de erro. Não publique chaves, cookies ou soluções em issues. Logs de health indicam disponibilidade de infraestrutura e não garantem sucesso em um desafio.

[Status](https://solucaptcha.com/pt-br/status) · [Suporte](https://solucaptcha.com/pt-br/contact) · [HTTP](http-reference.md)
