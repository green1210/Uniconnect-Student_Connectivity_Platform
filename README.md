# UniConnect

A modern, responsive platform connecting global university students for education, collaboration, and innovation. Built with React (Vite), Tailwind CSS, Node.js/Express, and Neon (PostgreSQL) via Prisma.

## Tech Stack
- React (Vite, JSX) + React Router
- Tailwind CSS (custom academic theme)
- Node.js + Express API
- Prisma ORM + Neon (PostgreSQL)
- Auth hooks compatible with ceark/Clerk or dev mock

## Quick Start (Windows PowerShell)

1. Clone/open this repo in VS Code.
2. Create an `.env` in the project root from `.env.example` and fill values.
3. Install dependencies and start dev servers:

```powershell
# from project root
npm run install-all
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000

## Environment Variables
Copy `.env.example` to `.env` and set:

- DATABASE_URL="postgres://..."  # Neon connection string
- DATABASE_URL_DIRECT="postgres://..." # Optional direct (non-pooler) Neon URL fallback
- DEV_BYPASS_AUTH="true"          # local dev without external provider (optional)
- CLERK_PUBLISHABLE_KEY="..."     # if using Clerk (optional)
- CLERK_SECRET_KEY="..."          # if using Clerk (optional)
- AUTH_PROVIDER_URL="https://clerk.example.com" # (future) JWKS / domain for auth provider
- AI_API_URL="https://api.example.com/ai/chat" # external AI endpoint (POST JSON)
- AI_API_KEY="sk-..." # bearer token for AI provider

### Auth Flow (Current Stub)
Login/Register create a mock base64 token stored in `localStorage` (`auth_token`). Server middleware decodes payload for role + user id. Replace with real provider: set `DEV_BYPASS_AUTH=false` and implement verification in `authProvider.js`.

### AI Buddy
Client posts `{ message }` to `/api/ai/chat`. Server sends `{ prompt }` to `AI_API_URL` with `Authorization: Bearer AI_API_KEY`. Fallback: offline mock response if env vars missing, timeout, or provider error.

## Scripts
- `npm run install-all` – installs deps (workspaces)
- `npm run dev` – runs client (5173) + server (4000)
- `npm run dev:client` – Vite dev server
- `npm run dev:server` – Express API with mock DB fallback if Neon unreachable
- `npm run prisma:generate` – generates Prisma client
- `npm run prisma:seed` – seeds basic data (after migrations)
- `npm --workspace apps/server run start` – production start (no watch)

## Notes
- All React files use JSX (no TypeScript/TSX).
- Auth provider is pluggable; dev mode uses a mock user if `DEV_BYPASS_AUTH=true`.
- UI aims for a blend of LinkedIn (professional) + Coursera (educational) + Notion (clean aesthetic).
 - Offline development supported: if Neon unreachable, server returns mock data.
 - Automatic DB retry: server attempts pooled URL, direct URL, and derived direct host with exponential backoff.

## Docker

Build and run server:
```powershell
docker build -f Dockerfile.server -t uniconnect-server .
docker run -p 4000:4000 --env DATABASE_URL=$Env:DATABASE_URL uniconnect-server
```

Build and run client:
```powershell
docker build -f Dockerfile.client -t uniconnect-client .
docker run -p 8080:80 uniconnect-client
```

## Deployment Checklist
1. Provide Neon `DATABASE_URL` (ensure reachable from host/network).
2. Run `npx prisma migrate deploy` in server workspace.
3. Set auth provider keys; disable `DEV_BYPASS_AUTH`.
4. Set `AI_API_URL` / `AI_API_KEY` if enabling AI Buddy.
5. Configure reverse proxy (e.g., Nginx) to route `/api` to server.
6. Enable HTTPS for production.
