# HubFlow Fit API

API multiempresa em Java 21, Spring Boot 3.5, Spring Security, JPA, Flyway e PostgreSQL/H2.

## Perfis

| Perfil   | Banco/efeito                                                        | Uso                                                       |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `dev`    | H2 persistente                                                      | desenvolvimento local                                     |
| `demo`   | cria organização, usuários e dados fictícios; registra links no log | demonstração local ou portfólio explicitamente habilitado |
| `docker` | PostgreSQL configurado por ambiente                                 | Compose local                                             |
| `prod`   | PostgreSQL obrigatório, cookie seguro, Swagger e seed desativados   | produção                                                  |
| `test`   | H2 isolado                                                          | testes automatizados                                      |

O padrão é `dev,demo`. O Compose local ativa `docker,demo`; o Compose de produção ativa apenas `prod`, salvo quando uma implantação de portfólio habilita deliberadamente `prod,demo` e a conta pública somente leitura.

## Execução local

```bash
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`, aplica as migrations e expõe:

- saúde: `/actuator/health`;
- especificação: `/v3/api-docs`;
- interface: `/swagger-ui/index.html`.

O perfil `prod` desabilita os dois endpoints do Springdoc.

## Autenticação

O login retorna os dados do usuário e grava o JWT no cookie `hubflow_session`. O token não é persistido no LocalStorage. Requisições inseguras autenticadas por cookie precisam enviar o cookie `XSRF-TOKEN` também no cabeçalho `X-XSRF-TOKEN`; o frontend faz essa sincronização antes de cada mutação.

O backend ainda aceita Bearer JWT para clientes não baseados em navegador. Login tem limitação de tentativas em memória. Convites e redefinições usam tokens aleatórios armazenados somente como hash, com expiração e uso único.

## Recursos HTTP

| Prefixo                   | Responsabilidade                              |
| ------------------------- | --------------------------------------------- |
| `/api/auth`               | login, sessão, CSRF, logout, ativação e senha |
| `/api/students`           | alunos e convites                             |
| `/api/payments`           | cobranças, baixa e PIX simulado               |
| `/api/schedule`           | agenda, recorrência e transições              |
| `/api/workouts`           | planos, sessões, exercícios e conclusões      |
| `/api/organization`       | configurações da organização                  |
| `/api/dashboard`          | receita e progresso                           |
| `/api/webhooks/pix/local` | webhook idempotente do provedor PIX local     |

Administradores acessam apenas a própria organização. Alunos veem e alteram apenas os recursos associados ao próprio cadastro. Validações de domínio impedem, entre outros casos, cobrança não positiva, pagamento futuro, conflitos de agenda e transições inválidas.

## Testes e cobertura

```bash
mvn test
mvn verify
```

`verify` executa testes de contexto e integração, gera `target/site/jacoco/index.html` e, quando Docker compatível está disponível, valida V1–V7 em PostgreSQL real via Testcontainers. Sem Docker, apenas esse teste é marcado como ignorado.

## Variáveis

| Variável                            | Padrão local                       | Produção                           |
| ----------------------------------- | ---------------------------------- | ---------------------------------- |
| `SPRING_PROFILES_ACTIVE`            | `dev,demo`                         | `prod`                             |
| `DATABASE_URL`                      | H2 pelo perfil `dev`               | obrigatória                        |
| `DATABASE_USERNAME`                 | `sa`                               | obrigatória                        |
| `DATABASE_PASSWORD`                 | vazia                              | obrigatória                        |
| `JWT_SECRET`                        | segredo somente de desenvolvimento | obrigatório, aleatório e ≥32 bytes |
| `JWT_EXPIRATION_MINUTES`            | `60`                               | `30` no Compose                    |
| `CORS_ALLOWED_ORIGIN`               | `http://localhost:5173`            | origem HTTPS exata                 |
| `APP_FRONTEND_URL`                  | `http://localhost:5173`            | origem pública                     |
| `PIX_WEBHOOK_SECRET`                | segredo local                      | obrigatório e exclusivo            |
| `AUTH_COOKIE_SECURE`                | `false`                            | forçado para `true`                |
| `LOGIN_MAX_FAILURES`                | `5`                                | configurável                       |
| `LOGIN_FAILURE_WINDOW_MINUTES`      | `10`                               | configurável                       |
| `LOGIN_BLOCK_MINUTES`               | `15`                               | configurável                       |
| `INVITATION_EXPIRATION_HOURS`       | `72`                               | configurável                       |
| `PASSWORD_RESET_EXPIRATION_MINUTES` | `30`                               | configurável                       |
| `PORTFOLIO_DEMO_ENABLED`            | `false`                            | habilite somente para portfólio    |
| `PORTFOLIO_DEMO_EMAIL`              | `demo@hubflow.fit`                 | credencial pública configurável    |
| `PORTFOLIO_DEMO_PASSWORD`           | vazia                              | obrigatória quando habilitado      |
| `PORT`                              | `8080`                             | configurável                       |

## Migrations

Flyway é a única fonte de evolução do esquema e Hibernate usa `ddl-auto=validate`. Nunca edite uma migration já aplicada: crie a próxima `V<N>__descricao.sql`. Antes de publicar, execute `mvn verify` e valide a atualização sobre uma cópia recente do banco.

## Integrações

`LocalPixProvider`, `ConfigurableLogNotificationGateway` e `LocalCalendarGateway` são adaptadores locais. Para operação real, implemente as respectivas interfaces, trate assinatura/replay do provedor escolhido e acrescente testes de contrato antes de ativar o adaptador no perfil de produção.
