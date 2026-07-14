# Tickets

Epic breakdown from [spec §12](../spec.md). Each epic file lists concrete tickets with
acceptance criteria and dependencies. Intent lives in [`../spec.md`](../spec.md) and
[`../decisions.md`](../decisions.md) — tickets reference sections rather than restating them.

## Status

| Epic | File | State |
|---|---|---|
| E1 Foundation | [e1-foundation.md](e1-foundation.md) | Ready |
| E2 Auth & profiles | [e2-auth-profiles.md](e2-auth-profiles.md) | Ready |
| E3 Item system & unfurl | — | Ready (search adapter cut — see below) |
| E4 Composer | — | Ready to draft; publish sub-tickets gated on S2 |
| E5 Publish & share assets | — | Blocked: client-render fidelity spike (S2) |
| E6 Remix & lineage | — | Not yet drafted (depends on E4/E5) |
| E7 Feed & votes | — | Not yet drafted |
| E8 Dedication/send | — | Not yet drafted |
| E9 Moderation & guardrails | [e9-moderation.md](e9-moderation.md) | Ready |
| E10 Seed content ops | — | Not yet drafted |
| E11 Growth hooks | — | Mostly folded into E4 (share-sheet is now a core input) |

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
