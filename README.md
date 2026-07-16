# Allsign

React frontend (Vercel) + Supabase Edge Functions (API).

## Run locally

```bash
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_* and VITE_PAYLOAD_ENCRYPTION_KEY
npm run dev
```

Vite on http://localhost:3000 proxies `/functions/v1` → Supabase.

Deploy functions first, or point `VITE_SUPABASE_URL` at your linked project.

Optional local Express API: `npm run dev:express` (uses `server/` folder).

## Deploy

| Layer | Host | Guide |
|-------|------|--------|
| **Frontend** | Vercel | [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) |
| **API** | Supabase | [SUPABASE_BACKEND.md](./SUPABASE_BACKEND.md) |

Quick order: **Supabase functions → Vercel frontend → set env vars → redeploy Vercel**.

## Docs

- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) — Vercel settings + env vars  
- [SUPABASE_BACKEND.md](./SUPABASE_BACKEND.md) — Edge Functions deploy + secrets
