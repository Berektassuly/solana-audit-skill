---
title: Pre Audit Intake Checklist
description: Intake checklist for preparing a Solana security review so the audit starts with the right trust model, dependencies, and release assumptions.
---

# Pre Audit Intake Checklist

Use this before reviewing code. The goal is to surface trust assumptions early.

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
