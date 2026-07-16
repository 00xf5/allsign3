# Vercel Deploy

Frontend only — API stays on **Supabase Edge Functions**.

## 1. Deploy Supabase functions first

See [SUPABASE_BACKEND.md](./SUPABASE_BACKEND.md). Without a deployed `login` function, form submit will fail.

## 2. Connect repo to Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`

`vercel.json` is included for SPA routing.

## 3. Environment variables (Vercel → Settings → Environment Variables)

Set for **Production** (and Preview if you use it):

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://nxzvpcbudbqotujuuczo.supabase.co` — **must** be your `*.supabase.co` URL, **not** your Vercel URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_PAYLOAD_ENCRYPTION_KEY` | Same as Supabase `PAYLOAD_ENCRYPTION_KEY` |

Redeploy after changing any `VITE_*` variable (they are baked in at build time).

## 4. Verify

1. Open your Vercel URL → app should load (no gate interstitial).
2. Submit login → DevTools → Network → `POST` to `…supabase.co/functions/v1/login` → **200 JSON**.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| POST goes to `your-app.vercel.app/functions/v1/login` → 405 | `VITE_SUPABASE_URL` is empty on Vercel; redeploy after setting it to your `*.supabase.co` URL |
| 401 on functions | Check `VITE_SUPABASE_ANON_KEY`; ensure `verify_jwt = false` in `supabase/config.toml` |
| Decrypt / login fails | Match `VITE_PAYLOAD_ENCRYPTION_KEY` ↔ Supabase `PAYLOAD_ENCRYPTION_KEY` |
