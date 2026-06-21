---
title: Transaction Safety Workflow
description: Audit workflow for reviewing concrete Solana transactions, wallet prompts, backend signer actions, serialized transactions, and agent-proposed actions before signing.
---

# Transaction Safety Workflow

Use this workflow when the security question is about a specific Solana transaction or transaction plan before it is signed. This is a review artifact, not a signing or transaction-sending procedure.

Related references:

- [Client and wallet UX](../taxonomy/client-wallet-ux.md)
- [Token integration](../taxonomy/token-integration.md)
- [Token-2022 transfer hooks](../taxonomy/token-2022-transfer-hooks.md)
- [Upgrade and governance](../taxonomy/upgrade-admin-governance.md)
- [Release gate workflow](release-gate-workflow.md)

## Decision Labels

Use exactly these labels:

1. `AUTONOMOUS_OK`: the reviewed action matches a pre-approved, bounded policy and has no value, authority, delegate, owner, close, upgrade, or config effect beyond the approved fee cap.
2. `CONFIRM_REQUIRED`: the transaction may be valid, but a human must approve the exact decoded effects before any signer proceeds.
3. `NEVER_AUTO_SIGN`: the action is not appropriate for unattended signing, even if it simulates successfully.
4. `NEEDS_MORE_INFO`: critical facts are missing; do not guess a pass.

If more than one label applies, use the strictest label.

## Required Facts

Collect these before assigning a label:

1. user intent and source of that intent
2. cluster, RPC source, and finality target
3. signer roles, fee payer, and any backend signer or PDA signer involvement
4. program IDs, instruction names, address lookup tables, and writable accounts
5. token program variant, token mints, token accounts, decimals, and relevant Token-2022 extensions
6. expected SOL, token, account-data, owner, delegate, and authority deltas
7. user-approved limits: max input, min output, slippage, fee cap, priority fee cap, expiry, and route constraints
8. simulation result, logs, account deltas, token deltas, compute budget, blockhash, or durable nonce details

If a value-moving or authority-changing transaction lacks the facts needed to verify intent, return `NEEDS_MORE_INFO`.

## Review Procedure

1. Decode the concrete transaction or instruction list. For a wallet prompt, compare the prompt to decoded instructions. For a natural-language plan, treat the plan as incomplete until a concrete transaction exists.
2. Compare decoded effects to user intent. Every extra instruction, program ID, writable account, address lookup table entry, token mint, fee, and close destination must be explained by the intent.
3. Review signer privilege. Distinguish user wallet, backend signer, PDA signer, multisig, delegate, relayer, and session-key authority.
4. Apply the hard stops below. One unsafe instruction makes the whole transaction unsafe for unattended signing.
5. Treat simulation as evidence only. Simulation can reveal deltas and logs; it does not approve the transaction.
6. Produce a review card with the label, evidence, missing data, and next safe review step.

## Hard Stops

Return `NEVER_AUTO_SIGN` for unattended signing when the transaction includes:

1. mint, freeze, close, owner, delegate, permanent delegate, transfer-hook authority, metadata authority, transfer-fee authority, or confidential-transfer authority changes
2. program upgrade, buffer authority change, governance execution, admin mutation, pause mutation, config mutation, or protocol parameter change
3. unlimited or unclear token approvals, delegates, burns, freezes, clawbacks, blacklists, close-account actions, or account owner changes
4. unknown writable accounts, unexpected address lookup table entries, or writable accounts not tied to the user's stated intent
5. value movement without exact mints, accounts, max input, min output, slippage, fee cap, expiry, and finality target
6. mismatch between stated intent, wallet prompt, decoded instructions, and simulated account or token deltas

These actions may still be legitimate governance or admin operations, but they require explicit human, multisig, or release-gate approval outside an autonomous signing path.

## Simulation Review

Inspect:

1. non-null `err`, custom errors, and failed inner instructions
2. invoked programs, CPI depth, logs, warnings, and compute-unit consumption
3. pre/post SOL balances, token balances, mint identities, token owners, delegates, and close destinations
4. writable account data changes, account owner changes, created accounts, and closed accounts
5. address lookup table entries, compute budget instructions, priority fee, blockhash freshness, durable nonce state, and retry behavior

A successful simulation with unsafe deltas is still unsafe. A missing simulation for material value or authority changes usually means `NEEDS_MORE_INFO`, unless a documented policy already covers that exact operation.

## Backend Signer Policy

For backend signers, require an auditable policy record:

1. policy name, version, approver, expiry, and rollback or revocation procedure
2. allowed programs, mints, accounts, instruction types, max value, fee caps, and finality target
3. decoded effects and simulation hash for the specific transaction
4. per-transaction log tying intent, decoded transaction, simulation evidence, signer, and outcome together

If the signer policy is absent, stale, or broader than the decoded action, label the transaction `CONFIRM_REQUIRED` or `NEVER_AUTO_SIGN` depending on the effect.

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

Do not say "safe to sign" unless the label and evidence are precise. Prefer "matches this bounded policy" or "requires explicit confirmation."

## Minimum Negative Cases

When reviewing tests or release evidence, look for:

1. missing token mint or wrong token program variant returns `NEEDS_MORE_INFO` or rejects
2. simulation success with unexpected writable account or token delta is not auto-approved
3. authority change is never classified as `AUTONOMOUS_OK`
4. backend signer rejects transactions outside allowed programs, mints, accounts, max value, and expiry
5. address lookup table, durable nonce, compute budget, and priority fee changes are visible in the review record
