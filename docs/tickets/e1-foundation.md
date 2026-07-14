# E1 — Foundation

Stand up the repo, hosting, data layer, and CI so every later epic has a place to land.
No product features here — just the ground. Ref: [spec §9](../spec.md), [decisions.md](../decisions.md).

**No Docker** (Railway native buildpack). **No Vercel-proprietary primitives** (portability
discipline, spec §9.4).

---

### E1-T1 — Next.js app scaffold
**Goal:** App Router Next.js project in-repo, TypeScript, lint/format configured, boots locally.
**Acceptance:** `npm run dev` serves a placeholder home route; `npm run build` succeeds;
lint + typecheck run clean; committed.
**Depends on:** —
**Notes:** App Router (not Pages). Keep it a single app; the worker (E1-T2) is a second
entrypoint in the same repo, not a separate package unless needed.

### E1-T2 — Unfurl worker service scaffold
**Goal:** A second long-running Node process (same repo) that will drain the unfurl jobs
queue. For now: boots, connects to Postgres, logs a heartbeat, exits cleanly on SIGTERM.
**Acceptance:** worker starts via its own start script, reads DB connection from env,
polls a (stub) query on an interval, shuts down gracefully.
**Depends on:** E1-T4 (DB reachable)
**Notes:** Queue mechanism (Postgres `FOR UPDATE SKIP LOCKED`) lands in E3; this is just
the runnable shell. No Redis/SQS.

### E1-T3 — Supabase project + local dev wiring
**Goal:** Supabase project created (dev + prod), auth providers enabled (placeholder),
connection + keys wired into the app and worker via env. Supabase CLI for local migrations.
**Acceptance:** app connects to Supabase Postgres locally; `supabase` migrations dir exists;
service-role key is server-only (never shipped to client).
**Depends on:** —
**Notes:** Use Supabase as "Postgres + auth" only (§9.4). Go light on edge functions / exotic RLS.

### E1-T4 — Initial schema migration
**Goal:** First migration creating the core tables from [spec §9.6]: `users`, `items`,
`packs`, `pack_items`, `votes`, `unfurl_jobs`, with counter-cache columns on `packs`.
**Acceptance:** migration applies clean on a fresh DB and rolls back; FKs + the
`remix_parent_id → packs.id` self-reference exist; `items.canonical_url` uniquely indexed
(URL dedupe); `canvas_layout` is JSONB.
**Depends on:** E1-T3
**Notes:** Schema is a "starting point, not final" (§9.6). Lineage denorm columns
(`root_pack_id`, `generation_depth`) included now so E6 is cheap.

### E1-T5 — Railway deploy (app + worker) via native buildpack
**Goal:** Both services deploy to Railway from the repo, no Dockerfile. Envs: dev + prod.
Secrets set in Railway (not committed).
**Acceptance:** pushing to the deploy branch ships the app (public URL) and the worker;
health check on the app returns 200; worker logs heartbeat in Railway.
**Depends on:** E1-T1, E1-T2, E1-T3
**Notes:** Nixpacks auto-detects Next.js and the Node worker. Add a Dockerfile only if we
later move to Fly or need headless Chromium (decisions.md).

### E1-T6 — Cloudflare zone + R2 bucket in front
**Goal:** Cloudflare in front of the Railway app (DNS + proxy); R2 bucket provisioned for
share images with public read + free egress. Cache rules stubbed (real rules in E5).
**Acceptance:** traffic resolves through Cloudflare to the app; an object PUT to R2 is
publicly fetchable via its URL; R2 credentials available server-side only.
**Depends on:** E1-T5
**Notes:** Share images MUST live in R2, not Supabase storage (free egress is the whole
point — spec §9.3). This is the single decision that keeps the viral moment cheap.

### E1-T7 — CI pipeline
**Goal:** CI on push/PR: install, lint, typecheck, build, run tests (empty suite ok).
**Acceptance:** CI is green on `main`; a failing lint/build blocks merge.
**Depends on:** E1-T1
**Notes:** Keep it boring and fast. Add migration-apply check once E1-T4 lands.

### E1-T8 — Env & secrets convention
**Goal:** One documented list of required env vars (Supabase URL/anon/service, R2 keys,
Cloudflare, app URL), a committed `.env.example`, and a startup check that fails loudly on
missing required vars.
**Acceptance:** `.env.example` lists every var with a comment; app refuses to boot with a
clear error if a required var is unset; no real secret is committed.
**Depends on:** E1-T3, E1-T6
