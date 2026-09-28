# TallyVote Voter 🗳️

The public-facing voter portal. Members land here by scanning a QR code or clicking a shared link. No login required for anonymous elections.

**Paired with:** `tallyvote-admin` — both apps share one Supabase project.

## Stack
- **Next.js 14** (App Router) · **Tailwind CSS** · **Outfit font**
- **Supabase** (Postgres + Realtime) · **Vercel**

## Getting Started

```bash
yarn install
cp .env.local.example .env.local   # add your Supabase keys + admin app URL
yarn dev                            # runs on http://localhost:3001
```

## Vote URL format

```
/vote/[election-id]
```

QR codes generated in the admin app point to this route. e.g.:
`https://vote.tallyvote.app/vote/pres-2025`

## Env vars

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase project as admin |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_ADMIN_APP_URL` | URL of admin app (e.g. `https://admin.tallyvote.app`) |

## Deploy to Vercel

1. Push to GitHub → import on vercel.com
2. Add env vars → Deploy
3. Set custom domain: `vote.tallyvote.app`

## Anti-double-vote

Uses `localStorage` + a `voter_fingerprint` column in Supabase with a UNIQUE constraint — so even clearing localStorage, the DB rejects a second vote from the same browser session.
