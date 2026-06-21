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
2. [deBridge Solana report](https://neodyme.io/reports/Debridge.pdf) - signature-verification and cross-chain message validation review.
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

### Anza and Solana program audits

1. [Anza security audits](https://github.com/anza-xyz/security-audits) - maintained repository of public audits for Anza and Solana ecosystem infrastructure.
2. [Token-2022 docs](https://www.solana-program.com/docs/token-2022) - current authoritative Token-2022 extension semantics and audit links.
3. [Transfer Hook Interface docs](https://www.solana-program.com/docs/transfer-hook-interface) - current authoritative transfer-hook interface documentation.
4. [Configuring Extra Accounts](https://www.solana-program.com/docs/transfer-hook-interface/configuring-extra-accounts) - current authoritative reference for `ExtraAccountMeta` account resolution.

### Immunefi and disclosed incidents

1. [Bug Fix Reviews archive](https://immunefi.com/blog/bug-fix-reviews/) - public disclosure hub.
2. [Raydium Tick Manipulation](https://immunefi.com/blog/bug-fix-reviews/raydium-tick-manipulation-bugfix-review/) - concentrated-liquidity price boundary failure.
3. [Raydium Liquidity Drain](https://immunefi.com/blog/all/raydium-liquidity-drain-bug-fix-review/) - pool accounting and LP redemption boundary failure.

## Ecosystem programs and tooling

### Foundation-backed programs

1. [Raising the Bar on Solana Ecosystem Security](https://solana.com/news/solana-ecosystem-security) - official Solana Foundation launch note for STRIDE, SIRN, foundation-backed monitoring, and related ecosystem security services.
2. [Introducing STRIDE: A Security Program for the Solana Ecosystem](https://blog.asymmetric.re/introducing-stride-a-security-program-for-the-solana-ecosystem/) - Asymmetric Research description of STRIDE's structured evaluation framework, public findings model, and the membership-based SIRN incident-response network.

### Security tooling

1. [Riverguard](https://riverguard.neodyme.io/) - Neodyme service that simulates mutated transactions against deployed Solana programs and stores findings for developer triage; listed by Solana Foundation as an ecosystem security resource.
2. [Riverguard: Mutation Rules for Finding Vulnerabilities](https://neodyme.io/blog/riverguard_3_fuzzcases/) - technical description of Riverguard's mutated-transaction attack simulation approach and the vulnerability patterns it is designed to surface.
3. [Introducing the Solana Transaction Security Standard](https://www.range.org/blog/announcing-the-solana-transaction-security-standard) - Range description of real-time risk scoring, pre-execution transaction simulation, and transaction-level alerting for Solana wallets, multisigs, and apps.

## Comparable public Solana security corpora

These are useful when a category is real but public audit pages are sparse.

1. [Solana Program Security course archive](https://github.com/solana-foundation/developer-content/tree/main/content/courses/program-security) - archived official labs for account validation, signer auth, PDAs, reinitialization, revival, and duplicate mutable accounts. The older `solana.com/developers/courses/program-security` links redirect here.
2. [Blueshift Program Security](https://learn.blueshift.gg/en/courses/program-security/introduction) - maintained Solana program-security course covering ownership, access control, and CPI fundamentals.
3. [Anchor security exploits](https://www.anchor-lang.com/docs/references/security-exploits) - maintained Anchor reference that routes to current Sealevel attack examples.
4. [Coral Sealevel attacks repository](https://github.com/coral-xyz/sealevel-attacks) - maintained runnable examples for common Solana program security mistakes.
5. [Ackee Solana common attack vectors](https://github.com/Ackee-Blockchain/solana-common-attack-vectors) - maintained comparable corpus for account validation, signer, PDA, CPI, and arithmetic review patterns.
6. Anchor v1 migration guidance used while generating this pack - a local source-of-truth for duplicate mutable aliasing hardening and lifecycle checks, referenced here as methodology rather than as packaged content.

## How to use this source index

1. Start with the relevant taxonomy file.
2. Follow the cited public examples back to the source organization.
3. If a category has thin public finding coverage, use the comparable corpus links to verify the mechanic before creating a new subcategory.
