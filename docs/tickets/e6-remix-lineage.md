# E6 — Remix & Lineage

Remix is the primary creation path (D5) and lineage is the engagement graph (D3), more valuable than
votes. Ref: spec §7.1, §7.7, §9.6.

**Depends on:** E4 (composer), E5 (publish), E1 (schema).

---

### E6-T1 — Remix entry (inherit items + parent link)
**Goal:** "Remix this pack" on any pack opens the composer pre-populated with the parent's items,
layout, and notes; `remix_parent_id` set; author becomes the remixer.
**Acceptance:** remixing loads the parent's full canvas as an editable draft in <the speed budget;
`remix_parent_id`, `root_pack_id`, `generation_depth` are set correctly on the new draft; the
original is untouched.
**Depends on:** E4-T2, E4-T7
**Notes:** Primary entry point, ~70% target (D5). Loading must be instant — items are canonical, so
no re-unfurl needed.

### E6-T2 — ≥1-change rule
**Goal:** A remix cannot be published identical to its parent — at least one change (item, layout,
note, or title) is required.
**Acceptance:** publishing an unchanged remix is blocked with clear guidance; any qualifying change
unblocks it; the diff check is robust to no-op reorders.
**Depends on:** E6-T1, E5-T3
**Notes:** Keeps the graph meaningful and blocks repost spam (§7.7).

### E6-T3 — Inherited visual state
**Goal:** Inherited cards carry a subtle "inherited" visual state until the remixer touches them;
on first change, the title bar suggests a fork-of-the-name.
**Acceptance:** untouched inherited items are visually distinct; touching one clears the state;
title suggestion appears on first change (e.g. "…starter pack → the six months in edition").
**Depends on:** E6-T1

### E6-T4 — Lineage storage + walk query
**Goal:** Store and query the remix ancestry. Denormalized `root_pack_id` + `generation_depth` for
cheap display; recursive CTE for the full walk.
**Acceptance:** a recursive CTE returns the ancestor chain for any pack; denorm columns are correct
and maintained on publish; "N generations deep" reads without walking the whole chain.
**Depends on:** E1-T4, E6-T1

### E6-T5 — Lineage walk UI
**Goal:** On a pack: "remixed from @mara, 3 generations deep," tappable to walk the chain
(ancestors, and ideally notable descendants).
**Acceptance:** the direct parent is credited on every remixed pack; tapping opens a walkable chain;
each node links to its permalink; roots and orphaned (deleted/taken-down) ancestors render as
tombstones, not breaks.
**Depends on:** E6-T4, E5-T4
**Notes:** Direct-parent credit on each pack is the "somewhere" the user asked for; the walk is the
extra. Deleted-author / taken-down ancestors keep their node (see E2-T5, E9-T2).

### E6-T6 — Remix counters
**Goal:** Maintain `remix_count` on packs (counter cache) and surface it.
**Acceptance:** publishing a remix increments the parent's `remix_count` atomically; count displays
on packs/feed; consistent under concurrency.
**Depends on:** E6-T1, E1-T4
