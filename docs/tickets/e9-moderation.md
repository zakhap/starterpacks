# E9 — Moderation & Guardrails

Keep the surface safe and the D6 guardrail enforced. Scope is intentionally small: no UGC
comments in v1 (spec §8) means less to moderate. Ref: [spec §10, D6].

**Depends on:** E1 (schema, deploy), E2 (know who's reporting / who authored).

---

### E9-T1 — Report flow
**Goal:** Any user can report a pack (and optionally an item) with a reason category.
**Acceptance:** a signed-in user can submit a report on a pack; a `reports` row is stored
(reporter, target pack/item, reason, timestamp, status=open); duplicate reports from the
same user on the same target are de-duped; reporter gets a confirmation.
**Depends on:** E1-T4, E2-T4
**Notes:** New table `reports` (not in §9.6 sketch — add via migration). Anonymous reporting
out of scope for v1 (gate on auth).

### E9-T2 — Admin takedown tools
**Goal:** A minimal internal admin view to triage reports and take down packs.
**Acceptance:** an admin can list open reports, view the reported pack, and set a pack to
`taken_down` (hidden from feed, profile, and permalink → tombstone page); action is logged
with admin id + reason; takedown cascades to remove it from the feed and lineage display
(but preserves the lineage node — see notes).
**Depends on:** E9-T1
**Notes:** Admin = a role flag on `users` or an allowlist; no full RBAC in v1. Taken-down
pack as a lineage ancestor: keep the node, hide its content (same shape as deleted-author
handling in E2-T5). Confirm the tombstone vs. hard-delete choice.

### E9-T3 — Named-real-person title heuristic (D6 guardrail)
**Goal:** Block/flag pack titles that name a real person, enforcing D6 (archetypes stay
unnamed; named packs only via verified self-publication).
**Acceptance:** on publish, a title matching the heuristic is either soft-blocked (warn +
require confirmation + flag for review) or hard-blocked per policy; the check is logged;
platform/seed self-published packs (Lane 2) are exempt via an explicit allowlist/flag.
**Depends on:** E1-T4
**Notes:** Heuristic, not perfect — start with a curated blocklist of high-profile names +
a "@handle-looks-like-a-real-person" pattern, tune from reports. This is a legal guardrail
(right of publicity, spec §10) — err toward soft-block + review over silent allow. The
Lane-2 exemption path is required so real creators CAN publish "my actual starter pack."

### E9-T4 — Rate limiting & anti-spam on writes
**Goal:** Basic abuse limits on publish, remix, vote, report so a single actor can't flood.
**Acceptance:** per-user (and per-IP for the share-sheet path) rate limits on write
endpoints return a friendly throttle response; limits are configurable; normal use never
hits them.
**Depends on:** E2-T4
**Notes:** The ≥1-change remix rule (E6) already blocks repost spam structurally; this is
the volume backstop. Keep it in-app (Postgres counters / a token bucket) — no Redis yet (§9.4).

### E9-T5 — Moderation-adjacent logging
**Goal:** Audit trail for moderation actions (reports, takedowns, guardrail hits).
**Acceptance:** every takedown, guardrail block, and status change writes an immutable log
row (who, what, when, why); admin view can read it.
**Depends on:** E9-T1, E9-T2, E9-T3
