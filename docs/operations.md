# Operação do HubFlow Fit

Este runbook cobre a pilha `docker-compose.prod.yml`. Execute os comandos a partir da raiz do repositório.

## Pré-requisitos

- host Linux atualizado com Docker Engine e Compose v2;
- DNS apontando para o proxy reverso;
- TLS válido na origem pública;
- armazenamento persistente e monitorado para o volume PostgreSQL;
- cópia externa e criptografada dos backups.

Gere segredos independentes, por exemplo com `openssl rand -base64 48`. Não reutilize senha do banco, segredo JWT ou segredo do webhook.

## Primeiro deploy

```bash
cp .env.prod.example .env.prod
chmod 600 .env.prod
# Preencha todos os valores.
docker compose --env-file .env.prod -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build --wait
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

O Nginx da aplicação atende HTTP na porta `APP_PORT`; TLS deve terminar no proxy externo. Encaminhe `Host`, `X-Forwarded-For` e `X-Forwarded-Proto`. A origem pública precisa ser idêntica a `APP_ORIGIN`.

## Atualização

1. Faça e verifique um backup.
2. Revise as migrations novas; elas são aplicadas automaticamente antes de a API ficar saudável.
3. Construa e suba as imagens.
4. Verifique saúde, logs e um login real.

```bash
COMPOSE_ENV_FILE=.env.prod ./scripts/backup-database.sh docker-compose.prod.yml
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build --wait
docker compose --env-file .env.prod -f docker-compose.prod.yml logs --tail=200 backend
curl --fail --silent http://127.0.0.1:8080/healthz # ajuste se APP_PORT mudou
```

Migrations Flyway devem avançar somente para a frente. Para uma mudança destrutiva, adote migração em fases compatível com a versão anterior da aplicação.

## Saúde e observabilidade

Monitore pelo menos:

- disponibilidade de `/healthz` e `/api` pelo domínio público;
- `/actuator/health` internamente;
- reinícios e estado `unhealthy` dos três contêineres;
- espaço do volume e duração dos backups;
- respostas 401/403/429 e erros 5xx nos logs;
- expiração do certificado TLS.

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.prod.yml logs --since=30m backend frontend
```

Os logs padrão não substituem uma plataforma centralizada. Em ambiente comercial, encaminhe logs e métricas a um coletor com retenção, alertas e proteção de dados pessoais.

## Backup

O script gera um dump PostgreSQL customizado em `backups/` por padrão:

```bash
COMPOSE_ENV_FILE=.env.prod ./scripts/backup-database.sh docker-compose.prod.yml
```

Copie o arquivo para armazenamento externo criptografado, aplique retenção e teste a restauração periodicamente. Um backup que nunca foi restaurado não deve ser considerado validado.

## Restauração

A restauração apaga e recria objetos existentes no banco selecionado e interrompe temporariamente frontend/backend. Confirme o arquivo, a pilha e uma janela de manutenção antes de executar:

```bash
COMPOSE_ENV_FILE=.env.prod ./scripts/restore-database.sh \
  backups/hubflow-AAAAMMDDTHHMMSSZ.dump \
  docker-compose.prod.yml \
  --confirm
```

Depois, verifique os contêineres, migrations, login e contagens essenciais. Preserve o dump usado e os logs da restauração até encerrar o incidente.

## Rotação de segredos

- `JWT_SECRET`: encerra todas as sessões existentes; atualize e recrie o backend.
- `DATABASE_PASSWORD`: altere primeiro no PostgreSQL e então no arquivo de ambiente, evitando divergência com o volume persistente.
- `PIX_WEBHOOK_SECRET`: coordene a troca com o provedor; durante transição, aceite duas chaves apenas se o adaptador real implementar janela controlada.

Nunca versione `.env.prod`. Restrinja sua leitura ao usuário do serviço.

## Incidente

1. Preserve logs, horário, versão/commit e escopo afetado.
2. Se houver risco a dados ou credenciais, bloqueie acesso e rotacione os segredos atingidos.
3. Não remova volumes durante diagnóstico.
4. Restaure somente a partir de backup validado e com alvo explicitamente conferido.
5. Registre causa raiz, dados afetados e ação preventiva após estabilização.
