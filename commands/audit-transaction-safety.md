---
name: audit-transaction-safety
description: Review a concrete Solana transaction, wallet prompt, backend signer action, or agent-proposed action before signing.
---

# Audit Transaction Safety

Route first to `../skill/SKILL.md`, then load `../skill/references/workflows/transaction-safety-workflow.md` and any focused taxonomy references needed for the decoded action.

## Required Decision

Return exactly one decision label:

- `AUTONOMOUS_OK`
- `CONFIRM_REQUIRED`
- `NEVER_AUTO_SIGN`
- `NEEDS_MORE_INFO`

Simulation success is evidence, not approval.

## Required Review When Data Is Available

Review account deltas, signer roles, authority changes, token mints and token accounts, token program variants, CPI callees, writable accounts, address lookup tables, policy-risk boundaries, simulation logs, compute budget, blockhash or durable nonce behavior, and user-approved limits.

If the transaction is value-moving or authority-changing and the facts needed to verify intent are missing, use `NEEDS_MORE_INFO` or a stricter label.

## Output Shape

```text
Decision: AUTONOMOUS_OK | CONFIRM_REQUIRED | NEVER_AUTO_SIGN | NEEDS_MORE_INFO
Intent:
Evidence reviewed:
Expected effects:
Blocking issues:
Missing data:
Required approval:
Next safe review step:
```
