# Supabase Backend

API runs on **Supabase Edge Functions** (Deno). The frontend on Vercel calls these endpoints.

## Structure

```
supabase/
├── config.toml
└── functions/
    ├── login/index.ts      # POST …/functions/v1/login
    └── _shared/
        ├── security.ts     # AES payload decrypt
        └── geo.ts          # IP / geo lookup
```

Project ref: `nxzvpcbudbqotujuuczo`  
Base URL: `https://nxzvpcbudbqotujuuczo.supabase.co`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/functions/v1/login` | Encrypted login capture |

## Deploy functions

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Login and link (once):

```bash
supabase login
supabase link --project-ref nxzvpcbudbqotujuuczo
```

3. Set secrets in Supabase (Dashboard → Edge Functions → Secrets, or CLI):

```bash
supabase secrets set PAYLOAD_ENCRYPTION_KEY=your-key
```

`PAYLOAD_ENCRYPTION_KEY` must match `VITE_PAYLOAD_ENCRYPTION_KEY` on Vercel.

4. Deploy:

```bash
supabase functions deploy login
```

## Local function testing

```bash
supabase functions serve login --env-file .env
```

Then run `npm run dev` — Vite proxies `/functions/v1` → your Supabase project URL.

## Optional Express server

The `server/` folder is a Node port kept for local fallback only (`npm run dev:express`). Production uses Supabase, not Express.
