# HubFlow Fit API

API do HubFlow Fit construída com Java 21, Spring Boot, Maven, Flyway e
PostgreSQL. O frontend React permanece na raiz do repositório.

## Requisitos

- JDK 21
- Maven 3.9+
- Docker com Docker Compose (para a execução em contêineres)

## Desenvolvimento local

O perfil padrão é `dev` e usa um banco H2 persistido em `backend/data/`.

```bash
cd backend
mvn spring-boot:run
```

A API fica disponível em `http://localhost:8080`. Para executar os testes:

```bash
cd backend
mvn test
```

## Backend e PostgreSQL com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

Esse comando inicia apenas o PostgreSQL e o backend com o perfil local
`docker`, incluindo as contas e os dados demonstrativos. O frontend continua
sendo executado separadamente a partir da raiz. Para encerrar os contêineres:

```bash
docker compose down
```

Os dados do PostgreSQL ficam no volume nomeado
`hubflow_postgres_data`. `docker compose down` preserva esse volume.

Os valores padrão do Compose são adequados apenas para desenvolvimento local.
Antes de usar a imagem em outro ambiente, defina senhas e segredo JWT próprios.

Exemplo:

```bash
export HUBFLOW_POSTGRES_PASSWORD='uma-senha-forte'
export HUBFLOW_JWT_SECRET='um-segredo-longo-e-aleatorio-com-pelo-menos-32-bytes'
docker compose up --build
```

## Empacotamento e execução em produção

Gere o artefato com Java 21:

```bash
cd backend
mvn clean package
```

Depois configure o ambiente e execute o JAR:

```bash
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL='jdbc:postgresql://localhost:5432/hubflow'
export DATABASE_USERNAME='hubflow'
export DATABASE_PASSWORD='uma-senha-forte'
export JWT_SECRET='um-segredo-longo-e-aleatorio-com-pelo-menos-32-bytes'
export CORS_ALLOWED_ORIGIN='https://app.exemplo.com'
java -jar target/hubflow-fit-api-1.0.0.jar
```

O `Dockerfile` usa build em múltiplas etapas, compila com Java 21 e executa a
aplicação como usuário sem privilégios. `JAVA_TOOL_OPTIONS` pode ser usado para
configurar opções da JVM sem alterar a imagem.

## Variáveis da aplicação

| Variável | Padrão | Uso |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` | `docker` no Compose; use `prod` em produção |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/hubflow` no perfil `prod` | URL JDBC |
| `DATABASE_USERNAME` | `hubflow` | Usuário do banco |
| `DATABASE_PASSWORD` | `hubflow` | Senha do banco; deve ser alterada fora do ambiente local |
| `JWT_SECRET` | segredo somente nos perfis locais | Obrigatório em `prod`; use um valor longo e aleatório |
| `JWT_EXPIRATION_MINUTES` | `480` | Validade do token em minutos |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origem permitida para o frontend |
| `PORT` | `8080` | Porta HTTP da API |
| `JAVA_TOOL_OPTIONS` | vazio | Opções adicionais da JVM |

## Variáveis do Docker Compose

As variáveis abaixo configuram os contêineres e têm o prefixo `HUBFLOW_` para
não conflitar com variáveis do frontend:

| Variável | Padrão |
| --- | --- |
| `HUBFLOW_POSTGRES_DB` | `hubflow` |
| `HUBFLOW_POSTGRES_USER` | `hubflow` |
| `HUBFLOW_POSTGRES_PASSWORD` | `hubflow_dev` |
| `HUBFLOW_POSTGRES_PORT` | `5432` |
| `HUBFLOW_BACKEND_PORT` | `8080` |
| `HUBFLOW_JWT_SECRET` | segredo somente para desenvolvimento local |
| `HUBFLOW_JWT_EXPIRATION_MINUTES` | `480` |
| `HUBFLOW_CORS_ALLOWED_ORIGIN` | `http://localhost:5173` |
