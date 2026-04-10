---
title: Release Blocker Checklist
description: Solana launch checklist for determining which unresolved issues should block deployment, upgrade, or feature enablement.
---

# Release Blocker Checklist

Use this checklist when deciding whether a program or integration is safe enough to release.

## Release-blocking conditions

1. Any unresolved critical or high issue in account validation, signer auth, CPI boundaries, token integration, or oracle handling.
Why it matters: these are the categories most associated with direct loss in the public Solana corpus.

2. Any unclear upgrade authority, emergency authority, or multisig trust model.
Why it matters: governance ambiguity turns operational mistakes into security incidents.

3. Any unresolved Token-2022 integration assumption.
Why it matters: many extensions fail closed in ways that brick flows or fail open in ways that leak value.

4. Any release path that requires unaudited mainnet signing as the default user path.
Why it matters: client-boundary risk can turn a manageable bug into user-impacting loss.

## Strongly recommended before release

5. A reviewer should map the codebase to the taxonomy categories explicitly.
Why it matters: category coverage is a stronger launch signal than an unstructured "reviewed the code" claim.

6. Reproduce or falsify every candidate issue that depends on attacker-controlled account input.
Why it matters: Solana exploits often hinge on the exact reachability of crafted accounts.

7. Run at least one end-to-end test per privileged instruction.
Why it matters: signer, PDA, token, and oracle assumptions tend to fail at integration boundaries.

8. Verify closure, upgrade, and pause procedures on a safe cluster.
Why it matters: lifecycle and emergency paths are often least tested and most painful during incidents.

## Non-blockers unless combined with a second condition

9. Purely informational trust-model notes.
Why it matters: they should be documented, but not every centralization note is a launch blocker.

10. Weak code-style issues with no exploit path.
Why it matters: launch decisions should focus on reachable risk, not generic cleanliness.
