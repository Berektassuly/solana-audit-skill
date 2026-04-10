---
title: Token Program And Token 2022 Integration
description: Canonical Solana vulnerability class for unsafe assumptions about token programs, mint identity, token-account semantics, and Token-2022 extensions.
---

# Token Program And Token 2022 Integration

## Aliases

- token validation bug
- mint identity mismatch
- wrong token program assumption
- Token-2022 integration hazard
- wrapped token trust bug

## What The Bug Is

This class covers program paths that assume a token account, mint, or token program is safe without validating the exact mint identity, token program variant, or extension semantics that apply to the asset.

## Why It Matters On Solana

On Solana, the same business flow may touch classic SPL Token, Token-2022, wrapped mints, ATAs, memo-required accounts, fee-bearing mints, permanent delegates, or freeze authorities. If the integration assumes "token account" implies a single behavior, the program can mis-price transfers, accept the wrong mint, or mint wrapped assets under unsafe authority assumptions.

## Exploit Mechanics

1. The attacker passes a mint, token account, or token program that satisfies only part of the program's expectations.
2. The integration validates the wrong property, or validates too little.
3. The token path executes with different fee, freeze, delegate, or close semantics than the program assumes.
4. Value is trapped, leaked, or controlled by the wrong authority.

## Review Signals

1. Code checks a token account's owner but not its mint, or vice versa.
2. Code assumes classic SPL Token semantics while accepting Token-2022 assets.
3. Wrapped-mint logic copies freeze or delegate authority from an untrusted source without a trust-model decision.
4. Mint metadata or ATA conventions are used as identity instead of the actual mint address.

## Anchor Notes

1. Prefer `anchor_spl::token_interface` when the integration may encounter Token-2022.
2. Validate mint, token account, token program, and stored authority as one coherent unit.
3. Review every transfer, close, and fee path separately for Token-2022 behavior.

## Native Rust / Pinocchio Notes

1. Check the token program ID explicitly before unpacking or invoking.
2. Validate mint-account contents before deriving wrapped or escrow authorities from them.
3. Avoid assuming ATA semantics if the protocol really requires a specific mint and token program combination.

## Client/Wallet Implications

Clients should detect the token program variant and extension mix before building transactions. User-visible "amount sent" may not equal "amount received" for fee-bearing mints, and memo-required destinations can fail transfers that look correct in the UI.

## Mitigation Guidance

1. Validate the actual mint address and token program ID.
2. Decide whether Token-2022 is supported, then code every path for its extension semantics.
3. For wrapped assets, document which source mint authorities are trusted and which are rejected.
4. Add tests with transfer-fee mints, memo-required accounts, permanent delegates, and wrapped assets.

## Public Examples

1. [Abusing Token Validation in Secured Finance (Osec)](https://osec.io/blog/2024-05-29-abusing-token-validation-in-secured-finance/) - shows how weak token validation assumptions can be abused on Solana.
2. [SPL Token Wrap Program - wrapped-mint freeze authority discussion (Zellic)](https://reports.zellic.io/publications/spl-token-wrap-program/sections/token-wrap-program-token-wrap-wrap) - public report material highlighting authority and mint-wrapping assumptions.
3. [N1 Bridge - usage of pubkey rather than mint (Zellic)](https://reports.zellic.io/publications/n1-bridge/findings/informational-bridge-usage-of-pubkey-rather-than-mint) - a concrete example of token identity being validated too loosely.
4. [Token-2022 official docs and audit list](https://www.solana-program.com/docs/token-2022#security-audits) - authoritative reference for extension semantics and the audit surface around them.
