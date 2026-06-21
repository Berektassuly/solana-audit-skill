---
name: audit-upgrade-migration
description: Audit a Solana program upgrade or live account migration for layout, authority, simulation, rollback, and release-gate evidence.
---

# Audit Upgrade Migration

Route first to `../skill/SKILL.md`. Load focused references only as needed:

- `../skill/references/taxonomy/upgrade-admin-governance.md`
- `../skill/references/taxonomy/lifecycle-reinit-close-revival.md`
- `../skill/references/taxonomy/state-machine-invariants.md`
- `../skill/references/workflows/release-gate-workflow.md`
- `../skill/references/workflows/formal-verification-handoff.md`

## Scope

Review account layout changes, versioning, realloc behavior, migration idempotency, rollback limits, authority custody, timelock or governance approvals, fork or localnet simulation, and byte-diff or account-diff evidence.

## Required Output

- State whether the migration is a `Confirmed Finding`, `Hypothesis`, `Residual Risk`, or release-gate blocker.
- Map issues to the focused references above.
- Name evidence for account layout compatibility, migration replay or resume behavior, authority and timelock controls, simulation coverage, rollback limits, and post-migration account diffs.
- Treat missing evidence for a required mainnet migration check as release-gate `FAIL`.

## Verification Targets

Prefer fork/localnet simulation against representative live accounts, pre/post account-diff review, byte-diff or build provenance checks, negative tests for repeated migration, and explicit rollback or pause drills where the trust model requires them.
