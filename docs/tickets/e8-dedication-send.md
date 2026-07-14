# E8 — Dedication / Send

The mixtape DNA (D2): a pack made *for someone*. "Made you a pack" is the emotionally sticky 1:1
mechanic layered on the public feed. Sent packs escape the feed — the spec bets this is a top
performer (§5.1). Ref: spec §7.1, §7.6, §3 "Dedication/Send".

**Depends on:** E4 (composer), E5 (publish), E2 (recipients/handles).

---

### E8-T1 — Addressed pack (recipient on the object)
**Goal:** A pack can be addressed to a recipient (`packs.dedication_recipient`). Recipient may be a
Packrat handle or an off-platform target (name/link for the share).
**Acceptance:** the composer's "Make one for someone" path sets a recipient; the recipient is stored
and shown on the pack ("for @alex"); a non-dedicated pack has null recipient and behaves normally.
**Depends on:** E4-T1, E1-T4
**Notes:** Keep recipient flexible — on-platform handle OR a plain name for an off-platform send
(the share image + link goes via iMessage/etc.).

### E8-T2 — Send flow (publish becomes send)
**Goal:** For a dedicated pack, the publish sheet's primary action becomes **Send** — deliver to the
recipient (in-app if a handle, else the off-platform share image + link).
**Acceptance:** publishing a dedicated pack routes to Send; an on-platform recipient gets a
notification/inbox entry; an off-platform send produces the share image + permalink ready to hand
off; the pack still gets a permalink (sent ≠ private-forever, unless we choose to gate — see notes).
**Depends on:** E8-T1, E5-T3
**Notes:** Decide visibility: is a sent pack also public in the feed, or recipient-first then public?
Recommend **recipient-first, then public** (the reveal is part of the gift), but confirm — this is a
product call, not obvious.

### E8-T3 — Recipient view
**Goal:** The recipient's experience of receiving a pack made for them.
**Acceptance:** an on-platform recipient sees received packs (a simple inbox), can view the pack,
and can remix/reply-with-a-pack; a clear "made for you by @maker" framing; off-platform recipients
land on the permalink with the same framing.
**Depends on:** E8-T2, E5-T4
**Notes:** "DMs beyond dedication sends" are out of scope (§8) — this inbox is dedication-only, not a
general messaging surface.
