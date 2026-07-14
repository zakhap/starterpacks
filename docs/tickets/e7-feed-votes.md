# E7 — Feed & Votes

The feed of packs is the home surface (D1). Chronological + simple vote-weighting for v1 — **no
recommender** (spec §7.10, §8). Votes layer on top of the remix graph, never replace it (D3).
Ref: spec §7.10, §9.6.

**Depends on:** E5 (published packs + share cards), E2 (auth for voting).

---

### E7-T1 — Feed (chrono + vote weighting)
**Goal:** The home surface: a feed of published packs, chronological with light vote-weighting.
**Acceptance:** newly published packs appear; ordering is recent-first with a simple vote boost
(documented formula, no ML); paginates/infinite-scrolls; taken-down/draft packs never appear; loads
fast (cached where possible).
**Depends on:** E5-T4
**Notes:** Do NOT build a recommender (§7.10). Keep the ranking formula legible and tunable.

### E7-T2 — Vote endpoints + counter caches
**Goal:** Up/down vote per pack, one vote per user, with counter-cache columns on `packs`.
**Acceptance:** a user can up/down/clear their vote; re-voting updates rather than duplicates
(unique on user+pack); `upvotes`/`downvotes` counters stay correct under concurrency; anonymous users
are prompted to log in (E2-T4).
**Depends on:** E1-T4, E2-T4
**Notes:** Counters are cached on `packs` for cheap feed ranking; the `votes` table is the source of
truth.

### E7-T3 — Feed card = share card
**Goal:** The feed card IS the pack's canvas/share render (D7) with remix/vote chrome appended
below, never on the canvas.
**Acceptance:** feed cards render the R2 share image (or live canvas) identically to the permalink;
vote + remix counts + "remix" action sit below the card; tapping the card opens the permalink.
**Depends on:** E7-T1, E5-T2, E6-T6
**Notes:** Consistency across feed / permalink / export is the D7 promise — one visual, three
surfaces.
