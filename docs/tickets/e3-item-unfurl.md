# E3 — Item System & Unfurl Pipeline

**Unfurl quality is the whole product (spec §9.5).** Every pasted/shared link must return a
handsome card in <1s, with an intentional fallback. Items are canonical, URL-deduped objects
(§9.6). **Product-search adapter is cut from v1** ([decisions.md](../decisions.md)); this epic
covers generic-OG + Spotify + YouTube.

**Depends on:** E1 (schema, worker shell).

---

### E3-T1 — URL canonicalization & dedupe
**Goal:** Normalize any incoming URL to a canonical form so the same thing shared 400 times is
one `items` row.
**Acceptance:** strips tracking params (utm_*, fbclid, si, etc.), normalizes host/case/trailing
slash, resolves known short-link hosts; two visibly-different URLs for the same resource collapse
to one `canonical_url`; unit-tested against a fixture set per source type.
**Depends on:** E1-T4
**Notes:** Canonicalization rules live per-domain where needed. This is the dedupe key AND the
unfurl cache key — get it right early.

### E3-T2 — Unfurl jobs queue (worker drain)
**Goal:** The worker (E1-T2) drains `unfurl_jobs` using `SELECT … FOR UPDATE SKIP LOCKED`.
**Acceptance:** enqueuing a URL creates a job; the worker claims it without double-processing under
concurrency; success writes item metadata + `unfurl_status=done`; failure retries with backoff up
to N attempts then marks `failed`; no Redis/SQS.
**Depends on:** E1-T2, E3-T1
**Notes:** Enqueue is idempotent on canonical URL — if an item is already `done` and fresh, skip.

### E3-T3 — Generic OG adapter + fallback card
**Goal:** Fetch a URL, parse OpenGraph/Twitter/meta, produce `{title, image_url, domain,
source_type}`. When metadata is missing/blocked, emit an **intentional fallback card** (domain +
favicon + title), never a blank.
**Acceptance:** given 20 real-world URLs (incl. a few that block scrapers / lack OG), each returns
either a full card or a deliberate fallback that still looks designed; images are validated
(reachable, not 1×1 tracking pixels); result cached by canonical URL.
**Depends on:** E3-T2
**Notes:** This is the floor for everything not Spotify/YouTube. Budget real effort — it's 80% of
whether plopping feels magical (§9.5). Set a fetch timeout so the <1s budget holds; slow fetches
resolve async and the card upgrades from fallback → full when done.

### E3-T4 — Spotify adapter
**Goal:** Spotify track/album/playlist/artist links → rich item cards (cover art, title, artist,
`source_type=song`) with a Spotify badge.
**Acceptance:** the four link types resolve to correct cards via Spotify's oEmbed/public metadata
(no user-auth OAuth needed for public content); badge renders; cached.
**Depends on:** E3-T3
**Notes:** Prefer oEmbed / open metadata over the full API to avoid auth complexity. Handle
`spotify:` URIs and `open.spotify.com` URLs.

### E3-T5 — YouTube adapter
**Goal:** YouTube video/short/channel links → item cards (thumbnail, title, channel,
`source_type=video`) with a YouTube badge.
**Acceptance:** watch/shorts/youtu.be/channel URLs resolve correctly via oEmbed; correct thumbnail
resolution; badge renders; cached.
**Depends on:** E3-T3

### E3-T6 — Item card component + source badges
**Goal:** One reusable `<ItemCard>` used identically in composer, pack page, feed, and share
render. Source badge per `source_type` (song/video/product/book/place/other).
**Acceptance:** the same component renders a full card, a fallback card, and a liner-note caption;
badges are correct per source; card is deterministic (same data → same pixels) so the E5 share
render matches the live page.
**Depends on:** E3-T3
**Notes:** Determinism matters — E5 renders this exact component to an image. Avoid non-deterministic
layout (random rotation belongs to canvas layout data, not the card).

### E3-T7 — Re-unfurl / OG-rot cron
**Goal:** Periodically re-unfurl stale/failed items so dead images and rotted OG data self-heal.
**Acceptance:** a scheduled job re-fetches items older than a threshold or with `failed`/broken
images; broken images fall back gracefully; runs in the worker, no new infra.
**Depends on:** E3-T3
**Notes:** Per-domain adapters for the top-20 domains are the mitigation for scraper-blocking
(spec §10); add them here as they're identified from failures.
