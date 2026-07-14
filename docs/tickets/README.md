# Tickets

Epic breakdown from [spec §12](../spec.md). Each epic file lists concrete tickets with
acceptance criteria and dependencies. Intent lives in [`../spec.md`](../spec.md) and
[`../decisions.md`](../decisions.md) — tickets reference sections rather than restating them.

## Status

| Epic | File | State |
|---|---|---|
| E1 Foundation | [e1-foundation.md](e1-foundation.md) | Ready |
| E2 Auth & profiles | [e2-auth-profiles.md](e2-auth-profiles.md) | Ready |
| E3 Item system & unfurl | [e3-item-unfurl.md](e3-item-unfurl.md) | Ready (search adapter cut) |
| E4 Composer | [e4-composer.md](e4-composer.md) | Ready; publish sub-tickets gated on S2 |
| E5 Publish & share assets | [e5-publish-share.md](e5-publish-share.md) | Gated on spike S2 |
| E6 Remix & lineage | [e6-remix-lineage.md](e6-remix-lineage.md) | Ready (depends on E4/E5) |
| E7 Feed & votes | [e7-feed-votes.md](e7-feed-votes.md) | Ready (depends on E5) |
| E8 Dedication/send | [e8-dedication-send.md](e8-dedication-send.md) | Ready (depends on E4/E5) |
| E9 Moderation & guardrails | [e9-moderation.md](e9-moderation.md) | Ready |
| E10 Seed content ops | — | Deferred (ops/content, post-core-loop) |
| E11 Growth hooks | — | Share-sheet → E4-T5; rest deferred |

**MVP critical path:** E1 → (E2 ∥ E3) → E4 → S2 → E5 → E6 → E7 → E8.

## Scope change (2026-07-14): no federated search in v1

Federated/product search is cut from v1 ([decisions.md](../decisions.md)). Composer input =
**paste + shelf** only. Effects on tickets:
- **S1 (product-search vendor) is no longer a v1 blocker** — deferred to v1.1 if search returns.
- **E3** drops the product-search adapter; keeps generic-OG + Spotify + YouTube unfurl.
- **E4** drops the search tray; the **share-sheet capture** (formerly E11) becomes a core
  composer input and ships in the E4 timeframe.

## Spikes still required

- **S2 — Client-render fidelity** (gates E5, and the publish sub-tickets of E4). Prove a
  rotated/overlapping 9-item pack renders client-side, compresses to WebP, uploads to R2,
  and serves to crawlers via OG tags. Output: chosen render approach + a working proof.

## Convention

`E<n>-T<m>` ids. Each ticket: **Goal / Acceptance / Depends on / Notes**. "Acceptance" is
the done-test; keep it verifiable.
