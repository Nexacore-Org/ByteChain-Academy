# ByteChain Academy

ByteChain Academy is a Web3 learning platform that combines short, practical lessons with quizzes, analytics, certificates, and DAO-style governance features.

## Project overview

- Backend: NestJS REST API with Swagger docs
- Frontend: Next.js app router application
- Data layer: local SQLite by default in codebase, PostgreSQL-ready environment variables and Docker service for deployment workflows
- Infra: Docker Compose for local infrastructure services

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | NestJS 11, TypeScript, TypeORM |
| Auth | JWT |
| API docs | Swagger at `/api/v1/docs` |
| Local infra | Docker Compose (PostgreSQL + optional Redis) |
| Testing and linting | Jest, ESLint, Prettier |

## Quick start

### 1) Clone the repository

```bash
git clone https://github.com/Spagero763/ByteChain-Academy.git
cd ByteChain-Academy
```

### 2) Start local services (PostgreSQL, optional Redis)

```bash
docker compose up -d
```

### 3) Configure backend environment

```bash
cd backend
cp .env.example .env
```

Update values in `.env` for your machine, then install and run:

```bash
npm install
npm run start:dev
```

### 4) Configure frontend environment

Open a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 5) Open the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger docs: http://localhost:3001/api/v1/docs

## Architecture overview

- `frontend/`: user-facing web app (UI, dashboard, admin pages)
- `backend/`: API, auth, business modules, certificate and currency services
- `docker-compose.yml`: local PostgreSQL and Redis services

Request flow:

1. Frontend sends requests to backend via `NEXT_PUBLIC_API_URL`.
2. Backend validates/authenticates requests and processes business logic.
3. Backend persists and retrieves data through TypeORM.

## Deployment guides

- Backend deployment guide: `backend/README.md` (includes Railway steps)
- Frontend deployment guide: `frontend/README.md` (includes Vercel steps)

## Contributing

See `CONTRIBUTING.md` for the Drips Wave contribution process, issue assignment, PR standards, and branch naming conventions.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

