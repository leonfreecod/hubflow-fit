# HubFlow Fit

Plataforma de gestão para treinadores e assessorias esportivas. O HubFlow Fit reúne alunos, agenda, treinos, cobranças e portal do aluno em uma aplicação React conectada a uma API Spring Boot multiempresa.

## O que está implementado

### Administrador

- dashboard calculado a partir dos dados da organização;
- CRUD, busca e convite de alunos;
- cobranças com regras de vencimento, baixa e geração de PIX simulado;
- agenda com recorrência, conflito de horários, cancelamento e conclusão;
- planos de treino estruturados em sessões e exercícios;
- configurações da organização;
- isolamento de dados por organização em todos os serviços.

### Aluno

- painel pessoal, perfil e progresso;
- agenda individual;
- treinos prescritos e conclusão de sessões;
- histórico financeiro e geração de cobrança PIX simulada;
- ativação por convite e redefinição de senha.

### Segurança e operação

- sessão JWT em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção;
- proteção CSRF para mutações autenticadas por cookie;
- rate limit de tentativas de login;
- tokens de convite/redefinição com validade e uso único;
- migrations Flyway V1–V7 e validação de esquema pelo Hibernate;
- healthchecks, imagens sem usuário root, perfis demo/produção separados;
- OpenAPI no desenvolvimento, CI, testes unitários, integração e E2E.

## Limites das integrações atuais

O PIX é uma implementação local simulada, identificada dessa forma na interface. Notificações de convite/lembrete são enviadas a uma porta desacoplada que, no perfil demo, registra os links no log. A agenda também usa um gateway local. As interfaces `PixProvider`, `NotificationGateway` e `CalendarGateway` são os pontos de extensão para provedores reais; nenhum deles deve ser tratado como integração financeira, e-mail ou calendário de produção.

## Início rápido com Docker

Requisitos: Docker Engine com Compose v2. A pilha completa expõe frontend, API e PostgreSQL.

```bash
cp .env.example .env
# Substitua DB_PASSWORD, JWT_SECRET e PIX_WEBHOOK_SECRET.
docker compose up -d --build --wait
```

Acesse:

- aplicação: `http://localhost:5173`;
- API: `http://localhost:8080/api`;
- saúde: `http://localhost:8080/actuator/health`;
- OpenAPI: `http://localhost:8080/swagger-ui/index.html`;
- PostgreSQL: `localhost:5433`.

Contas criadas somente pelo perfil `demo`:

| Perfil        | E-mail              | Senha        |
| ------------- | ------------------- | ------------ |
| Administrador | `admin@hubflow.fit` | `hubflow123` |
| Aluno         | `aluno@hubflow.fit` | `hubflow123` |

Para encerrar preservando o banco:

```bash
docker compose down
```

`docker compose down --volumes` também remove definitivamente o volume PostgreSQL.

> Se `DB_PASSWORD` mudar depois da primeira inicialização, o PostgreSQL continuará com a credencial gravada no volume existente. Atualize a senha no banco ou recrie deliberadamente o volume apenas quando os dados puderem ser descartados.

## Desenvolvimento local

Requisitos: Node.js 24, JDK 21 e Maven 3.9+.

### Frontend

```bash
npm ci
cp .env.example .env
npm run dev
```

O modo recomendado é `VITE_DATA_SOURCE=api`. `VITE_API_URL` pode apontar para `http://localhost:8080` no Vite ou ser `/api` quando servido pelo Nginx do projeto. A implementação LocalStorage continua disponível com `VITE_DATA_SOURCE=local`, exclusivamente para prototipação sem backend.

### Backend com H2

O perfil padrão `dev,demo` usa H2 persistente em `backend/data/`:

```bash
mvn -f backend/pom.xml spring-boot:run
```

Para trabalhar com PostgreSQL, prefira a pilha Docker completa. A API e os detalhes dos perfis estão em [backend/README.md](backend/README.md).

## Verificações

```bash
npm run check             # lint + TypeScript + Vitest + build
npm run test:coverage     # relatório em coverage/
mvn -f backend/pom.xml verify
npm run e2e               # requer a pilha em localhost:5173
```

O E2E Chromium percorre CRUD de alunos, pagamentos, agenda e treinos contra a API e o PostgreSQL reais. O teste `PostgresMigrationTest` usa Testcontainers e é ignorado automaticamente quando nenhum daemon compatível está disponível. O workflow em `.github/workflows/ci.yml` executa as três frentes em cada pull request e push na `main`.

## Produção

Por padrão, o arquivo de produção não ativa seed demo, não publica o PostgreSQL, desabilita Swagger e exige cookies seguros.

```bash
cp .env.prod.example .env.prod
# Preencha os segredos e use uma origem HTTPS real.
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build --wait
```

Coloque um proxy reverso com TLS na frente da porta `APP_PORT`. `APP_ORIGIN` deve coincidir exatamente com a origem pública HTTPS. Nunca use as credenciais demonstrativas nem os valores de exemplo em uma operação com dados reais.

### Portfólio público opcional

Uma implantação usada exclusivamente como portfólio pode ativar o seed fictício e a conta pública de administrador somente leitura:

```dotenv
SPRING_PROFILES_ACTIVE=prod,demo
PORTFOLIO_DEMO_ENABLED=true
PORTFOLIO_DEMO_EMAIL=demo@hubflow.fit
PORTFOLIO_DEMO_PASSWORD=123456
```

O frontend exibe e preenche essas credenciais. A API permite navegação e consultas, mas bloqueia alterações feitas pela conta pública mesmo que alguém tente chamar os endpoints diretamente. A senha é pública por definição e não deve ser reutilizada em nenhum outro serviço.

Consulte [docs/operations.md](docs/operations.md) para deploy, atualização, observabilidade, backup, restauração e resposta a incidentes.

## Arquitetura

```text
Navegador React
  └── repositories tipados
        └── Nginx /api
              └── Spring Security + controllers
                    └── services com escopo de organização
                          └── JPA / Flyway / PostgreSQL
```

- `src/`: aplicação React, componentes, páginas, repositories e testes;
- `backend/src/main/java`: API, segurança, domínio e integrações;
- `backend/src/main/resources/db/migration`: histórico imutável do banco;
- `e2e/`: smoke test do fluxo administrativo;
- `scripts/`: backup e restauração PostgreSQL;
- `.github/`: CI e atualizações automatizadas de dependências.

## Qualidade ainda incremental

A cobertura unitária do frontend começou pelos utilitários, modal e cliente HTTP; o E2E protege o caminho crítico completo. Novas regras devem vir acompanhadas de testes unitários ou de integração e a cobertura deve crescer sem reduzir a proteção existente.

Projeto fictício para portfólio. Dados, pessoas, organizações e cobranças demonstrativas não representam operações reais.
