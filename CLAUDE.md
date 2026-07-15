# CLAUDE.md — Packrat

Guidance for AI agents working in this repo. Read [`docs/spec.md`](docs/spec.md) and
[`docs/decisions.md`](docs/decisions.md) before making product or architecture choices.
**`decisions.md` is authoritative** where it conflicts with the spec. Tickets: [`docs/tickets/`](docs/tickets/).

## What this is

Packrat: make a **pack** (titled 6–9 item collage; each item = a real link + one-line liner
note) → get a shareable link → anyone can **fork** it. A shareable static artifact, **link-in-bio
style** — NOT a social platform. See the 2026-07-15 PIVOT entry in decisions.md (authoritative).

## Current model — the simple version (decisions.md 2026-07-15 pivot)

- **No auth, no accounts.** Optional `authorName` label only. No users/sessions/votes/profiles.
- **No edit after publish** — packs are immutable; fork to change one.
- **No server drafts** — composer is client-side (localStorage); `POST /api/packs` writes once.
- **Permalinks `/p/<slug>`.** The permalink + OG/share-image is ~95% of the product.
- Fork + lineage kept; verb is "Fork". Data model = 4 tables: items, packs, pack_items, unfurl_jobs.
- Distribution is off-platform (paste the link in a text or bio). No in-app engagement loop.

Spec.md's D1–D7 are largely **superseded** by this pivot — treat spec.md as historical context,
decisions.md as current truth. Don't reintroduce auth, votes, profiles, or edit-after-publish
without the user asking.

## Vocabulary (use in code, UI, copy — spec §3)

**Pack** · **Item** (canonical, URL-deduped) · **Liner note** · **Plop** (add item) ·
**Remix** (inherit + change ≥1 + republish) · **Lineage** · **Dedication/Send** · **Shelf** ·
**Drop**. Never "fork," never "mixtape" as the object name, never "link" in the product name.

## Resolved specifics (decisions.md)

- Name: **Packrat** (domain/TM pending).
- Item-tap on a pack page = expand liner note + actions; "open link" is secondary.
- Platform = **PWA** for v1; native fast-follow. URLs = `/p/<slug>` (no accounts → no `/@handle`).
- Share images: **render client-side** → WebP → upload (R2 in prod) → OG points at it.
  Publish blocks on upload (crawlers don't run JS). Do NOT depend on satori for fidelity.
- **No Docker** in v1 — Railway native buildpack.
- Composer input = **paste + shelf + share-sheet** (federated search CUT from v1).
- Week-1 metric = shares AND makes (co-primary), not remix-rate.

## Stack

**Prod target (spec §9):** Next.js (App Router) on Railway · Supabase (Postgres+auth) ·
Cloudflare + R2 · unfurl worker = 2nd Railway service.
**This repo, as built:** Next.js 16 / React 19 / Tailwind 4 / TypeScript / Bun ·
Drizzle ORM → **local Postgres** (`postgres.js`) · **no auth** (optional authorName only) ·
client-side composer (localStorage) → one-shot `POST /api/packs` · pluggable **storage** (local
disk in dev → R2 in prod) · unfurl worker under `src/worker` · same-origin image proxy
(`/api/img`) so the client share-render doesn't taint on cross-origin images.

## Local dev

- Postgres runs locally on :5432. Set `DATABASE_URL` in `.env.local` (see `.env.example`).
- `bun run db:push` — apply schema · `bun run db:seed` — seed packs · `bun run dev` — app ·
  `bun run worker` — unfurl/re-unfurl worker (optional; paste path unfurls inline too).

## Engineering priorities

- **Unfurl quality is the whole product (§9.5)** — handsome card in <1s, intentional fallback (E3).
- **60-second remix budget (§7.8)** is the composer acceptance test (E4).

## Out of scope for v1 (spec §8)

No Docker, no recommender feed, no comments, no monetization, no federated search.
