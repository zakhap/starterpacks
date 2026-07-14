# E2 — Auth & Profiles

Social login, unique handles, and the profile shelf. The profile is a byproduct of packs
(D1) — this epic is deliberately thin. Ref: [spec §7.1, §3 "Shelf"], routes use
`/@user/pack-slug` ([decisions.md](../decisions.md)).

**Depends on:** E1 (Supabase auth, `users` table, deploy).

---

### E2-T1 — Social login
**Goal:** Sign in / sign up via social providers (Supabase Auth). Pick 1–2 for v1
(recommend Google + Apple for PWA/mobile reach).
**Acceptance:** a new user can sign in with a provider, a `users` row is created on first
login, session persists across reloads, sign-out works.
**Depends on:** E1-T3, E1-T4
**Notes:** No email/password in v1 unless trivial. Keep auth surface small.

### E2-T2 — Handle claim + uniqueness
**Goal:** On first login, user claims a unique handle (the `@user` in every pack URL).
Validation: allowed charset, length, reserved-word blocklist, case-insensitive uniqueness.
**Acceptance:** two users cannot claim the same handle (race-safe via a unique index);
invalid handles are rejected with a clear message; handle is required before publishing.
**Depends on:** E2-T1
**Notes:** Handle is load-bearing for lineage display and OG URLs. Reserve system words
(`api`, `admin`, `new`, `login`, etc.). Decide now: is handle editable later? (Recommend:
editable once, with old slug not auto-redirected in v1.)

### E2-T3 — Profile page = shelf of packs (`/@handle`)
**Goal:** Public profile at `/@handle` showing the user's published packs (the "shelf,"
sense b). Newest first; each pack links to its permalink.
**Acceptance:** `/@handle` renders a grid/list of that user's published packs with pack
share-card thumbnails; empty state for zero packs; 404 for unknown handle; own-profile view
shows drafts to the owner only.
**Depends on:** E2-T2, E1-T4
**Notes:** Byproduct surface, not the home surface (D1). Thumbnails come from
`packs.share_image_urls` once E5 lands; until then, a placeholder card.

### E2-T4 — Session-aware app shell + auth guards
**Goal:** App knows who's signed in; protected actions (publish, remix, vote, dedicate)
require auth and route unauthenticated users into login, returning them to intent after.
**Acceptance:** an anonymous user tapping "Remix" is prompted to log in and lands back on
the remix flow; server actions/routes reject unauthenticated writes.
**Depends on:** E2-T1
**Notes:** Anonymous **read** is fully open (packs are public content, D1) — only writes gate.

### E2-T5 — Minimal account/settings
**Goal:** A bare settings surface: signed-in identity, sign out, delete account (hard
requirement for a consumer app). Handle edit if E2-T2 allows it.
**Acceptance:** user can sign out and delete their account; account deletion removes/anonymizes
their `users` row and handles their packs per a stated policy (decide: delete vs. orphan).
**Depends on:** E2-T1
**Notes:** Account-deletion policy interacts with lineage (E6) — a deleted author's pack may
still be an ancestor of live remixes. Recommend: keep the pack as an anonymized ancestor
node so lineage chains don't break; confirm before building.
