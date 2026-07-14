# CLAUDE.md — Packrat

Guidance for AI agents working in this repo. Read [`docs/spec.md`](docs/spec.md) and
[`docs/decisions.md`](docs/decisions.md) before making product or architecture choices.
**`decisions.md` is authoritative** where it conflicts with the spec. Tickets: [`docs/tickets/`](docs/tickets/).

## What this is

Packrat: a platform for making/remixing/sending **packs** (titled 6–9 item collages;
each item = a real link + one-line liner note). "Cultural mixtape," not Linktree.

## Locked decisions — do not silently reverse (spec §2)

D1 pack (not profile) is the viral unit · D2 content not utility · D3 "Remix" not "fork,"
lineage is the graph · D4 no monetization in v1 · D5 remix-first (~70%) · D6 archetypes
unnamed / named packs only self-published · D7 canvas *is* the share asset.

If one seems wrong, **flag it in review** — don't just change it.

## Vocabulary (use in code, UI, copy — spec §3)

**Pack** · **Item** (canonical, URL-deduped) · **Liner note** · **Plop** (add item) ·
**Remix** (inherit + change ≥1 + republish) · **Lineage** · **Dedication/Send** · **Shelf** ·
**Drop**. Never "fork," never "mixtape" as the object name, never "link" in the product name.

## Resolved specifics (decisions.md)

- Name: **Packrat** (domain/TM pending).
- Item-tap on a pack page = expand liner note + actions; "open link" is secondary.
- Platform = **PWA** for v1; native fast-follow. Handles/URLs = `/@user/pack-slug`.
- Share images: **render client-side** → WebP → upload (R2 in prod) → OG points at it.
  Publish blocks on upload (crawlers don't run JS). Do NOT depend on satori for fidelity.
- **No Docker** in v1 — Railway native buildpack.
- Composer input = **paste + shelf + share-sheet** (federated search CUT from v1).
- Week-1 metric = shares AND makes (co-primary), not remix-rate.

## Stack

**Prod target (spec §9):** Next.js (App Router) on Railway · Supabase (Postgres+auth) ·
Cloudflare + R2 · unfurl worker = 2nd Railway service.
**This repo, as built:** Next.js 16 / React 19 / Tailwind 4 / TypeScript / Bun ·
Drizzle ORM → **local Postgres** (`postgres.js`) · cookie-session **dev auth** (swap for
Supabase social login at deploy) · pluggable **storage** (local disk in dev → R2 in prod) ·
unfurl worker script under `src/worker`. Portability discipline §9.4: no proprietary primitives.

## Local dev

- Postgres runs locally on :5432. Set `DATABASE_URL` in `.env.local` (see `.env.example`).
- `bun run db:push` — apply schema · `bun run db:seed` — seed packs · `bun run dev` — app ·
  `bun run worker` — unfurl/re-unfurl worker (optional; paste path unfurls inline too).

## Engineering priorities

- **Unfurl quality is the whole product (§9.5)** — handsome card in <1s, intentional fallback (E3).
- **60-second remix budget (§7.8)** is the composer acceptance test (E4).

## Out of scope for v1 (spec §8)

No Docker, no recommender feed, no comments, no monetization, no federated search.
