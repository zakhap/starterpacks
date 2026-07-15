# Deploying Packrat

Three services: **Supabase** (Postgres), **Cloudflare R2** (share images), **Railway** (the app).
No auth, so there's no OAuth/identity setup. The code is deploy-ready — this is the ops checklist.

## What the code already handles

- **R2 storage driver** (`src/lib/storage.ts`) — S3-compatible PUT via `aws4fetch`, immutable
  cache headers. Selected by `STORAGE_DRIVER=r2`.
- **Prod DB connection** (`src/db/index.ts`) — auto-enables TLS for hosted Postgres and disables
  prepared statements if you point it at a Supabase pooler.
- **Versioned migrations** — `drizzle/` holds generated SQL; `bun run db:migrate` applies it.
- **Boot-time env validation** (`src/lib/env.ts`) — fails loudly if R2 vars are missing when
  `STORAGE_DRIVER=r2`.

## 0. Prerequisites

- Push this repo to GitHub (no remote yet): `git remote add origin <url> && git push -u origin master`.
- Accounts: Supabase, Cloudflare, Railway.

## 1. Supabase (database)

1. Create a project.
2. Settings → Database → Connection string → URI. Copy the **direct** connection string
   (not the pooler) → this is `DATABASE_URL`.
3. Apply the schema:
   ```
   DATABASE_URL="<supabase-direct-url>" bun run db:migrate
   ```
4. (Optional) seed the gallery: `DATABASE_URL="<...>" bun run db:seed`.

## 2. Cloudflare R2 (share images)

1. R2 → Create bucket (e.g. `packrat-images`).
2. Enable public access: attach a **custom domain** (e.g. `images.yourdomain.com`) or use the
   bucket's public `r2.dev` URL → this is `R2_PUBLIC_URL`.
3. R2 → Manage API Tokens → create an **S3 Auth** token (Object Read & Write) →
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Your account id is `R2_ACCOUNT_ID`.

## 3. Railway (the app)

1. New Project → Deploy from GitHub repo. Nixpacks auto-detects Bun + Next.js (no Dockerfile).
2. Build command `bun run build`, start command `bun run start` (Next binds to Railway's `$PORT`).
3. Variables:
   ```
   DATABASE_URL=<supabase-direct-url>
   NEXT_PUBLIC_APP_URL=https://<your-domain>
   STORAGE_DRIVER=r2
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=packrat-images
   R2_PUBLIC_URL=https://images.yourdomain.com
   ```
4. (Optional) add a second service from the same repo with start command `bun run worker`
   for the re-unfurl cron. The inline paste-path unfurl works without it.

## 4. Domain + go-live checks

- Point your domain at the Railway service; set `NEXT_PUBLIC_APP_URL` to it.
- (Recommended) put the domain behind Cloudflare's free proxy for edge caching of `/p` pages.
- Verify:
  - Make a pack in prod → confirm the client render uploads to R2 and the `/p` page shows it.
  - Paste a `/p/<slug>` link into iMessage / a Twitter card validator → confirm the **title +
    share image unfurl** (this is the product for viewers — crawlers read OG tags, not JS).

## Migrations on future deploys

Schema change → `bun run db:generate` (commits new SQL to `drizzle/`) → run `bun run db:migrate`
against prod as a release step.
