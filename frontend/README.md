# ByteChain Academy Frontend

Next.js frontend for the ByteChain Academy platform.

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend API (local or deployed)

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The frontend API client automatically appends `/api/v1` if you provide only the host URL.

### 3) Start dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
# Lint
npm run lint

# Production build
npm run build
```

## Deploy to Vercel

### 1) Import repository

1. Go to Vercel dashboard.
2. Import this repository.
3. Select the `frontend/` directory as project root.

### 2) Configure environment variables

Add:

- `NEXT_PUBLIC_API_URL=https://<your-backend-domain>`

Use your deployed backend base URL (without trailing slash).

### 3) Build settings

Vercel defaults are compatible:

- Build command: `npm run build`
- Output: Next.js default

### 4) Deploy and verify

After deployment:

1. Open the Vercel URL.
2. Test login and any authenticated flow.
3. Confirm frontend can reach backend endpoints through configured `NEXT_PUBLIC_API_URL`.
