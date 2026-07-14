# Packrat

A content platform for making, remixing, and sending **packs** — the "starter pack"
meme rebuilt as a native internet object: a titled collage of 6–9 items where every
item is a real link (product, song, video, book, place) with a one-line liner note.

Not a Linktree replacement. The framing is **"cultural mixtape"** — packs are content
that circulates on its own; profiles are just the shelf where your packs accumulate.

> **Status:** pre-build. Spec complete, decisions resolved, ready for ticketing.
> Working name **Packrat** (trademark/domain check pending).

## Docs

- [`docs/spec.md`](docs/spec.md) — full Product & Build Spec v0.1 (thesis, launch
  content, UX, architecture). Preserved as authored.
- [`docs/decisions.md`](docs/decisions.md) — **authoritative** log of choices made since
  v0.1 (name, resolved open questions, technical refinements). Wins over the spec on
  conflict.

## The core bets (don't silently reverse — see spec §2)

- **D1** The unit of virality is the *pack*, not the profile.
- **D2** Content platform, not utility ("cultural mixtape").
- **D3** "Remix," never "fork" — lineage is the engagement graph.
- **D4** No monetization at launch.
- **D5** Remix-first creation (~70% of packs are remixes).
- **D6** Archetype packs are unnamed; named packs only via verified self-publication.
- **D7** The canvas *is* the share asset.

## Stack (planned)

Next.js (App Router) on Railway + Supabase (Postgres/auth) + Cloudflare/R2 in front.
No Docker for v1 (Railway native buildpack). Share images render client-side → R2.
See spec §9 and decisions log.

## Epics

E1 Foundation · E2 Auth/profiles · E3 Item system & unfurl · E4 Composer ·
E5 Publish & share assets · E6 Remix & lineage · E7 Feed & votes · E8 Dedication/send ·
E9 Moderation · E10 Seed content ops · E11 Growth hooks. (Full breakdown: spec §12.)
