---
title: Release Blocker Checklist
description: Solana launch checklist for determining which unresolved issues should block deployment, upgrade, or feature enablement.
---

# Release Blocker Checklist

Use this checklist when deciding whether a program or integration is safe enough to release.

For machine-readable signoff, use [../workflows/release-gate-workflow.md](../workflows/release-gate-workflow.md) and emit `PASS`, `FAIL`, or `SKIP` per gate check. A `FAIL` in a required release-gate check is a blocker until the release owner provides a fix or evidence that falsifies the risk.

## Release-blocking conditions

1. Any unresolved critical or high issue in account validation, signer auth, CPI boundaries, token integration, or oracle handling.
Why it matters: these are the categories most associated with direct loss in the public Solana corpus.

2. Any unclear upgrade authority, emergency authority, or multisig trust model.
Why it matters: governance ambiguity turns operational mistakes into security incidents.

3. Any unresolved Token-2022 integration assumption.
Why it matters: many extensions fail closed in ways that brick flows or fail open in ways that leak value.

4. Any release path that requires unaudited mainnet signing as the default user path.
Why it matters: client-boundary risk can turn a manageable bug into user-impacting loss.

5. Any production deploy or upgrade that cannot tie the reviewed source, build artifact, and deployed binary together.
Why it matters: audits review source, but users execute the deployed program bytes.

6. Any critical instruction, migration, close, claim, withdrawal, or emergency path with unbounded account handling, missing simulation evidence, or insufficient compute headroom.
Why it matters: liveness failures can block exits and emergency response even without a direct drain.

7. Any live account-layout change without versioning, an idempotent migration path, mixed-version handling, and fork or harness simulation evidence.
Why it matters: an unsafe upgrade can corrupt accounts or make old state unreadable before reviewers can respond.

8. Any account creation, realloc, upgrade buffer, or migration path with unresolved rent, account-size, or program-size funding assumptions.
Why it matters: rent and size failures can strand migrations, leave partial upgrades, or make recovery paths unusable.

9. Any payment flow that fulfills goods, grants access, or initiates settlement from client-reported success, reused references, non-idempotent fulfillment, or webhook payloads without chain re-verification.
Why it matters: payment bugs often convert one valid user action into underpayment, replay, wrong-token settlement, or double fulfillment.

## Strongly recommended before release

10. A reviewer should map the codebase to the taxonomy categories explicitly.
Why it matters: category coverage is a stronger launch signal than an unstructured "reviewed the code" claim.

11. Reproduce or falsify every candidate issue that depends on attacker-controlled account input.
Why it matters: Solana exploits often hinge on the exact reachability of crafted accounts.

12. Run at least one end-to-end test per privileged instruction.
Why it matters: signer, PDA, token, and oracle assumptions tend to fail at integration boundaries.

13. Verify closure, upgrade, pause, rollback, and migration recovery procedures on a safe cluster or fork.
Why it matters: lifecycle and emergency paths are often least tested and most painful during incidents.

14. For payment releases, test underpayment, wrong token, wrong recipient, replayed reference, poller/webhook race, and late payment after expiry.
Why it matters: the happy path rarely proves the merchant will fulfill exactly once for the right payment.

## Non-blockers unless combined with a second condition

15. Purely informational trust-model notes.
Why it matters: they should be documented, but not every centralization note is a launch blocker.

16. Weak code-style issues with no exploit path.
Why it matters: launch decisions should focus on reachable risk, not generic cleanliness.
