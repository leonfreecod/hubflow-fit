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

O ambiente oficial é o arquivo `docker-compose.yml` da raiz do projeto
(`../docker-compose.yml` a partir deste diretório). Na raiz:

```bash
cp .env.example .env
# Edite .env e substitua o valor de DB_PASSWORD.
docker compose up -d --build
```

Esse comando constrói o backend existente, inicia PostgreSQL e API com o perfil
`docker`, aguarda o healthcheck do banco e executa automaticamente as
migrations Flyway. O frontend continua sendo executado separadamente.

Para verificar a inicialização:

```bash
docker compose ps
docker compose logs backend
docker exec -it hubflow-db psql -U hubflow_user -d hubflow -c '\dt'
```

Para encerrar os contêineres:

```bash
docker compose down
```

Os dados do PostgreSQL ficam no volume nomeado
`hubflow_postgres_data`. `docker compose down` preserva esse volume.

No ambiente oficial, o PostgreSQL usa banco `hubflow`, usuário
`hubflow_user`, porta interna `5432` e porta `5433` no host. A senha não fica
no Compose: `DB_PASSWORD` é lida do `.env` da raiz e repassada ao Spring como
`DATABASE_PASSWORD`. O perfil H2 padrão permanece disponível para
desenvolvimento local.

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
export DATABASE_USERNAME='hubflow_user'
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
| `DATABASE_URL` | definida pelo Compose no perfil `docker` | URL JDBC |
| `DATABASE_USERNAME` | `hubflow_user` no Compose oficial | Usuário do banco |
| `DATABASE_PASSWORD` | valor de `DB_PASSWORD` no Compose oficial | Senha do banco |
| `JWT_SECRET` | segredo somente nos perfis locais | Obrigatório em `prod`; use um valor longo e aleatório |
| `JWT_EXPIRATION_MINUTES` | `480` | Validade do token em minutos |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origem permitida para o frontend |
| `PORT` | `8080` | Porta HTTP da API |
| `JAVA_TOOL_OPTIONS` | vazio | Opções adicionais da JVM |

## Variável do Docker Compose oficial

Além das configurações `VITE_*` do frontend, o `.env` da raiz contém a
credencial necessária ao ambiente Docker:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `DB_PASSWORD` | sem padrão | Senha compartilhada pelo PostgreSQL e pelo backend |
