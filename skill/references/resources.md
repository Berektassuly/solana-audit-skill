---
title: Public Solana Audit Resources
description: Source index for the public reports, disclosures, and technical write-ups used to build this Solana audit taxonomy.
---

# Public Solana Audit Resources

This pack is grounded in public primary sources first, then in comparable public Solana security corpora when report-level coverage is thin.

## Audit firms and public findings

### Zellic

1. [Public findings index](https://reports.zellic.io/findings) - searchable public finding titles and severity labels.
2. [Claim and Rewards Programs](https://reports.zellic.io/publications/claim-and-rewards-programs) - Audius Solana claim and reward findings, including SetAuthority and dust-based close issues.
3. [Pyth Lazer](https://reports.zellic.io/publications/pyth-lazer/sections/assessment-results-results) - public summary with a critical verification issue.
4. [N1 Bridge](https://reports.zellic.io/publications/n1-bridge/findings/informational-bridge-usage-of-pubkey-rather-than-mint) - token identity and bridge-boundary assumptions.
5. [Pye](https://reports.zellic.io/publications/pye/sections/solo-validator-bonds-solo-validator-bond) - missing constraints, bond-state, and deadlock notes.
6. [Pyth Oracle](https://reports.zellic.io/publications/pyth-oracle) - oracle-side Solana report corpus.

### Neodyme

1. [Solana Security Workshop](https://workshop.neodyme.io/) - structured exploit labs covering owner checks, signer checks, arithmetic, account confusion, PDAs, and closing logic.
2. [deBridge Solana findings](https://neodyme.io/en/blog/lifting-the-bar-for-solana-cross-chain-security/) - signature-verification and cross-chain message validation write-up.
3. [Marinade peer review](https://neodyme.io/reports/Marinade.pdf) - staking and reserve-management context.
4. [Lido on Solana v2](https://neodyme.io/reports/Lido-2.pdf) - reserve and authority review material.

### Sec3 / Soteria

1. [A Review of Recent Hacks on Solana](https://www.sec3.dev/blog/recent-hacks) - Wormhole, Cashio, Crema, Nirvana, and Slope post-mortem taxonomy.
2. [Solana Bug Bounty Hunting With X-Ray](https://www.sec3.dev/blog/solana-bug-bounty-hunting-with-x-ray) - Jet arithmetic bug and X-Ray vulnerability classes.
3. [Announcing X-Ray Premium](https://www.sec3.dev/blog/announcing-x-ray-premium-auto-auditor-for-solana-smart-contracts) - SVE class naming for common Solana flaws.

### OtterSec / Osec

1. [The Story of the Curious Rent Thief](https://osec.io/blog/2022-08-19-solend-rent-thief/) - lifecycle gap between create and initialize.
2. [Abusing Token Validation in Secured Finance](https://osec.io/blog/2024-05-29-abusing-token-validation-in-secured-finance/) - token-program trust assumptions.
3. [Bypassing LP Token Oracles With Fake Token Accounts](https://osec.io/blog/2022-10-10-lp-oracle-manipulation/) - fake-account oracle manipulation.
4. [The Hidden Dangers of Lamport Transfers](https://osec.io/blog/2025-05-14-king-of-the-sol/) - write-demotion and lamport-transfer assumptions.

### Trail of Bits

1. [Trail of Bits Solana publications index](https://github.com/trailofbits/publications#solana) - public Solana review inventory.
2. [Token-2022 official audit list](https://www.solana-program.com/docs/token-2022#security-audits) - links to the Trail of Bits Token-2022 report from the official program docs.
3. [Squads V4 public report entry](https://github.com/trailofbits/publications/blob/master/reviews/2023-10-squadsv4-securityreview.pdf) - multisig and governance review source.
4. [ZetaChain Solana Gateway public report entry](https://github.com/trailofbits/publications/blob/master/reviews/2025-01-zetachain-solana-gateway-security-review.pdf) - bridge-boundary review source.

### Immunefi and disclosed incidents

1. [Bug Fix Reviews archive](https://immunefi.com/blog/bug-fix-reviews/) - public disclosure hub.
2. [Raydium Tick Manipulation](https://immunefi.com/blog/bug-fix-reviews/raydium-tick-manipulation-bugfix-review/) - concentrated-liquidity price boundary failure.
3. [Raydium Liquidity Drain](https://immunefi.com/blog/bug-fix-reviews/raydium-liquidity-drain-bugfix-review/) - pool accounting and LP redemption boundary failure.

## Comparable public Solana security corpora

These are useful when a category is real but public audit pages are sparse.

1. [Solana Program Security course](https://solana.com/developers/courses/program-security) - official labs for account validation, signer auth, PDAs, reinitialization, revival, and duplicate mutable accounts.
2. [Token-2022 docs](https://www.solana-program.com/docs/token-2022) - official extension semantics and audit links.
3. Anchor v1 migration guidance used while generating this pack - a local source-of-truth for duplicate mutable aliasing hardening and lifecycle checks, referenced here as methodology rather than as packaged content.

## How to use this source index

1. Start with the relevant taxonomy file.
2. Follow the cited public examples back to the source organization.
3. If a category has thin public finding coverage, use the comparable corpus links to verify the mechanic before creating a new subcategory.
