# MiniCRM

Sistema simplificado de gestão de contatos com autenticação, painel web e automações — desenvolvido como teste técnico para a vaga de Desenvolvedor(a) na Chat2Desk.

## URLs de Produção

| Serviço | URL |
| ------- | --- |
| Frontend | https://minicrm-frontend-39h.pages.dev |
| API Gateway | https://minicrm-gateway-production.romulogrinevald.workers.dev |

## Arquitetura

```
┌──────────────────┐     ┌────────────────────┐     ┌──────────────────────┐
│  Frontend (SPA)  │────▶│  API Gateway       │────▶│  Auth Service        │
│  React + Vite    │     │  Cloudflare Worker  │     │  Node.js + Express   │
│  Cloudflare Pages│     │  (Hono)            │     │  Docker              │
└──────────────────┘     └────────┬───────────┘     └──────────┬───────────┘
                                  │                             │
                                  ▼                             ▼
                         ┌────────────────┐           ┌─────────────────┐
                         │  n8n           │           │  PostgreSQL 18  │
                         │  (Automações)  │           │  + Redis        │
                         └────────────────┘           └─────────────────┘
```

**Backend local:** todos os serviços rodam via Docker Compose com Traefik como reverse proxy.

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose v2
- [Node.js 22](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm i -g wrangler`
- Conta na [Cloudflare](https://www.cloudflare.com/) (apenas para deploy)

---

## Setup Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/minicrm-teste-nutek.git
cd minicrm-teste-nutek
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Valores obrigatórios no `.env`:

| Variável             | Descrição                                      |
| -------------------- | ---------------------------------------------- |
| `POSTGRES_USER`      | Usuário do banco (padrão: `postgres`)          |
| `POSTGRES_PASSWORD`  | Senha do banco (padrão: `1234`)                |
| `POSTGRES_DB`        | Nome do banco (padrão: `minicrm`)              |
| `JWT_SECRET`         | Chave de assinatura JWT — mínimo 32 caracteres |
| `N8N_ENCRYPTION_KEY` | Chave de criptografia do n8n                   |

### 3. Suba todos os serviços

```bash
docker compose up --build
```

Isso sobe: PostgreSQL 18, Redis, Traefik, Auth Service, n8n e pgAdmin.

O serviço `migrate` roda automaticamente e cria as tabelas no banco.

### 4. Configure os workflows do n8n

1. Acesse [http://n8n.localhost](http://n8n.localhost)
   - Login: `admin` / `admin_password`

2. Crie a credencial do banco:
   - **Settings → Credentials → Add Credential → Postgres**
   - Host: `postgres` | Port: `5432` | Database: `minicrm`
   - User: (usuario informado no .env) | Password: (senha informada no .env)
   - Nome: `MiniCRM Postgres`

3. Importe os workflows em **Workflows → (menu) → Import from file**:
   - `n8n/workflows/list-contacts.json`
   - `n8n/workflows/create-contact.json`
   - `n8n/workflows/delete-contact.json`
   - `n8n/workflows/restore-contact.json`

4. Abra cada workflow e clique em **Publish**

### 5. Rode o API Gateway localmente

```bash
cd api-gateway
npm install
```

Crie o arquivo `api-gateway/.dev.vars`:

```env
JWT_SECRET=mesma_chave_do_seu_env
AUTH_SERVICE_URL=http://auth.localhost
N8N_URL=http://n8n.localhost
CORS_ORIGIN=http://localhost:5173
```

> O JWT_SECRET deve ser **exatamente igual** ao do `.env` raiz.

```bash
npx wrangler dev
Worker disponível em http://localhost:8787
```

### 6. Rode o Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8787" > .env.local
npm run dev
# Frontend disponível em http://localhost:5173
```

---

## URLs Locais

| Serviço           | URL                   | Credenciais                |
| ----------------- | --------------------- | -------------------------- |
| Frontend          | http://localhost:5173 | —                          |
| API Gateway       | http://localhost:8787 | —                          |
| Auth Service      | http://auth.localhost | —                          |
| n8n               | http://n8n.localhost  | admin@admin.com / Admin123 |
| pgAdmin           | http://localhost:5050 | admin@admin.com / admin    |
| Traefik Dashboard | http://localhost:8080 | —                          |

---

## Deploy na Cloudflare

### API Gateway (Worker)

```bash
cd api-gateway
npm install
wrangler secret put JWT_SECRET
wrangler deploy --env production
```

### Frontend (Pages)

```bash
cd frontend
npm install
VITE_API_URL=https://seu-worker.workers.dev npm run build
wrangler pages deploy dist --project-name=minicrm-frontend
```

> Para o Worker deployado conseguir acessar o backend local, use o **Cloudflare Tunnel**:
>
> ```bash
> docker compose --profile tunnel up cloudflared
> ```
>
> Configure as URLs públicas geradas no `wrangler.toml` em `[env.production.vars]`.

---

## Estrutura do Projeto

```
minicrm-teste-nutek/
├── auth-service/               # Node.js 22 + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/        # Handlers HTTP (sem lógica de negócio)
│   │   ├── services/           # Lógica de negócio (auth.service.ts)
│   │   ├── middlewares/        # Validação com Zod
│   │   ├── routes/             # Definição de rotas
│   │   └── lib/                # Prisma client, Redis, AppError, schemas Zod
│   ├── prisma/
│   │   └── schema.prisma       # Modelos User e Contact
│   ├── entrypoint.sh           # Script de inicialização do container
│   └── Dockerfile              # Multi-stage build (node:22-slim)
├── api-gateway/                # Cloudflare Worker + Hono
│   ├── src/
│   │   ├── middlewares/        # Autenticação JWT com jose (edge-compatible)
│   │   ├── routes/             # Proxy para Auth Service (auth.routes.ts)
│   │   └── index.ts            # Rotas de contatos inline + CORS
│   └── wrangler.toml           # Configuração dev e produção
├── frontend/                   # React 19 + Vite 6 + Tailwind CSS 4
│   └── src/
│       ├── features/
│       │   ├── auth/           # Login, Register, useAuth hook
│       │   └── contacts/       # Lista, formulário, useContacts hook
│       └── lib/
│           └── axios.ts        # Interceptors com refresh token automático
├── n8n/workflows/              # Workflows exportados em JSON
│   ├── list-contacts.json
│   ├── create-contact.json
│   ├── delete-contact.json
│   └── restore-contact.json
├── .github/workflows/          # CI/CD com GitHub Actions
│   ├── deploy-worker.yml       # Deploy do Worker na Cloudflare
│   └── deploy-frontend.yml     # Deploy do Frontend no Cloudflare Pages
├── docker-compose.yml          # PostgreSQL 18 + Redis + Traefik + n8n + pgAdmin
├── .env.example                # Todas as variáveis documentadas
└── .gitignore
```

---

## Endpoints da API

### Auth Service (`/auth/*`)

| Método | Rota             | Descrição                   | Auth |
| ------ | ---------------- | --------------------------- | ---- |
| POST   | `/auth/register` | Criar usuário               | Não  |
| POST   | `/auth/login`    | Autenticar e receber tokens | Não  |
| POST   | `/auth/refresh`  | Renovar access token        | Não  |
| POST   | `/auth/logout`   | Invalidar refresh token     | Não  |

### Contatos (`/contacts/*`) — via n8n

| Método | Rota                            | Descrição                  | Auth |
| ------ | ------------------------------- | -------------------------- | ---- |
| GET    | `/contacts`                     | Listar contatos do usuário | Sim  |
| GET    | `/contacts?includeDeleted=true` | Listar incluindo excluídos | Sim  |
| POST   | `/contacts`                     | Criar contato              | Sim  |
| DELETE | `/contacts/:id`                 | Soft delete do contato     | Sim  |
| PATCH  | `/contacts/:id/restore`         | Restaurar contato excluído | Sim  |

---

## Decisões Técnicas

### Soft Delete e Restauração de Contatos

Em vez de deletar fisicamente os registros, o campo `deletedAt` é preenchido com o timestamp da exclusão. Isso permite auditoria e recuperação futura.

- A listagem padrão filtra por `deletedAt IS NULL`
- Um checkbox **"Exibir excluídos"** permite visualizar também os contatos excluídos
- Contatos excluídos são exibidos com fundo e fonte em vermelho para diferenciação visual
- O botão **"Restaurar"** (azul) limpa o `deletedAt` e reativa o contato via workflow n8n dedicado (`restore-contact`)

### Armazenamento de tokens

O **access token JWT** (15 min) é mantido em memória — nunca persistido em localStorage ou cookie — protegendo contra ataques XSS. O **refresh token** (7 dias) fica no localStorage com rotação a cada uso.

### Rotação de refresh tokens

A cada chamada em `/auth/refresh`, o token antigo é invalidado no Redis e um novo é emitido. Isso previne reutilização de tokens interceptados (token rotation).

### `jose` vs `jsonwebtoken` no Worker

O `jsonwebtoken` depende de APIs do Node.js indisponíveis no runtime de edge da Cloudflare. O `jose` usa a Web Crypto API, compatível com qualquer runtime moderno.

### IDs gerados pelo banco

Os campos `id` usam `gen_random_uuid()` via `@default(dbgenerated(...))` no Prisma, garantindo que a geração do UUID seja responsabilidade do PostgreSQL.

### PostgreSQL compartilhado com n8n

O n8n usa o mesmo banco PostgreSQL com schema separado (`n8n`), evitando conflito com as tabelas da aplicação no schema `public`.

### Tailwind CSS v4

Sem `tailwind.config.js` — configuração via plugin Vite (`@tailwindcss/vite`) e `@import "tailwindcss"` no CSS principal.

---

## Tecnologias

| Tecnologia      | Versão | Uso                            |
| --------------- | ------ | ------------------------------ |
| Node.js         | 22     | Runtime do Auth Service        |
| TypeScript      | 5      | Toda a codebase                |
| Express         | 4      | HTTP framework do Auth Service |
| Prisma          | 5      | ORM (PostgreSQL)               |
| bcryptjs        | —      | Hash de senhas                 |
| jsonwebtoken    | 9      | Geração de JWT                 |
| ioredis         | 5      | Cliente Redis                  |
| Zod             | 3      | Validação (backend e frontend) |
| Hono            | 4      | Framework do Cloudflare Worker |
| jose            | 5      | Verificação de JWT no edge     |
| React           | 19     | Frontend SPA                   |
| Vite            | 6      | Build tool                     |
| Tailwind CSS    | 4      | Estilização                    |
| React Hook Form | 7      | Formulários                    |
| Axios           | 1      | Cliente HTTP com interceptors  |
| n8n             | latest | Automações / CRUD de contatos  |
| PostgreSQL      | 18     | Banco de dados                 |
| Redis           | alpine | Refresh tokens                 |
| Traefik         | 2.11   | Reverse proxy local            |
| Docker Compose  | v2     | Orquestração                   |
| GitHub Actions  | —      | CI/CD                          |
