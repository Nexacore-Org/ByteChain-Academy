# ByteChain Academy Backend

NestJS backend powering authentication, courses, lessons, progress, DAO voting, certificates, notifications, and analytics.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (or Docker Compose from project root)

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Update `.env` values as needed.

### 3) Start the backend

```bash
npm run start:dev
```

Backend runs on `http://localhost:3001` by default.

## Environment variables

All variables below match `.env.example` exactly.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`). |
| `PORT` | Yes | `3001` | HTTP port for the API server. |
| `JWT_SECRET` | Yes | `change_me_to_a_random_secret_at_least_32_chars` | Secret key used to sign JWTs (minimum 32 chars). |
| `JWT_EXPIRES_IN` | Yes | `7d` | Access token expiration. |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host for deployment-ready DB config. |
| `DB_PORT` | Yes | `5432` | PostgreSQL port. |
| `DB_USERNAME` | Yes | `postgres` | PostgreSQL username. |
| `DB_PASSWORD` | Yes | `postgres` | PostgreSQL password. |
| `DB_NAME` | Yes | `bytechain` | PostgreSQL database name. |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Allowed frontend origin(s) for CORS. Multiple origins can be comma-separated. |
| `APP_URL` | Yes | `http://localhost:3001` | Public backend base URL used in generated links (for example certificate links). |
| `THROTTLE_TTL` | Yes | `60` | Rate limit window in seconds. |
| `THROTTLE_LIMIT` | Yes | `60` | Max requests allowed per TTL window. |
| `SMTP_HOST` | Optional | `smtp.sendgrid.net` | SMTP server host. Empty means email is logged instead of sent. |
| `SMTP_PORT` | Yes | `587` | SMTP server port. |
| `SMTP_USER` | Optional | `apikey` | SMTP username. |
| `SMTP_PASS` | Optional | `your_smtp_secret` | SMTP password or API key. |
| `SMTP_FROM_NAME` | Yes | `ByteChain Academy` | From display name for outbound emails. |
| `SMTP_FROM_EMAIL` | Yes | `noreply@bytechain.academy` | From email for outbound emails. |
| `AVATAR_UPLOAD_PATH` | Yes | `uploads/avatars` | Relative/absolute path for avatar files. |
| `MAX_AVATAR_SIZE_MB` | Yes | `2` | Maximum avatar upload size in MB. |
| `CERTIFICATE_STORAGE_PATH` | Yes | `uploads/certificates` | Path where generated certificate files are stored. |

## API docs

Swagger UI is available at:

- `http://localhost:3001/api/v1/docs`

## DAO Features

The platform includes a DAO (Decentralized Autonomous Organization) system for community governance:

- **Create Proposals**: Authenticated users can create proposals with title and description
- **Vote on Proposals**: Users can vote YES, NO, or ABSTAIN on active proposals
- **Edit Proposals**: Proposal owners can edit title/description before any votes are cast
- **Withdraw Proposals**: Proposal owners can withdraw active proposals, setting status to WITHDRAWN
- **Automatic Resolution**: Proposals auto-resolve to PASSED/REJECTED after voting deadline

**Proposal Statuses**: ACTIVE, PASSED, REJECTED, WITHDRAWN

Withdrawn proposals are excluded from default proposal lists but can be viewed with `?status=WITHDRAWN`.

## Soft-Delete Behavior

Courses support soft-deletion for data safety:

- `DELETE /admin/courses/:id` - Soft-deletes a course (sets `deletedAt` timestamp)
- `PATCH /admin/courses/:id/restore` - Restores a soft-deleted course
- `GET /admin/courses?includeDeleted=true` - Includes soft-deleted courses in admin list

Soft-deleted courses are hidden from public APIs but preserve all related data (progress, certificates, registrations).

## Test and quality checks

```bash
# Lint
npm run lint

# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Coverage
npm run test:cov

# Production build
npm run build
```

## PostgreSQL with Docker Compose (from repo root)

```bash
docker compose up -d postgres
```

Recommended `.env` values for local Compose:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=bytechain
```

## Production deployment on Railway

### 1) Create services

1. Create a new Railway project.
2. Add a PostgreSQL service.
3. Add a backend service from this repository, rooted at `backend/`.

### 2) Configure environment variables

Set all variables from `.env.example` in Railway backend service.

Use values from Railway PostgreSQL plugin for:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

Set production-specific values for:

- `NODE_ENV=production`
- `APP_URL=https://<your-backend-domain>`
- `FRONTEND_URL=https://<your-frontend-domain>`
- `JWT_SECRET=<strong-random-secret>`

### 3) Build and start commands

- Build command: `npm run build`
- Start command: `npm run start:prod`

### 4) Verify deployment

After deploy, verify:

- `GET /api/v1/docs` loads successfully
- Auth endpoints work
- CORS allows the production frontend domain
