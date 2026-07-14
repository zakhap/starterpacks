# CLAUDE.md — Packrat

Guidance for AI agents working in this repo. Read [`docs/spec.md`](docs/spec.md) and
[`docs/decisions.md`](docs/decisions.md) before making product or architecture choices.
**`decisions.md` is authoritative** where it conflicts with the spec.

## What this is

Packrat: a platform for making/remixing/sending **packs** (titled 6–9 item collages;
each item = a real link + one-line liner note). "Cultural mixtape," not Linktree.
Pre-build — currently just docs.

## Locked decisions — do not silently reverse (spec §2)

D1 pack (not profile) is the viral unit · D2 content not utility · D3 "Remix" not "fork,"
lineage is the graph · D4 no monetization in v1 · D5 remix-first (~70%) · D6 archetypes
unnamed / named packs only self-published · D7 canvas *is* the share asset.

If one seems wrong, **flag it in review** — don't just change it.

## Vocabulary (use in code, UI, copy — spec §3)

**Pack** (the object) · **Item** (canonical, URL-deduped link object) · **Liner note**
(one-line annotation) · **Plop** (add item to canvas) · **Remix** (inherit + change ≥1 +
republish) · **Lineage** (remix ancestry) · **Dedication/Send** (addressed pack) ·
**Shelf** (saved items / profile's packs) · **Drop** (scheduled platform pack). Never
"fork," never "mixtape" as the object name, never "link" in the product name.

## Resolved specifics (decisions.md)

- Name: **Packrat** (domain/TM pending).
- Item-tap on a pack page = expand liner note + actions; "open link" is a small secondary action.
- Platform = **PWA** for v1; native is a fast-follow.
- Handles/URLs = `/@user/pack-slug`.
- Share images: **render client-side** on save → WebP → upload to **R2** → OG points at it.
  Publish blocks on upload (crawlers don't run JS). Do NOT depend on satori for fidelity.
- **No Docker** in v1 — Railway native buildpack. Add Docker only for Fly.io or headless
  Chromium in the unfurl worker.
- Clipboard hook = **share-sheet target**, not clipboard poll (iOS Safari can't auto-read).
- Week-1 metric = shares AND makes (co-primary), not remix-rate.

## Stack (spec §9)

Next.js (App Router) on Railway · Supabase (Postgres + auth, RLS) · Cloudflare + R2 in
front · unfurl worker = 2nd Railway service, Postgres jobs table w/ `FOR UPDATE SKIP
LOCKED` (no Redis/SQS yet). **Portability discipline (§9.4):** no Vercel-proprietary
primitives; Supabase as "Postgres + auth" only; no Cloudflare-D1, no Firebase, no
microservices. Data model sketch: spec §9.6.

## Engineering priorities

- **Unfurl quality is the whole product (§9.5)** — every pasted link (Spotify, product,
  YouTube) must return a handsome card in <1s, with an intentional fallback card. Its own epic (E3).
- **60-second remix budget (§7.8)** is the acceptance test for the composer (E4).

## Needs a spike before its epic is estimated

- **Product-search vendor** (gates E4 composer) — no clean cheap option under D4 (no
  affiliate). Spike before scoping. Spotify/YouTube search are fine; product search is unsolved.
- **Client-render fidelity** (E5) — prove a rotated/overlapping 9-item pack renders +
  uploads + serves to crawlers cleanly.
- **Archetype↔real-person collision (D6)** — seed pack #6 maps onto collab target Oren John; check/reframe.

## Working agreements

- Don't build Docker, a recommender feed, comments, or any monetization in v1 (out of scope, spec §8).
- Epics E1–E11: spec §12.
