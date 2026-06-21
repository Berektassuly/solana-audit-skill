---
title: Account Validation
description: Canonical Solana vulnerability class for accepting fake, mismatched, or weakly-related accounts into privileged instruction paths.
---

# Account Validation

## Aliases

- missing owner check
- fake account accepted
- account validation bypass
- account confusion
- type cosplay
- missing data matching

## What The Bug Is

This class covers instruction paths that accept an attacker-controlled account even though the account is not the expected program-owned account, not the expected type, or not logically related to the rest of the instruction state.

## Why It Matters On Solana

Solana callers supply nearly every account explicitly. Code and data are separate, so deserialization success is not proof that the account is legitimate. If the program does not validate owner, discriminator, and relationships, an attacker can craft a lookalike account and route privileged logic through it.

## Exploit Mechanics

1. The attacker creates or reuses an account with attacker-controlled contents.
2. The instruction accepts the account because owner, type, or relationship checks are missing.
3. The program reads attacker-controlled state as trusted state.
4. Tokens are minted, withdrawn, bridged, or otherwise mis-accounted.

## Review Signals

1. `UncheckedAccount` or raw `AccountInfo` on sensitive paths.
2. Deserialization before owner or discriminator checks.
3. Token-account checks that verify only mint or only owner, but not both.
4. Missing `has_one`, `constraint =`, or explicit key comparisons for related accounts.

## Anchor Notes

1. Prefer typed `Account<'info, T>`, `InterfaceAccount<'info, TokenAccount>`, and `Program<'info, T>` when possible.
2. When using `UncheckedAccount`, pair it with explicit owner, discriminator, and relationship constraints.
3. Use `has_one`, `owner =`, and explicit constraint expressions to bind stored keys to incoming accounts.

## Anchor remaining_accounts

Anchor's `ctx.remaining_accounts` allows instructions to receive a variable number of accounts not declared in the struct. These accounts bypass Anchor's automatic ownership, signer, and type checks entirely. A program that passes `remaining_accounts` to security-sensitive logic without manually validating owner, type, PDA derivation, and relationship invariants is exploitable by injecting malicious accounts.

Review signal: any instruction that iterates over `ctx.remaining_accounts` and uses those accounts in token transfers, authority checks, or PDA derivation without explicit validation on each account.

Sources: [Dedaub - From Ethereum to Solana: How Developer Assumptions Can Introduce Critical Security Vulnerabilities](https://dedaub.com/blog/ethereum-developers-on-solana-common-mistakes/), [Cantina - Solana Security Risks, Issues & Mitigation Guide](https://cantina.xyz/blog/securing-solana-a-developers-guide), [Three Sigma - Rust Memory Safety on Solana: What Smart Contract Audits Reveal](https://threesigma.xyz/blog/rust-and-solana/rust-memory-safety-on-solana).

## Native Rust / Pinocchio Notes

1. Check `account.owner`, data length, and type discriminator before any deserialize or unpack call.
2. If the account stores references to other accounts, compare those stored keys to the actual incoming accounts.
3. Do not treat a PDA address match alone as enough if the account owner or data type can still be spoofed.

## Client/Wallet Implications

Client code should not assume that a successful simulation proves account legitimacy. If the client constructs account metas incorrectly, a sound signer flow can still feed fake accounts into the on-chain path.

## Mitigation Guidance

1. Validate owner, discriminator, and data length first.
2. Validate account relationships second.
3. For token paths, validate token program, mint, token-account owner, and stored authority expectations together.
4. Add tests that pass counterfeit accounts with the right shape but the wrong owner or related key.

## Public Examples

1. [Wormhole - missing account validation in a bridge path, summarized by Sec3](https://www.sec3.dev/blog/recent-hacks) - the post-mortem classifies Wormhole as a fake-account validation failure.
2. [Cashio - fake collateral and missing account validation, summarized by Sec3](https://www.sec3.dev/blog/recent-hacks) - the exploit relied on crafted accounts passing insufficient validation.
3. [Owner Checks - archived Solana Program Security lesson](https://github.com/solana-foundation/developer-content/blob/main/content/courses/program-security/owner-checks.md) - the archived official course shows why owner validation is the first line of defense.
4. [Type Cosplay - archived Solana Program Security lesson](https://github.com/solana-foundation/developer-content/blob/main/content/courses/program-security/type-cosplay.md) - demonstrates how same-shaped account data can be substituted if type validation is weak.
