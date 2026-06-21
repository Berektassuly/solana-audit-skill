---
title: Upgrade Admin And Governance Risk
description: Canonical Solana vulnerability class for unsafe upgrade authority, multisig signing, governance thresholds, and emergency-control design.
---

# Upgrade Admin And Governance Risk

## Aliases

- upgrade authority risk
- governance threshold failure
- multisig signing hazard
- admin trust-model gap
- emergency authority blast radius
- account migration corruption
- rollback gap

## What The Bug Is

This class covers privileged operational controls whose implementation, signing flow, upgrade path, or live account migration gives more power than intended, weakens governance guarantees, corrupts deployed state, or makes safe approval impossible in practice.

## Why It Matters On Solana

Upgrade authority and signer coordination are existential controls for many programs. A protocol with flawless on-chain logic can still be unsafe if a signer flow is replayable, a multisig is effectively blind-signing, or governance thresholds can be bypassed.

## Exploit Mechanics

1. A privileged signer or governance flow is broader, weaker, or more replayable than intended.
2. The attacker exploits the operational path rather than the business logic path.
3. The protocol is upgraded, paused, reconfigured, or drained under weakened approval assumptions.

## Review Signals

1. Single-key upgrade or emergency authority without an explicit trust-model claim.
2. Durable nonce or offline signing flows that are replayable or hard to inspect.
3. Governance thresholds, quorums, or timelocks that can be bypassed or front-run.
4. Role changes that do not revoke prior privilege cleanly.
5. Live account layout changes without an explicit version tag and migration plan.
6. Realloc or account migration paths that are not idempotent, resumable, or rent-aware.
7. Upgrades that were not simulated against realistic account data before release.
8. Missing prior binary, pause, or migration-stop plan for rollback and half-migration recovery.

## Upgrade And Account Migration Lifecycle

Treat program upgrade and account migration as part of the audit surface, not as deployment bookkeeping.

1. Classify account-layout diffs before release. Appending a field is lower risk than reordering, removing, retyping, changing PDA seeds, or changing ownership.
2. Require an in-data version marker or equivalent state tag for live accounts. A type discriminator proves type, not business-version compatibility.
3. Require migrations to be idempotent and resumable. Re-running a migration or crank should not double-apply state changes.
4. Handle mixed versions during the migration window. A half-migrated account set should not brick user exits, claims, or emergency actions.
5. Prove migrations on safe infrastructure before mainnet. Useful evidence includes fork simulation, byte-diff checks of carried fields, LiteSVM or Mollusk fixtures, and negative tests for already-migrated accounts.
6. Keep the previous program binary and release evidence. Code rollback is possible only if the prior artifact and authority path are ready; data rollback usually is not.
7. Add a migration pause or guard when a bad migration could keep touching accounts after a defect is discovered.

## Anchor Notes

1. Separate admin-only notes from user-facing exploit paths, but still report admin flows when they exceed the documented trust model.
2. Review config, pause, fee, and upgrade instructions together.
3. If governance controls a PDA signer or treasury, include that in the same attack-surface map.

## Native Rust / Pinocchio Notes

1. Make privilege transitions explicit in state.
2. Avoid implicit role inheritance across instructions.
3. Validate multisig, nonce, and replay assumptions at the operational layer, not just in instruction code.

## Client/Wallet Implications

Admin safety is partly a client problem. Blind-signing, replayable durable nonces, or hard-to-inspect batch approvals can defeat a sound on-chain control model.

## Mitigation Guidance

1. Document the trust model and ensure the code matches it.
2. Use multisig, timelocks, or staged upgrade processes when appropriate.
3. Make signer flows inspectable and nonreplayable.
4. Test quorum, revocation, and threshold edge cases explicitly.
5. Version live account state before changing layouts.
6. Prefer additive, forward-compatible migrations; use copy-to-new-account for destructive layout or PDA changes.
7. Simulate upgrades and migrations against realistic state before mainnet.
8. Archive the previous binary and rehearse rollback, pause, and half-migration recovery.

## Public Examples

1. [Solana Multisig Security (Osec)](https://osec.io/blog/2025-02-22-multisig-security) - explains how blind-signing and durable nonces can undermine Solana multisig safety.
2. [Squads V4 public review entry (Trail of Bits)](https://github.com/trailofbits/publications/blob/master/reviews/2023-10-squadsv4-securityreview.pdf) - a core public source for Solana multisig and governance review posture.
3. [Zellic public finding index entry: proposals can be passed without quorum and threshold requirements being met](https://reports.zellic.io/findings) - demonstrates governance-threshold failure as a public finding class.
