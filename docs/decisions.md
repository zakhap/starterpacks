# Packrat — Decisions Log

Authoritative record of choices made *after* [`spec.md`](./spec.md) v0.1. When this
file and the spec disagree, **this file wins**. The spec is preserved as the original
artifact; deltas live here.

---

## 2026-07-14 — Name

**Working name: Packrat.**
- Leans the collectible / trading-card "pack" association (booster packs → open, trade,
  collect) which maps onto remix + lineage. Reads as culture, not tooling.
- Deliberately avoids "link" in the name — "link packs" re-anchors to Linktree/utility,
  the exact energy D2 rejects.
- **Open:** trademark + domain not yet checked. `packrat.com` is near-certainly taken;
  `packrat.app` / `getpackrat` / `trypackrat` are the likely live options. Run the check
  before the name is load-bearing (marketing, logo, legal).

## 2026-07-14 — Resolved open decisions (spec §11)

1. **Item-tap on a pack page → (b): expand liner note + actions.** "Open link" is demoted
   to a small action inside the expanded state; it is NOT the default tap. Making (a) the
   default is what turns the product into commerce and undermines D2/D4.
2. **Product-search API vendor → deferred, spike required.** Generic product search under
   D4 (no affiliate) is a genuine dead zone (SerpAPI-class = costly at scale; Amazon PA-API
   needs sustained affiliate sales and conflicts with D4). This gates E4. Spike vendor
   options before estimating the composer. Spotify + YouTube search are fine; *product*
   search is the hard, unresolved one. (See `../memory` note in the harness / risks.)
3. **Platform → PWA for v1.** Native is a fast-follow if traction warrants.
4. **Contest mode (Pack #001) → manual/curated at launch, automated infra in v1.1.** A human
   runs the stunt as an event; entries are collected as normal remixes into a hand-built
   gallery. No event infra built for one stunt.
5. **Handles/namespace → `/@user/pack-slug`.** Gives free lineage-display real estate and
   clean OG URLs.
6. **Product name → Packrat** (see above).

## 2026-07-14 — Technical refinements

- **Share images: render CLIENT-SIDE on save, don't rely on satori.** D7 promises the
  canvas is pixel-for-pixel the export; satori (`@vercel/og`) only renders a CSS subset and
  can't faithfully reproduce the freeform rotation/overlap/pinch-scale of the composer
  (7.4). So: client renders the canvas → compress (WebP) → **upload bytes to R2** → store
  the URL on the pack → OG tags point at it.
  - **Publish sequence:** render → upload → *then* mark published. Publish blocks on the
    upload, because crawlers (iMessage/TikTok/Twitter) never run JS — they only read the OG
    tag, so the image must exist at a URL before publish completes.
  - A failed render = retry; never ship a pack without its share card.
- **No Docker for v1.** Both services (Next.js app + unfurl worker) deploy via Railway's
  native buildpack (Nixpacks). Portability is preserved by §9.4 discipline (no
  Vercel-proprietary primitives), NOT by a Dockerfile. Add a Dockerfile only when either
  (a) we move to Fly.io (image-native), or (b) the unfurl worker needs headless Chromium
  for JS-rendered sites with no server-side OG tags. ~1-hour retrofit when that day comes;
  start with plain `fetch` + OG parsing.
- **Clipboard growth hook (7.9) → share-sheet target, not clipboard poll.** iOS Safari
  won't silently read the clipboard on load. The PWA registers as a share target so
  "share a link → Packrat" starts a pack. Native (share extension) is the stronger version
  if/when we go native.
- **Week-1 north-star metric → shares AND makes (co-primary).** NOT remix-rate alone. This
  resolves the D5 tension: Tier-1 callouts drive tags/shares (not remixes), so measuring
  week 1 on remix-rate would look falsely broken. Remix-rate (target ~70%) is a later
  metric once Tier-2/Tier-4 remix-bait packs are in circulation.

## 2026-07-14 — Accepted bets (flagged, deliberately not designed for v1)

- **Inbound / return loop is unspecified.** The design optimizes outbound virality (the
  share image escapes to other platforms and is self-sufficient — D1 + D7), but the path
  from "saw a pack on TikTok" → "made one here" is not designed. Accepted as a known bet
  for v1. The wrong-item bait (5.1) is the best latent inbound weapon if we ever choose to
  invest here (the comment war happens off-platform; "the fix is one remix away" is the CTA).

## Still open / needs a spike before its epic is estimated

- **Product-search vendor** (gates E4) — see decision 2 above.
- **Client-render fidelity** (E5) — verify html2canvas/canvas/WebGL reproduces a real
  9-item pack with rotation + overlap + pinch-scale cleanly, and the R2-upload-then-OG
  sequence works for crawlers.
- **Archetype ↔ real-person collision (D6)** — seed pack #6 "self-appointed internet
  creative director" maps 1:1 onto collab target Oren John ("The Internet's Creative
  Director"). Collision-check unnamed archetypes against the Lane-2 recruit list before
  publishing seed content, or reframe #6.
