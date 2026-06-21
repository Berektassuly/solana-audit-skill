---
title: Pre Audit Intake Checklist
description: Intake checklist for preparing a Solana security review so the audit starts with the right trust model, dependencies, and release assumptions.
---

# Pre Audit Intake Checklist

Use this before reviewing code. The goal is to surface trust assumptions early.

For design-stage risk reduction before a full audit, use [../workflows/pre-audit-design-review.md](../workflows/pre-audit-design-review.md) after this intake checklist. It turns unresolved architecture decisions into design assumptions, a threat model, a pre-audit checklist, and open questions.

## Core intake

1. Identify every in-scope program ID and cluster.
Why it matters: many Solana risks depend on upgrade authority, deployed address, and whether the code is already live.

2. Record the framework and runtime mix.
Why it matters: Anchor, native Rust, and client-side signing each produce different review obligations.

3. List every external dependency.
Why it matters: Token, Token-2022, stake pool, oracle, bridge, and multisig assumptions often dominate the attack surface.

4. Identify every authority.
Why it matters: upgrade authority, pause authority, mint authority, freeze authority, and multisig signers define the blast radius of admin mistakes.

5. Capture the release posture.
Why it matters: a readiness review before first deploy is different from a hotfix on an already deployed program.

## Architecture intake

6. Enumerate PDA seeds and stored bumps.
Why it matters: PDA derivation mistakes are easier to catch before code review if the seed model is explicit.

7. Enumerate all CPI targets.
Why it matters: arbitrary CPI findings usually come from unclear external program assumptions.

8. Enumerate token and mint assumptions.
Why it matters: many integrations silently assume classic SPL Token behavior and break on Token-2022 extensions.

9. Enumerate oracle and pricing sources.
Why it matters: oracle freshness, confidence, and manipulation assumptions often determine whether an economic bug is real.

10. Enumerate client or wallet signing flows.
Why it matters: boundary-layer bugs can turn a sound on-chain design into an unsafe end-user flow.

## Design-stage intake

11. Record the account model, PDA map, authority matrix, CPI map, token policy, and named economic invariants if they already exist.
Why it matters: missing design artifacts should be resolved before auditors spend time reconstructing intent from code.

12. Record unresolved design questions one at a time, with a recommended default answer and owner.
Why it matters: design uncertainty should become an explicit audit-readiness task, not a hidden assumption inside a finding.
