# E5 — Publish & Share Assets

The canvas IS the share asset (D7). Render **client-side** (not satori), upload to R2, point OG at
it. Ref: spec §7.6, §9.3, [decisions.md](../decisions.md).

**Gated on spike S2 — client-render fidelity.** Run S2 before estimating T1–T3.
**Depends on:** E1 (R2, deploy), E4 (canvas + draft), E3 (ItemCard).

---

### S2 — Client-render fidelity spike (prerequisite)
**Goal:** Prove a rotated/overlapping 9-item pack renders client-side to an image faithfully,
compresses, uploads to R2, and serves to crawlers via OG.
**Acceptance:** a working proof rendering the real `<ItemCard>`-based canvas (with rotation, overlap,
pinch-scale, liner notes, web fonts, emoji) to a pixel-faithful 9:16 and 1:1 image; documents the
chosen approach (html-to-canvas vs. canvas/WebGL vs. offscreen) and its font/emoji handling.
**Output:** the render approach the T-tickets build on.

### E5-T1 — Client-side canvas render (9:16 + 1:1)
**Goal:** Render the current canvas to two images (9:16 story, 1:1 square) matching the live page
pixel-for-pixel.
**Acceptance:** rendered images match the composer canvas within tolerance across the seed packs;
fonts/emoji/badges render correctly; both aspect ratios framed sensibly from one layout.
**Depends on:** S2, E4-T2, E3-T6

### E5-T2 — Compress + upload to R2
**Goal:** Compress renders to WebP and upload bytes to R2; store URLs on `packs.share_image_urls`.
**Acceptance:** both images land in R2 with public-read; URLs persisted; upload is retried on
failure; images are reasonably sized (WebP ~80% quality) for fast social loading.
**Depends on:** E5-T1, E1-T6
**Notes:** Images MUST be in R2, not Supabase storage — free egress is the viral-cost firewall (§9.3).

### E5-T3 — Publish sequence (render → upload → publish)
**Goal:** Publishing runs render → upload → then flips `status=published`. Publish blocks on upload.
**Acceptance:** a pack is never marked published without its share images at a URL (crawlers don't
run JS); a failed render/upload keeps the pack a draft with a clear retry, never a card-less
publish; publish sheet offers [Post to feed] [Send to someone] [Share off-platform].
**Depends on:** E5-T2, E4-T7
**Notes:** This ordering is the whole reason for client render (decisions.md). Don't let it regress.

### E5-T4 — Pack permalink page + perfect OG tags
**Goal:** `/@handle/pack-slug` renders the pack (canvas above, remix/vote chrome below — never on
the canvas, D7) with complete, correct OG/Twitter tags pointing at the R2 share image.
**Acceptance:** pasting the URL into iMessage/Slack/Twitter/TikTok shows the right title +
share image; SSR renders for crawlers without JS; the canvas region matches the composer;
unknown slug 404s.
**Depends on:** E5-T2, E2-T2 (handle/slug)
**Notes:** Slugs per decisions.md (`/@handle/pack-slug`). Chrome appends BELOW the canvas only.

### E5-T5 — CDN cache rules
**Goal:** Cloudflare caches pack permalinks (SSR/ISR) and especially R2 share images aggressively at
edge; a viral permalink is served from cache, not origin.
**Acceptance:** repeat hits to a hot permalink + its image are edge-cached (verify via CF headers);
publishing/updating a pack invalidates its cached permalink; images are effectively immutable-cached.
**Depends on:** E5-T4, E1-T6
**Notes:** This is the champagne-vs-invoice control for the viral moment (§9.3). Bandwidth on images
is the real cost — R2 egress is free, CF caching keeps origin quiet.
