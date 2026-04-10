---
title: Token-2022 Transfer Hooks
description: Canonical Solana vulnerability class for Token-2022 Transfer Hook callback reentrancy and ExtraAccountMeta injection in Token-2022 integrations.
---

# Token-2022 Transfer Hooks

Public finding density for this class is currently thin. This file stays narrow and covers only documented hook-specific trust-boundary mechanics.

## Aliases

- transfer hook reentrancy
- ExtraAccountMeta injection
- hook callback exploit
- hook recursion
- CPI depth exhaustion via hook

## What The Bug Is

This class covers Token-2022 transfer flows where an integrating protocol treats the hook callback or hook-resolved extra accounts as trusted when they are not. The documented boundary today is that a token transfer can invoke external hook logic and resolve additional accounts from `ExtraAccountMetaList`; if the integration does not pin the hook program and validate that account-resolution path, attacker-influenced control flow or account context can reach security-sensitive logic.

## Why It Matters On Solana

Solana historically felt resistant to token-transfer callbacks because classic SPL Token transfers did not invoke external hook programs. Token-2022 Transfer Hooks reintroduce that boundary. The official hook material also makes clear that while source, mint, destination, and owner are de-escalated to read-only inside the hook CPI, additional accounts from `ExtraAccountMetaList` may still be signer or writable. A seemingly ordinary `transfer_checked` can therefore introduce external control flow and extra-account trust assumptions that the surrounding protocol must model explicitly.

## Exploit Mechanics

1. A protocol accepts a Token-2022 mint and calls `transfer_checked` without pinning the expected hook program or validating whether a hook is present at all.
2. The token program resolves additional accounts from `ExtraAccountMetaList`, and those accounts may arrive with writable or signer-capable permissions even though the four core transfer accounts are de-escalated.
3. The hook executes with that extra-account context and can alter control flow at a point where the host protocol may still be reasoning about pre-transfer state or unchecked helper accounts.
4. If the host protocol trusts that hook path too broadly, attacker-influenced extra accounts, stale state assumptions, or thinly guarded callback paths can turn a token transfer into an authorization, accounting, or liveness failure.

Documented mechanics here are hook-mediated control-flow change and unvalidated extra-account resolution. Host-protocol reentry beyond that remains a realistic but thin-coverage, POC-style area rather than a confirmed in-the-wild exploit family.

## Review Signals

1. `transfer_checked` on a Token-2022 mint without pinning or allowlisting the expected hook program.
2. Protocol accepts arbitrary Token-2022 mints as collateral, settlement assets, or router inputs without separately vetting hook behavior.
3. `ExtraAccountMetaList` PDA derivation, owner, or contents are not recomputed and validated against expected seeds and expected accounts.
4. Hook paths allow additional accounts to arrive writable or signer-capable without explicit necessity and validation.
5. Host protocol mutates balances, positions, whitelist state, or auth state only after the transfer CPI and then reuses assumptions made before the hook executed.
6. CPI depth, failure propagation, or griefing behavior from hook callbacks is not treated as a separate liveness boundary.

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

1. Pin or allowlist acceptable hook programs before calling `transfer_checked` on value-bearing paths.
2. Recompute and validate `ExtraAccountMetaList` PDA derivation, owner, and all security-sensitive extra accounts instead of trusting caller-supplied hook context.
3. Mutate critical protocol state before the transfer CPI, or revalidate it after the hook returns before continuing.
4. Treat writable or signer-capable extra accounts as a separate review surface and test adverse paths explicitly.
5. Budget for hook-induced CPI depth and failure propagation, and reject mints whose hook behavior the protocol cannot reason about.

Default account state, permanent delegate, and confidential-transfer proof failures stay in their own classes unless a hook callback or hook account-resolution path is the first boundary crossed.

## Public Examples

1. No confirmed large-loss in-the-wild transfer-hook exploit has been publicly disclosed as of April 2026. Current evidence comes from official documentation plus thin-coverage POC-style write-ups rather than public finding pages.
2. [Transfer Hook - official Solana developer course material](https://solana.com/developers/courses/token-extensions/transfer-hook) - authoritative reference for hook wiring, de-escalation of the four core transfer accounts, and the signer or writable status that extra accounts may still carry.
3. [Token-2022](https://www.solana-program.com/docs/token-2022) - authoritative reference for extension semantics, published audits, and the fact that integrators must explicitly choose to trust Token-2022 behavior.
4. [CPI Reentrancy Is Back: A Solana Developer's Defense Playbook for Token-2022 Transfer Hooks](https://dev.to/ohmygod/cpi-reentrancy-is-back-a-solana-developers-defense-playbook-for-token-2022-transfer-hooks-4p5m) - POC-style secondary write-up showing how host protocols can expose callback-driven reentry or recursion hazards if they mutate state after `transfer_checked`.
5. [Solana Token-2022 Security: The Hidden Attack Surface in Token Extensions Every DeFi Protocol Must Address](https://dev.to/ohmygod/solana-token-2022-security-the-hidden-attack-surface-in-token-extensions-every-defi-protocol-must-1jke) - POC-style secondary write-up focused on `ExtraAccountMetaList` validation and attacker-influenced hook context.
