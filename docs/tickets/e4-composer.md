# E4 — Composer

The largest epic. **The 60-second remix budget (§7.8) is the acceptance test for the whole epic.**
Input modes for v1 = **paste + shelf + share-sheet** (search cut, [decisions.md](../decisions.md)).
Publish lives in E5. Ref: spec §7.2–7.7.

**Depends on:** E1 (schema), E2 (auth to save/own), E3 (unfurl + ItemCard).

---

### E4-T1 — Title-first mad-lib
**Goal:** Composer opens on a fill-in-the-blank title bar: "The ___ starter pack", with rotating
ghost-text suggestions pulled from trending packs.
**Acceptance:** title is the first thing focused; ghost suggestions rotate and are dismissable by
typing; title is required to publish; suggestions come from real trending titles (stub source ok
pre-E7).
**Depends on:** E2-T1
**Notes:** The title is the creative brief and the joke's punchline (spec §7.2). Don't bury it.

### E4-T2 — Freeform canvas (drag / pinch / rotate, snap-assist, 9-cap)
**Goal:** A loose-collage canvas (NOT a grid): move, pinch-resize, rotate items; soft snap-assist
(alignment, auto-spacing, size clamping) so nothing can look ugly. Hard cap 9, min ~4;
drag-to-trash to remove.
**Acceptance:** items drag/resize/rotate smoothly on touch + mouse; snap-assist visibly nudges but
never fights the user; adding a 10th item is blocked with clear feedback; layout persists to
`canvas_layout` JSONB (positions/rotations/scales/z-index); works on mobile viewport first.
**Depends on:** E3-T6
**Notes:** Slight overlap/rotation = meme; grid = shopping page (§7.4). This is the hardest UI in
the product and the biggest driver of the 60s budget. Layout data must be reproducible server- and
client-side for the E5 render.

### E4-T3 — Paste plop + unfurl integration
**Goal:** ⌘V / long-press-paste anywhere on canvas → enqueue unfurl → a card "plops" in at the
cursor/finger with a physics settle, upgrading fallback → full when unfurl completes.
**Acceptance:** pasting a URL from an empty first screen (zero setup) drops a card immediately
(optimistic fallback), which fills in once E3 returns; plop has a satisfying settle; non-URL paste
is ignored gracefully.
**Depends on:** E4-T2, E3-T2, E3-T3
**Notes:** Must work from the very first screen (§7.3). Optimistic-first is what keeps it under the
speed budget — never block the plop on the network.

### E4-T4 — Shelf (previous + saved items)
**Goal:** A tray of the user's previously-used and saved canonical items, one drag onto the canvas.
**Acceptance:** items the user has used before appear in the shelf; dragging one onto the canvas
adds it instantly (already unfurled → no wait); shelf is searchable/scrollable; empty state for new
users.
**Depends on:** E4-T2, E3-T1
**Notes:** Reuse is instant because items are canonical (§9.6) — this is a core speed lever for
remixing.

### E4-T5 — Share-sheet capture (core input)
**Goal:** Register the PWA as a share target so "share a link → Packrat" starts/continues a pack
with that item. **Now a core composer input, not a growth hook** (search was cut).
**Acceptance:** sharing a URL from another app (Spotify/YouTube/browser/shopping app) into the PWA
opens the composer with the item plopped and unfurling; works on Android PWA; documents the iOS
Safari limitation + fallback.
**Depends on:** E4-T3
**Notes:** Web Share Target API (manifest `share_target`). iOS PWA support is weaker — capture the
gap and the fallback (paste) in the ticket; native share-extension is the stronger later path.

### E4-T6 — Liner notes
**Goal:** Tap an item → one-line annotation field; rendered as a caption on the card. Optional but
heavily nudged (empty-note items get a subtle prompt).
**Acceptance:** notes save to `pack_items.liner_note`; caption renders on the card (and will render
in the E5 share image); empty items show a gentle nudge, never a hard block.
**Depends on:** E4-T2, E3-T6
**Notes:** The liner note is the defensible content layer (D2) — nudge hard, require never.

### E4-T7 — Draft persistence & autosave
**Goal:** A pack in progress is a `packs` row with `status=draft`; canvas edits autosave.
**Acceptance:** closing and reopening the composer restores the exact draft (items, layout, notes,
title); drafts are private to the author until published; no data loss on refresh.
**Depends on:** E4-T1, E4-T2, E4-T6
**Notes:** Publish (E5) flips `status` to published after the render+upload succeeds.

### E4-T8 — 60-second remix budget (acceptance harness)
**Goal:** Prove the remix→publish path fits in 60s. A repeatable check (manual script or
instrumented timer) from "Remix" tap to published.
**Acceptance:** a scripted run of remix a seed pack → change ≥1 thing → add a note → publish
completes under 60s on a mid-tier mobile profile; regressions are visible.
**Depends on:** E4-T2..T7, E6-T1 (remix entry), E5 (publish)
**Notes:** Blank creation may take 5 minutes; remix cannot (§7.8). This ticket is the epic's exit
criterion — keep it honest.
