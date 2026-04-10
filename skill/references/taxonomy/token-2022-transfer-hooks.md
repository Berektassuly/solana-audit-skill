---
title: Token-2022 Transfer Hooks
description: Canonical Solana vulnerability class for Token-2022 Transfer Hook callback reentrancy and ExtraAccountMeta injection in Token-2022 integrations.
---

# Token-2022 Transfer Hooks

Public finding density for this class is currently thin. This file covers only the documented mechanic.

## Aliases

- transfer hook reentrancy
- ExtraAccountMeta injection
- hook callback exploit
- hook recursion
- CPI depth exhaustion via hook

## What The Bug Is

This class covers Token-2022 transfer flows where a hook callback or its extra-account resolution changes control flow or trust assumptions in a way the integrating protocol did not defend. Two documented exploit paths matter today: hook-program callback reentrancy before host state is finalized, and malicious account injection via an `ExtraAccountMetaList` PDA whose derivation or expected contents are not validated.

## Why It Matters On Solana

Solana historically felt resistant to classic reentrancy because programs could not register arbitrary callbacks into core token transfers. Token-2022 Transfer Hooks reintroduce callback control flow at the CPI layer, so a seemingly ordinary `transfer_checked` can now execute attacker-chosen hook logic before the surrounding protocol has committed or revalidated its own invariants.

## Exploit Mechanics

1. A protocol accepts a Token-2022 mint and calls `transfer_checked` without fully modeling its hook behavior.
2. The hook program receives control and either CPIs back into the host protocol before state is updated, or consumes attacker-influenced extra accounts from `ExtraAccountMetaList`.
3. The host protocol continues under stale assumptions about collateral, whitelist state, or control-flow depth.
4. Funds can be double-counted, access control can be bypassed, or transactions can be forced to fail consistently through recursive depth exhaustion.

## Review Signals

1. `transfer_checked` on a Token-2022 mint without verifying the hook program identity.
2. State mutation after a `transfer_checked` CPI rather than before.
3. `ExtraAccountMetaList` PDA seeds or contents not validated against known-good derivation.
4. Protocol accepts arbitrary Token-2022 mints as collateral without a hook-program allowlist.
5. CPI depth not treated as a bounded resource that a recursive hook can exhaust.

## Anchor Notes

1. Anchor does not prevent hook reentrancy. The risk sits at the architectural boundary where a token transfer now invokes arbitrary external logic.
2. Review `ctx.remaining_accounts` and any hook-provided accounts as untrusted inputs unless owner, PDA, and relationship checks are explicit.
3. Add reentrancy guards or effect ordering only where the full transfer-hook path is understood and tested.

## Native Rust / Pinocchio Notes

1. `invoke` and `invoke_signed` have the same exposure here. The exploit path is framework-agnostic.
2. Validate the mint's Token-2022 extension mix and expected hook program before invoking the transfer.
3. If extra accounts are expected, derive and compare the authoritative PDA locally instead of trusting caller-supplied hook context.

## Client/Wallet Implications

Clients and wallets should surface that a token transfer may call an external hook program and may require extra accounts. Protocol UIs that accept arbitrary collateral should inspect the mint's extension set and treat unaudited hook programs as a separate trust decision, not as a generic token transfer.

## Mitigation Guidance

1. Mutate critical protocol state before calling `transfer_checked`, or guard the path explicitly against re-entry.
2. Allowlist acceptable hook programs for custodial or collateral-bearing integrations.
3. Recompute and validate `ExtraAccountMetaList` PDA derivation and all security-sensitive extra accounts.
4. Budget for hook-induced CPI depth and test recursive or griefing paths explicitly.
5. Prefer rejecting mints whose hook behavior the protocol cannot reason about.

## Public Examples

1. No confirmed large-loss in-the-wild transfer-hook exploit has been publicly disclosed as of April 2026. Current evidence comes from authoritative research and POC-style write-ups rather than public finding pages.
2. [CPI Reentrancy Is Back: A Solana Developer's Defense Playbook for Token-2022 Transfer Hooks](https://dev.to/ohmygod/cpi-reentrancy-is-back-a-solana-developers-defense-playbook-for-token-2022-transfer-hooks-4p5m) - details hook callback reentrancy, lock-based defenses, and CPI depth exhaustion.
3. [Solana Token-2022 Security: The Hidden Attack Surface in Token Extensions Every DeFi Protocol Must Address](https://dev.to/ohmygod/solana-token-2022-security-the-hidden-attack-surface-in-token-extensions-every-defi-protocol-must-1jke) - documents `ExtraAccountMetaList` injection and recursive transfer-hook abuse.
4. [Solana Audit Guide 2026: Firedancer & Token-2022 Risks](https://www.zealynx.io/blogs/solana-2026-security) - frames transfer hooks as a new callback trust boundary and calls out spoofed extra-account inputs and recursion griefing.
5. [Transfer Hook - official Solana developer course material](https://solana.com/developers/courses/token-extensions/transfer-hook) - authoritative reference for how hooks and extra accounts are wired into Token-2022 transfers.
6. [Post Mortem: ZK ElGamal Proof Program Bug, June 2025](https://solana.com/news/post-mortem-june-25-2025) - adjacent Token-2022 trust-boundary evidence showing that extension-backed assumptions can fail at the program boundary, though this incident was not a transfer-hook exploit.
