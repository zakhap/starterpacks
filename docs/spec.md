# Packrat — Product & Build Spec (v0.1)

**Status:** Ideation complete, ready for review → ticketing → build
**Audience:** Reviewing agent / engineering. This doc captures the full reasoning behind each decision so tickets inherit intent, not just requirements.
**Date:** July 14, 2026

> **Note (2026-07-14):** Product working name is **Packrat**. Open decisions in §11
> have since been resolved and a few technical choices refined — see
> [`decisions.md`](./decisions.md) for the authoritative deltas. This document is
> preserved as the original v0.1 artifact.

---

## 1. One-liner

A content platform where people make, remix, and send "starter packs" — the meme format (a titled collage of 6–9 items) rebuilt as a native internet object where every item is a real link (product, song, video, book, place) with a one-line annotation.

Not a Linktree replacement. Not link-in-bio energy. The pitch is **"cultural mixtape"**: packs are content that circulates on their own; profiles are just the shelf where your packs accumulate.

---

## 2. Product thesis & decision log

These decisions were made deliberately during ideation. Do not silently reverse them; if one seems wrong, flag it in review.

### D1. The unit of virality is the pack, not the profile
Link-in-bio products get shared once, passively, from a bio. A starter pack ("the sad girl autumn starter pack," "the guy who just discovered woodworking starter pack") gets shared *as content*. The feed of packs is the home surface; the profile is a byproduct (like a SoundCloud profile is where tracks accumulate). This is the inverse of Linktree's hierarchy and the core structural bet.

### D2. Content platform, not utility ("cultural mixtape" framing)
The mixtape grammar imports three behaviors for free:
- **Dedication** — mixtapes are *for someone*. "Made you a pack" is a 1:1 send mechanic layered on the public feed loop, and it's the emotionally sticky one.
- **Liner notes** — the one-line annotation per item ("this is the tote. don't fight it.") is where the creator's personality lives. Links are commodity; **the commentary is the defensible content layer.**
- **Seasonality** — packs are of-a-moment. "Summer 2026" in a title is a feature. Packs can expire, be re-pressed, get anniversary'd. Link trees rot; packs become artifacts.

### D3. "Remix," never "fork"
We are a consumer-driven product. The verb is **Remix** everywhere in UI and copy. Remixing means inheriting a pack's items with lineage credit intact, changing at least one thing, and republishing. Remix chains ("lineage") are the engagement graph and more valuable than votes. Voting (up/down) exists but layers on top for discovery ranking; it is not the identity of the product.

### D4. No monetization at launch
Affiliate/rev-share was considered and explicitly cut. Rationale: the moment every pack reads as a storefront, the meme-charm dies. Monetization is a later conversation; nothing in the data model should preclude it (items are canonical objects, so affiliate params can be attached later), but no monetization features ship in v1.

### D5. Remix-first creation
Blank-canvas creation kills products like this. The primary creation entry point is remixing an existing pack; blank creation is deliberately de-emphasized. Target: ~70% of published packs are remixes. This raises the stakes on seed content (Section 5) — it is programming, not inventory.

### D6. Archetype ("type of guy") packs are a first-class content category
Starter packs were always secretly about people, not products. Two lanes:
- **Lane 1 (platform-authored + community):** unnamed archetypes — "the internet's creative director" starter pack, "the amateur etymologist of the group chat" starter pack. The archetype is *the follower mid-transformation*, not the source creator. Unnamed = no right-of-publicity exposure, evergreen, remixable.
- **Lane 2 (collabs only):** named creators appear ONLY via self-published packs ("my actual starter pack, by me") — a verified self-roast, the most shareable genre of celebrity content. We never author packs naming real people. This is both a legal guardrail and a launch playbook (see Section 6).

### D7. The canvas is the share asset
What the creator arranges in the composer is pixel-for-pixel what renders as the pack page, the feed card, and the auto-exported 9:16 / 1:1 share images. No separate "design your share card" step. Remix/vote chrome appends below the canvas on live pages, never on it.

---

## 3. Vocabulary (use consistently in UI, copy, and code)

