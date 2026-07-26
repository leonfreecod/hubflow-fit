# HubFlow Fit

MVP de uma plataforma de gestão para treinadores e assessorias esportivas. A aplicação centraliza alunos, agenda, planos de treino e pagamentos — atividades que normalmente ficam espalhadas entre WhatsApp, Excel, Google Agenda, PDFs e PIX.

## Problema

Muitos treinadores administram o negócio com ferramentas desconectadas:

- WhatsApp para comunicação;
- Excel para pagamentos;
- Google Agenda para horários;
- PDFs para prescrição de treino;
- PIX para recebimentos.

O HubFlow organiza esse fluxo em uma experiência única para **administradores** e **alunos**.

## Funcionalidades

### Administrador

- dashboard com indicadores e gráficos;
- cadastro, edição, busca e remoção de alunos;
- agenda de sessões, avaliações e treinos em grupo;
- criação de planos de treino e vínculo com alunos;
- controle de cobranças, pagamentos e inadimplência;
- configurações da assessoria;
- restauração dos dados demonstrativos.

### Aluno

- painel pessoal de evolução;
- acesso aos programas de treino;
- agenda individual;
- mensalidade, chave PIX e histórico de pagamentos;
- edição de dados pessoais e objetivo.

## Contas demonstrativas

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@hubflow.fit` | `hubflow123` |
| Aluno | `aluno@hubflow.fit` | `hubflow123` |

## Arquitetura

O projeto foi criado em módulos desde o início, evitando uma aplicação concentrada em um único arquivo.

```text
src/
├── app/                    # Inicialização e rotas
├── components/
│   ├── navigation/         # Sidebar e Topbar
│   └── ui/                 # Button, Card, Badge, Modal...
├── config/                 # Nome e branding centralizados
├── data/mocks/             # Dados demonstrativos
├── domain/                 # Entidades e tipos de negócio
├── features/auth/          # Sessão, login e proteção de rotas
├── hooks/                  # Hooks reutilizáveis
├── layouts/                # Layout da área autenticada
├── pages/
│   ├── admin/              # Páginas do treinador/assessoria
│   ├── auth/               # Login
│   └── student/            # Portal do aluno
├── services/
│   ├── repositories/       # Contratos e implementações de dados
│   └── storage/            # Persistência local
├── styles/                 # Design system e responsividade
└── utils/                  # Formatação pt-BR
```

### Fluxo de dados

```text
Página / Componente
        ↓
Hook ou caso de uso da funcionalidade
        ↓
Contrato de Repository
        ↓
LocalStorage ou API Spring Boot
```

O frontend seleciona a implementação local ou HTTP por `VITE_DATA_SOURCE`, mantendo as páginas e componentes desacoplados da origem dos dados.

## Tecnologias

- React + TypeScript;
- Vite;
- React Router;
- Recharts;
- Lucide React;
- CSS responsivo;
- LocalStorage com repositories.
- Java 21 + Spring Boot;
- PostgreSQL/H2 e Flyway;
- Spring Security com JWT.

## Como executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Executar com a API Spring Boot

Inicie o backend com H2 para desenvolvimento:

```bash
cd backend
mvn spring-boot:run
```

Em outro terminal, crie `.env` a partir do exemplo e inicie o frontend:

```bash
cp .env.example .env
npm run dev
```

Para executar backend e PostgreSQL em contêineres, use `docker compose up --build`
na raiz. Consulte também [`backend/README.md`](backend/README.md).

### Build de produção

```bash
npm run build
npm run preview
```

## Identidade visual

- Background: `#111111`
- Cards: `#1A1A1A`
- Amarelo principal: `#FFD54A`
- Texto: `#F5F5F5`
- Cinza: `#808080`

A linguagem visual é premium, escura e minimalista, sem replicar diretamente a identidade de academias existentes.

## Próximas evoluções

1. envio real de cobranças e integração PIX;
2. comunicação entre treinador e aluno;
3. upload e versionamento de treinos;
4. indicadores em Power BI;
5. deploy com Nginx e CI/CD.

## Aviso

Projeto fictício para portfólio. Dados, pessoas e organização são demonstrativos.
