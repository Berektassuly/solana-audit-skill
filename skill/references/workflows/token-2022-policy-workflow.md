---
title: Token-2022 Policy Workflow
description: Audit workflow for deciding whether a Solana integration should support Token-2022, which extensions are accepted, and what accounting, compatibility, and test evidence is required.
---

# Token-2022 Policy Workflow

Use this workflow when reviewing a program, client, payment flow, vault, router, or release that accepts or issues Token-2022 assets. This is an audit policy workflow, not token creation guidance.

Related references:

- [Token integration](../taxonomy/token-integration.md)
- [Token-2022 transfer hooks](../taxonomy/token-2022-transfer-hooks.md)
- [Program review checklist](../checklists/program-review-checklist.md)
- [Release blocker checklist](../checklists/release-blocker-checklist.md)
- [Formal verification handoff](formal-verification-handoff.md)

## Step 0: Decide Whether Token-2022 Is Necessary

Start with the decision question:

1. Does the integration need Token-2022 behavior, or would classic SPL Token be safer and more compatible?
2. If Token-2022 is required, which exact behavior is required: transfer fees, hooks, memo requirements, default frozen accounts, permanent delegate, metadata, pausing, scaled UI amount, interest-bearing display, CPI guard, confidential transfer, or another extension?
3. If the integration only needs ordinary fungible transfers, prefer rejecting Token-2022 or limiting it to a documented allowlist.

Record the answer as an audit assumption, not as a product preference.

## Step 1: Write An Extension Support Policy

For every supported mint or asset class, write a table:

| Extension or behavior | Policy | Evidence required | Residual risk |
|---|---|---|---|
| Transfer fee | supported/rejected/residual risk | balance-delta tests, fee lifecycle review | over-credit, close failure |
| Transfer hook | supported/rejected/residual risk | hook program policy, extra-account validation | callback and liveness risk |

Use only three policy states:

1. `supported`: code, tests, and operational procedures explicitly handle the behavior.
2. `rejected`: the integration detects and rejects the behavior before value or authority changes.
3. `residual risk`: the behavior is accepted by trust model or business decision, but the remaining risk is documented for the report.

Unsupported extensions should fail closed before accounting state changes or signer approval.

## Step 2: Verify Compatibility Evidence

Do not freeze wallet, DEX, CEX, merchant, vault, or protocol support tables into audit docs as permanent facts. Instead, require current evidence for the actual surfaces in scope:

1. target wallets can display and sign the expected flows
2. target DEXs, CEXs, merchants, vaults, custodians, or protocols support the exact mint and extension mix
3. transfer hooks are actually invoked where the security model relies on them
4. fee-bearing mints are credited by net received amount, not gross requested amount
5. memo-required, default-frozen, pausable, and CPI-guarded accounts fail or proceed according to documented policy

If compatibility matters to release readiness and the evidence is missing, treat it as a release risk rather than filling the gap with assumptions.

## Step 3: Review Accounting And Lifecycle

For transfer-fee mints, "gross sent" is not "net received." Review:

1. fee-aware transfer construction where applicable
2. destination balance snapshots before and after transfer, with credit based on the actual delta
3. withheld-fee accumulation, harvest, withdraw authority, and treasury reconciliation
4. close-account paths where withheld fees can block closure or strand lamports
5. fee schedule changes, maximum fee caps, and epoch-dependent fee behavior where the integration relies on exact fee values

For any nonstandard token behavior, prefer balance-delta verification over trusting the requested transfer amount.

## Step 4: Review Extension-Specific Authority And Trust

Review these as security surfaces:

1. permanent delegate can move or burn holder balances according to its authority
2. default frozen accounts require an explicit thaw or approval path
3. pausable tokens and freeze authorities can block movement and exits
4. transfer hooks introduce external program execution and extra-account resolution
5. metadata pointer, group pointer, or token metadata mismatch can mislead clients or allow identity confusion
6. scaled UI amount and interest-bearing display change presentation without changing raw amount
7. memo-required accounts and CPI guard can make otherwise valid transfers fail
8. confidential-transfer integrations require proof, auditor-key, availability, and failure-mode assumptions to be current at review time

Avoid reporting extension presence alone as a vulnerability. Report the integration assumption that makes the extension dangerous.

## Step 5: Required Test Targets

Minimum negative cases for a Token-2022-supporting integration:

1. wrong token program variant
2. unsupported extension mix
3. fee-bearing mint with net-received amount lower than requested amount
4. hook-bearing mint with unexpected or unapproved hook program
5. memo-required destination without memo
6. default frozen destination or source account
7. permanent delegate present on an accepted mint
8. close path with withheld fees still present

For accepted extensions, add one positive test that proves the documented behavior works and one negative test that proves unsupported behavior is rejected before state mutation.

## Output Shape

```markdown
## Token-2022 Policy

Decision: support / reject / allowlist only
Why Token-2022 is needed:
Accepted token program variants:
Accepted mints:
Extension policy:
Compatibility evidence:
Accounting evidence:
Authority and lifecycle notes:
Tests reviewed:
Residual risk:
```

Keep the policy specific to the reviewed integration. Do not claim ecosystem-wide support or current mainnet status unless it was verified during the review.