| Term | Meaning |
|---|---|
| **Pack** | The core object: title + 6–9 items on a canvas + liner notes. (Not "mixtape" literally — too retro-cute, collides with music. We keep the mixtape *grammar*, the object stays "pack.") |
| **Item** | A canonical, reusable link object (product, song, video, book, place) with unfurled metadata. The same item appearing in 400 packs is a signal, not a duplicate. |
| **Liner note** | One-line annotation on an item. Optional, heavily nudged. |
| **Plop** | The act of adding an item to the canvas (paste/search/drag), with a physics settle. |
| **Remix** | Inherit a pack's items + lineage credit, change ≥1 thing, republish. |
| **Lineage** | The remix ancestry chain, visible and tappable ("remixed from @mara, 3 generations deep"). |
| **Dedication / Send** | Publishing a pack addressed to a specific person. |
| **Shelf** | (a) A user's previously-used/saved items in the composer; (b) a profile's collection of packs. |
| **Drop** | A scheduled platform-authored pack release (weekly cadence). |

---

## 4. Research summary (July 2026)

Full sourcing inline. This grounds the launch content and the collab strategy.

### 4.1 Format validation: the "performative male" proved the concept at cultural scale
The 2025–26 "performative male" meme is, functionally, a starter pack that escaped into the real world:
- It has a canonical item manifest: iced matcha lattes, Labubu keychains, Clairo/Laufey, vinyl, bell hooks / Sally Rooney, baggy jeans, wired headphones, tote bags, skincare. (https://en.wikipedia.org/wiki/Performative_male)
- IRL contests were held in Seattle, Chicago, NYC (Washington Square Park), San Francisco, and on many college campuses (Cornell, Florida, Baylor, Temple). The SF event drew hundreds to Alamo Square, used a custom AI judge scoring contestants 0–100 on recognized items, and had sponsors (a startup and a matcha company). (https://sfstandard.com/2025/08/23/performative-male-contest-sf/)
- Implication: there is demonstrated demand for assembling and performing archetype item-lists, both online and IRL. We are giving the behavior a home, a remix button, and a lineage graph.

### 4.2 Spring/summer 2026 trend substrate (feeds the 50 launch packs)
- **Fitness/wellness identity:** reformer Pilates as "whole personality" (grip socks are a ~$1.4B market; ritual = lemon water, matching set, class, reformer selfie, matcha); run clubs / HYROX / community fitness mainstream; "Japanese walking" search interest up ~3,000% (PureGym annual report); fibermaxxing up 115% in 90 days per Google's Summergeist report; creatine gummies; zero-proof aperitivo.
- **Food/drink:** cloud coffee (+31% YoY), iced einspänner (all-time search high; matcha & hojicha top flavors), Kool-Aid pineapples, black sesame breakout, Japanese strawberries (+28% YoY), frozen fruit snacks (Fruit Riot / Trü Frü), swicy (fruit-forward heat).
- **Fashion:** "surfer summer" (jorts, linen, anklets, shell jewelry) as dominant vibe; boho-grunge (Kate Moss/Glastonbury lineage); ballet/slim sneakers; polka dots, capris, Bermudas; 80s-luxury revival (+225% searches); off-duty mismatched-tonal gym fits.
- **Analog revival:** "hobbymaxxing" and "nonna-maxxing" as named trends; reading ranked the #1 sought-after 2026 hobby (National Rail poll); crochet, chess, birdwatching, film photography, e-bikes.
- **Live-moment anchors:** FIFA World Cup live across US/Canada/Mexico (June 11 kickoff); Olivia Rodrigo album; House of the Dragon S3; GTA 6 anticipation; "Bieberchella"; capybara-as-icon-of-calm.
- **Meta-signal:** talk of a "Great Meme Reset" — Gen Z fatigue with AI slop, appetite for fresh human-made humor. Human-curated, remix-driven packs are positioned *against* slop; lean into this.

### 4.3 Creator-economy context (feeds Lane 2 collabs)
- Performance sweet spot in 2026 is mid-tier creators (~100K–500K), combining small-creator engagement with real reach. (https://www.thoughtleaders.io/blog/creator-economy-trends-2026)
- Industry consensus: shift from one-off paid posts to long-term, authenticity-first co-creation. A standing self-published pack (owned, remixed, permanent) fits this shape better than a sponsored post.
- FTC disclosure enforcement has tightened; another reason D4 (no monetization at launch) simplifies v1.

### 4.4 Verified Lane 2 collab targets (first outreach list)
1. **Oren John (@orenmeetsworld)** — "The Internet's Creative Director." Consumer-brand strategist, HYPER newsletter, brand partnerships incl. Adobe, Amazon, Burberry, Shopify, TikTok. He coined/popularized the "taste economy" framing (customers actively learn materials/design/ingredients) — literally our thesis. (https://orenjohn.com/)
2. **Adam Aleksic (@etymologynerd)** — Harvard-trained linguist, 3M+ followers, NYT-bestselling author of *Algospeak* (brainrot, "unalive," "-core" suffixes). A starter pack is itself a linguistic identity unit; he would annotate his own pack about that fact. Maximum meta-fit. (https://en.wikipedia.org/wiki/Adam_Aleksic)
3. Same-mold candidates to vet: Derek Guy (menswear), Keith Lee (food review), Blackbird Spyplane (recon/curation newsletter), Vivian Tu (finance-explainer tier).

**Guardrail (restated from D6):** we never publish packs naming real people. Named packs exist only when the named person publishes them. Platform- and community-authored archetype packs stay unnamed.

---

## 5. Launch content: the 50 seed packs

Selection logic: optimized for **peak virality**, not browseability. A pack goes viral when someone screenshots it and sends it to a specific person with no caption. Over-index on callout energy, self-roast energy, and comment-bait. Each tier runs a distinct viral mechanism.

### Tier 1 — Callouts (tag-a-friend engine; carries launch)
1. The performative male starter pack ← **Pack #001, launch stunt, see 5.1**
2. The "reformer pilates is her whole personality" starter pack
3. The "joined a run club for the plot" starter pack
4. The "menswear reply guy in training" starter pack
5. The "watched one food reviewer, now rates his mom's cooking" starter pack
6. The "self-appointed internet creative director" starter pack
7. The "amateur etymologist of the group chat" starter pack
8. The "optimization podcast listener" starter pack
9. The "she has a Notion for everything" starter pack
10. The "film bro in his A24 tee era" starter pack
11. The "corporate girlie with a podcast microphone" starter pack
12. The "read one Substack about supply chains" guy starter pack
13. The "guy who says 'the algorithm' like it's a person" starter pack
14. The "just discovered woodworking" guy starter pack
15. The "crypto guy who pivoted to AI" starter pack

### Tier 2 — Self-roasts (post-your-own engine)
16. The "fibermaxxing after years of protein-maxxing" starter pack
17. The "sober-curious but make it a spritz" starter pack
18. The "hobbymaxxing my way out of doomscrolling" starter pack
19. The "nonna-maxxing" starter pack
20. The "just got into film photography" starter pack
21. The "reading a book a week, posting about it more" starter pack
22. The "capybara-core unbothered summer" starter pack
23. The "adult who re-bought their childhood Legos" starter pack
24. The "training for my first HYROX" starter pack
25. The "Japanese walking convert" starter pack
26. The "iced einspänner over cold brew" coffee snob starter pack
27. The "e-bike replaced my car" starter pack
28. The "chess is cool now" starter pack
29. The "birdwatching before 30" starter pack
30. The "first apartment: no furniture, great speaker" starter pack

### Tier 3 — Live-moment drops (timed, disposable, high-velocity)
31. The "World Cup host city local who suddenly cares about soccer" starter pack
32. The "watching every World Cup match at work" starter pack
33. The "USMNT believer (results pending)" starter pack
34. The "festival season survivalist" starter pack
35. The "House of the Dragon Sunday ritual" starter pack
36. The "new Olivia Rodrigo album emotional damage" starter pack
37. The "GTA 6 calling in sick" starter pack
38. The "Kool-Aid pineapple summer" starter pack
39. The "August heat wave denial" starter pack (drops in August)
40. The "back to school but I'm the teacher now" starter pack (drops late August)

### Tier 4 — Taste tribes (remix-bait; built to be argued with)
41. The "surfer summer (never surfed)" starter pack
42. The "boho grunge, Kate Moss at Glastonbury" starter pack
43. The "off-duty model gym fit" starter pack
44. The "quiet luxury is dead, 80s luxury forever" starter pack
45. The "cowboy boots in Brooklyn" starter pack
46. The "ballet sneaker convert" starter pack

### Tier 5 — Dedications (the send-to-someone mechanic; mixtape DNA)
47. The "you're moving to a new city" starter pack (remixable per city; NYC first)
48. The "getting over him" starter pack
49. The "congrats on the new apartment" starter pack
50. The "my best friend is turning 30" starter pack

### 5.1 Launch mechanics
- **Plant a wrong item in every Tier 1 pack.** One deliberately contested inclusion (e.g., the performative male pack ships with a Kindle instead of a physical book). Comments erupt; the top remix "fixes" it; the lineage chain gets its first link within hours. Wrongness is a growth channel; a perfect pack is a dead end.
- **Sequence drops, don't dump.** Week 1 = five Tier 1 packs + the World Cup packs. Tiers 2 & 4 trickle 2–3/week. Tier 5 unlocks alongside the "send a pack" feature launch (a feature moment, not more inventory).
- **Pack #001 is a stunt.** The performative male pack launches attached to a real contest (the grassroots format already has organizers, crowds, and sponsors): "build your entry on the platform, top remix walks the runway." Turns the first pack into an event with photographable proof.
- **Expected top performers (bet ranking):** #1 (culture pre-loaded it), #2 (most commerce-dense identity of 2026), #47 (first pack people *send* rather than post — sent packs escape the feed).

---

## 6. Creator collab strategy (Lane 2)

- **Play:** invite ~10 mid-size, commentary-native creators to publish "my actual starter pack, by me" in week one. Verified self-roast; fans remix; lineage visibly documents the follower-becomes-the-type pipeline (a display no other format offers).
- **First outreach:** Oren John, Adam Aleksic (profiles in 4.4). Pitch asset: a drafted pack in their voice (item list + liner notes) — show, don't tell.
- **Structure:** long-term/ownership framing, not one-off sponsorship. No money changes hands at launch (D4); the value exchange is a permanent, remixable artifact + early-platform status.

---

## 7. UX specification

Reference product for creation feel: Link Bouquet (https://linkbouquet.appdrop.com/) — steal its paste-first creation ("Paste a link with ⌘V or tap Add Link") and gift-framed publish ("Save & Share and surprise someone"), plus source-badged link cards (spotify/youtube/letterboxd badges make a link feel like an object). We diverge on title-first (7.2) and canvas style (7.4).

### 7.1 Entry points (ranked by expected volume)
1. **Remix** (primary, target ~70% of published packs): "Remix this pack" on any pack → composer pre-populated with parent items, lineage credit attached. Editing, not creating.
2. **Dedicate**: "Make one for someone" → same composer; pack is addressed; publish becomes *send*.
3. **Blank** (deliberately de-emphasized): for seed creators and power users.

### 7.2 Composer stage 1 — Title first
The pack is a joke with a setup; the title is the punchline and the creative brief. Composer opens with a fill-in-the-blank mad-lib title bar: "The ___ starter pack", rotating ghost-text suggestions pulled from trending packs. (Divergence from Link Bouquet, whose untitled bouquets are fine because their object isn't a joke.)

### 7.3 Composer stage 2 — Plopping (three input modes, one canvas)
- **Paste:** ⌘V / long-press-paste anywhere on canvas → link unfurls into a card (image, title, source badge) at cursor/finger position with a physics settle ("plop"). Must work from the very first screen, zero setup.
- **Search:** persistent bar querying federated sources — products, Spotify, YouTube, books, podcasts, places — returning pre-formatted item cards dragged from a results tray. This is the mobile-majority path (nobody has URLs on their phone; they have the *name of the thing*).
- **Shelf:** the user's previously-used and saved items, one drag away. Items are canonical reusable objects (see schema), which matters for remix speed and for signal (same item in 400 packs = data, not duplication).

### 7.4 Composer stage 3 — Arrange
Freeform-ish canvas, NOT a rigid grid — the meme reads as a loose collage (slight overlap/rotation = meme; grid = shopping page). Snap-assist under the hood: soft alignment, auto-spacing, size clamping, so it's impossible to make something ugly. Drag to move, pinch to resize, drag-to-trash to remove. **Hard cap 9 items, minimum 4ish; scarcity is the curation.**

### 7.5 Composer stage 4 — Liner notes
Tap item → one-line annotation field. Optional, heavily nudged (empty-note items get a subtle prompt). Rendered as a small caption on the card.

### 7.6 Composer stage 5 — Publish = export
Canvas is the share asset (D7). Auto-generate 9:16 and 1:1 images at publish. Publish sheet: [Post to feed] [Send to someone] [Share off-platform (image + link)].

### 7.7 Remix flow specifics
- Inherited cards carry a subtle "inherited" visual state until touched.
- On first change, title bar suggests a fork-of-the-name ("…starter pack → *the six months in* edition").
- Lineage automatic on publish: "remixed from @mara, 3 generations deep," tappable to walk the chain.
- **Require ≥1 change to publish a remix** (keeps the graph meaningful, blocks repost spam).

### 7.8 Speed budget
**60 seconds from remix-tap to published.** Every stage must survive this: mad-lib title, optional notes, snap-assist, search-returns-cards. Blank creation may take 5 minutes; remix cannot.

### 7.9 Clipboard growth hook
On mobile app open, detect URL on clipboard → offer "start a pack with this?" Converts "sharing a link" (50x/day behavior) into "making a pack" (our core action). Closest thing to a growth cheat code in the product; ship in v1. **(See decisions.md — reworked to a share-sheet target for the PWA; clipboard auto-read is unreliable on iOS Safari.)**

### 7.10 Consumption side — OPEN QUESTIONS (decide before build)
- Flow: feed → pack page → item tap → remix. **What does tapping an item do?** Options: (a) open the link, (b) expand liner note + actions, (c) show every pack the item appears in. This decision determines whether the product feels like content or commerce. **(Resolved: (b) — see decisions.md.)**
- Feed ranking v1: chronological + simple vote-weighting is fine; do NOT build a recommender for launch.
- Votes: up/down per pack; counters cached; voting layers on top of remix-graph, never replaces it (D3).

---

## 8. Feature scope

### MVP (v1)
- Auth (social login), profiles (shelf of packs)
- Composer: title-first, paste/search/shelf plopping, freeform canvas w/ snap-assist, liner notes, 9-item cap
- Link unfurl pipeline (see 9.4) with source badges
- Publish: pack permalink page (perfect OG tags), auto 9:16 + 1:1 share images
- Remix with lineage (≥1-change rule), lineage walk UI
- Dedication/send (addressed packs, recipient view)
- Feed (chrono + vote weighting), up/down votes
- Federated search: start with 3 sources max (recommend: generic product search via one API, Spotify, YouTube) — more sources post-launch
- Clipboard detection on app open (mobile web/PWA acceptable for v1)
- Basic moderation: report flow, admin takedown, blocklist for named-real-person pack titles (D6 guardrail)

### v1.1
- Contest/event mode (Pack #001 stunt infra: entries-as-remixes, gallery view)
- Pack expiry / "re-press" / anniversary resurfacing
- More search sources (books, places, podcasts)
- Native mobile apps if PWA traction warrants

### Explicitly OUT of scope
- Any monetization/affiliate (D4)
- Recommender-system feed
- Comments v1 (votes + remixes ARE the response mechanics; revisit later)
- Native video, stories, DMs beyond dedication sends

---

## 9. Technical architecture

### 9.1 Workload characterization (dictates every choice below)
- Relational data with a tree in it: packs → items, remix lineage, votes → **Postgres-shaped**
- Link-unfurl pipeline: background jobs + URL-keyed caching
- Share-image generation: every pack renders to 9:16 and 1:1 at publish
- Federated search proxying: server-side (hide API keys, normalize to item cards)
- Read-heavy viral traffic: one pack permalink may take 500k hits/day while the rest idles. Viral share traffic is mostly **bandwidth on images** — bandwidth pricing is where indie platforms quietly get expensive.
- NOT static-gen: feed/composer/votes/lineage are dynamic. Pack permalinks want SSR + aggressive CDN caching/ISR, not true static generation.

### 9.2 Stacks compared

| Stack | Ship speed | Cost @ zero | Cost during viral spike | Main risk |
|---|---|---|---|---|
| Next.js on Vercel + Supabase | Fastest | ~$0–25/mo | Can spike hard (bandwidth, image optimization, invocations) | Viral-moment bill |
| **Next.js on Railway/Fly + Supabase** | Fast (one Dockerfile) | ~$10–30/mo | Flat, predictable (scale a container, not a meter) | Slightly more ops (marginal) |
| Cloudflare Workers/Pages + D1/R2 | Slower | ~$0 | Cheapest (R2 free egress) | D1 = SQLite, wrong shape for social graph; runtime quirks |
| Supabase-only (edge functions as backend) | Fast | ~$0–25/mo | Fine | Edge functions too weak for unfurl pipeline; outgrown in weeks |
| Rails/Laravel monolith + Postgres | Fast if known | ~$10/mo | Flat | Composer is a client-heavy React canvas anyway → two apps |

### 9.3 Chosen stack (hybrid)
**Next.js (App Router) + Supabase + Railway + Cloudflare in front.**
- **Supabase:** auth (social login fast), Postgres, RLS, storage-for-non-hot assets. Lineage = adjacency list w/ recursive CTEs (or ltree). $0 → $25/mo Pro.
- **Next.js on Railway (not Vercel):** keeps Next DX incl. satori/@vercel/og-style share-card generation (runs fine off-Vercel) with flat container pricing. Railway for simplicity; Fly if multi-region later — interchangeable now, pick Railway, move on. **(No Docker for v1 — deploy via Railway's native buildpack; see decisions.md.)**
- **Cloudflare free tier in front of everything:** cache pack permalinks and especially generated share images at edge. **Share images live in R2, not Supabase storage** — free egress means the pack screenshotted onto TikTok and hit 2M times costs ~nothing. This single decision = champagne vs. invoice during the viral moment.
- **Unfurl worker:** second service in same Railway project (or cron poller). Queue = Postgres jobs table with `SELECT … FOR UPDATE SKIP LOCKED`. **No Redis/SQS until thousands of unfurls/minute.** Fetch OG metadata → normalize to item card → cache keyed by canonical URL.
- **Cost model:** ~$10–30/mo pre-users; ~$50–80/mo with traction; **no pricing cliff during spikes.** (Vercel path saves ~2 days and risks a four-figure surprise the first time a pack pops.)

### 9.4 Portability discipline (do this, or the choice above stops being reversible)
- Avoid Vercel-proprietary primitives (KV/blob/queues) — then Vercel⇄Railway is a config swap and an afternoon.
- Use Supabase as "Postgres + auth"; go light on edge functions and exotic RLS — retains eject-to-plain-Postgres forever.
- **Do NOT:** Cloudflare-everything (D1 fights the relational graph), Firebase (document DB vs. remix tree = enemies), microservices of any kind (one app + one worker until well past 1M users).

### 9.5 Engineering priority callout: unfurl quality is the whole product
When someone pastes a Spotify link, a product page, and a YouTube video, all three must return equally handsome cards in <1s. Source badges are the floor, not the ceiling. Budget real effort: link unfurling is unglamorous and it is 80% of whether plopping feels magical or janky. Bad unfurls (blank cards, wrong images) kill the vibe. Ticket this as its own epic with quality bars per source type + a fallback card design that still looks intentional.

### 9.6 Data model sketch (starting point, not final)
- `users` (id, handle, …)
- `items` (id, canonical_url, source_type [product|song|video|book|place|other], title, image_url, domain, unfurl_status, unfurled_at) — **canonical & deduped by normalized URL**
- `packs` (id, author_id, title, status, remix_parent_id → packs.id, root_pack_id, generation_depth, dedication_recipient [nullable], canvas_layout JSONB [positions/rotations/scales], share_image_urls, published_at)
- `pack_items` (pack_id, item_id, liner_note, z_index, inherited boolean)
- `votes` (user_id, pack_id, value ±1) + counter cache columns on `packs` (upvotes, downvotes, remix_count)
- `unfurl_jobs` (id, url, status, attempts, locked_at) — worker queue
- Lineage queries: recursive CTE on remix_parent_id; store root_pack_id + generation_depth denormalized for cheap display.
- Note: canvas_layout as JSONB keeps arrangement flexible pre-schema-stability; revisit if layout querying is ever needed.

---

## 10. Risks & mitigations
- **Right of publicity / named-person packs:** D6 guardrail + title blocklist heuristics + report flow. Named packs only via verified self-publication.
- **Moderation generally:** report → admin takedown in v1; no UGC comments in v1 reduces surface area.
- **Meme fatigue / "starter pack is 2015":** the format persists because it's identity-as-curation; 2026 "Great Meme Reset" favors human-curated remix culture over AI slop — position explicitly against slop.
- **Cold start:** solved by Section 5 (50 seeded packs, drop cadence, remix-first UX) + Section 6 (10 creator self-packs week one).
- **Unfurl breakage (sites blocking scrapers, OG rot):** per-domain adapters for top-20 domains; graceful fallback cards; re-unfurl cron.
- **Viral cost spike:** R2 + Cloudflare caching (9.3); flat-priced compute.
- **FTC/disclosure:** moot in v1 (no monetization); revisit before any affiliate work.

## 11. Open decisions for reviewer
> **All resolved 2026-07-14 — see [`decisions.md`](./decisions.md).**
1. Item-tap behavior on pack pages (7.10) — recommend option (b), confirm.
2. Product-search API vendor for federated search v1 (evaluate: SerpAPI-class vs. retailer-direct vs. Amazon PA-API constraints given no-affiliate stance).
3. PWA vs native for launch (clipboard detection reliability on iOS Safari is the deciding constraint for 7.9).
4. Contest mode (Pack #001 stunt) in v1 or fast-follow v1.1 — launch plan assumes at least a manual/curated version at launch.
5. Handle/namespace strategy (packs get slugs? /@user/pack-slug recommended).
6. Name of the product itself — undecided.

## 12. Suggested epic breakdown (for ticketing)
1. **E1 Foundation:** repo, Railway envs, Supabase project, Cloudflare zone, CI. *(No Docker — native buildpack.)*
2. **E2 Auth & profiles:** social login, handles, profile shelf page.
3. **E3 Item system & unfurl pipeline:** items table, URL canonicalization/dedupe, jobs worker, per-source adapters (generic OG, Spotify, YouTube), fallback card. *Quality bars per 9.5.*
4. **E4 Composer:** title-first flow, canvas (drag/pinch/rotate, snap-assist, 9-cap), paste plop, search tray, shelf, liner notes. *Largest epic; 60-second remix budget is the acceptance test.*
5. **E5 Publish & share assets:** permalink pages w/ OG tags, client-side image render (9:16, 1:1), R2 storage, CDN cache rules.
6. **E6 Remix & lineage:** inherit flow, ≥1-change rule, lineage storage + walk UI, remix counters.
7. **E7 Feed & votes:** chrono+vote feed, vote endpoints w/ counter caches.
8. **E8 Dedication/send:** addressed packs, recipient view, share-to-recipient flow.
9. **E9 Moderation & guardrails:** report flow, admin tools, named-person title heuristics.
10. **E10 Seed content ops:** 50 packs built via internal tooling, drop scheduler, wrong-item annotations, creator self-pack onboarding.
11. **E11 Growth hooks:** share-sheet capture, off-platform share flows, OG polish.

---
*End of spec v0.1. Reviewer: challenge decisions D1–D7 explicitly if disagreeing; everything else is fair game for restructuring into tickets.*
