---
title: Final Audit Report Template
description: Customer-facing Solana audit report structure for turning scoped review evidence, confirmed findings, resolved hypotheses, remediation status, and residual risk into a final artifact.
---

# Final Audit Report Template

Use this template when the user asks for a final audit report or customer-facing report artifact. Keep the report scoped to reviewed evidence. Do not imply certification of the full protocol unless the scope and evidence actually support that claim.

Related references:

- [Audit engagement workflow](audit-engagement-workflow.md)
- [Finding writeup workflow](finding-writeup-workflow.md)
- [Severity triage](../severity-triage.md)
- [Formal verification handoff](formal-verification-handoff.md)

## Claim Labels

Use these labels consistently:

1. `Confirmed`: reproduced locally, proven by code evidence, or otherwise supported by enough direct evidence to present as a finding.
2. `Hypothesis`: plausible issue that needs reproduction, missing source, or additional trust-model clarification.
3. `Resolved`: previously plausible or confirmed issue that the review falsified or the team remediated and verified.
4. `Residual Risk`: real remaining risk that is in scope for disclosure but not a code vulnerability requiring a patch.
5. `Out Of Scope`: material risk intentionally not reviewed.

## Report Structure

```markdown
# <Protocol Or Program> Security Review

## Executive Summary

State the reviewed scope, dates or commit range, headline result, and highest remaining risk. Mention the number of confirmed findings by severity and any material residual risk. Avoid marketing language and avoid claiming the protocol is secure.

## Scope

List:

- reviewed repositories and commits
- program IDs or planned deployment targets
- instructions, modules, IDL files, clients, scripts, or docs reviewed
- token program variants, accepted mints, or Token-2022 extensions reviewed
- governance, multisig, timelock, and upgrade assumptions reviewed
- explicit exclusions

## Methodology

Describe how the audit was performed:

- attack-surface map
- taxonomy-driven manual review
- tests, simulations, fuzzing, or formal handoff reviewed
- public analogue or report-backed taxonomy references used
- remediation verification method

## Attack Surface

Summarize the reviewed Solana-specific surfaces:

- account validation and relationship constraints
- signer and authority enforcement
- PDA seeds, bumps, and signer namespaces
- CPI callees and forwarded signer seeds
- token and Token-2022 integration assumptions
- lifecycle and state-machine transitions
- governance, upgrade, pause, and emergency controls
- client or wallet signing boundaries, if reviewed

## Findings Table

| ID | Severity | Status | Taxonomy | Title |
|---|---|---|---|---|
| A-01 | Medium | Confirmed | account-validation, token-integration | Example title |

## Detailed Findings

For each confirmed finding, use this structure:

### <ID>: <Title>

Status:
Severity:
Taxonomy:

Evidence:
Describe local code, test, transaction, or proof evidence. Name files, instructions, account flow, or harness artifacts. Do not invent line numbers.

Impact:
Describe asset, authority, liveness, governance, or trust-model impact and the conditions required.

Exploit Path:
1. Attacker-controlled precondition.
2. Instruction or CPI path.
3. Missing validation or broken invariant.
4. Unauthorized state change, value movement, or denial-of-service result.

Fix:
State the smallest credible mitigation and the protected invariant.

Verification:
State the test, harness, proof artifact, review diff, or command used to verify remediation. If not verified, say so.

## Hypotheses Versus Confirmed Findings

List hypotheses that were investigated and their outcome:

| ID | Status | Question | Evidence | Outcome |
|---|---|---|---|---|
| H-01 | Resolved | <hypothesis> | <evidence reviewed> | <why it is not a finding or how it was fixed> |

Keep this separate from confirmed findings so uncertain issues do not look reproduced.

## Residual Risk

List remaining risks that are not direct code findings, such as:

- upgrade authority, timelock, multisig, or operational trust assumptions
- unaudited external CPI callees
- unsupported Token-2022 extension behavior
- oracle, client, wallet, deployment, or monitoring assumptions
- formal properties that were proposed but not verified

For each residual risk, state owner, mitigation, and whether the team accepted it.

## Remediation Status

| ID | Team Response | Fix Commit | Verification |
|---|---|---|---|
| A-01 | Fixed/Accepted/Acknowledged | <commit or none> | <test or review evidence> |

Use `Accepted` for an intentional risk acceptance, `Acknowledged` for no patch yet, and `Fixed` only when a patch has been reviewed.

## Appendix: Source Corpus

Include the evidence corpus:

- reviewed repository URLs and commits
- IDLs, account diagrams, deployment manifests, or upgrade authority evidence
- tests or harnesses executed
- public reports or taxonomy references used
- formal verification or fuzzing artifacts

## Limitations

State boundaries plainly. Example:

This report covers the reviewed instructions and documents listed in scope; it does not certify the full protocol, frontend, multisig operations, oracle operations, deployment process, or future upgrades.
```

## Report Quality Checklist

Before finalizing:

1. Every confirmed finding has evidence, impact, exploit path, fix, and verification.
2. Hypotheses, confirmed findings, resolved items, residual risks, and out-of-scope items are separated.
3. Severity follows the outcome and blast-radius rubric, not the size of the diff.
4. Token-2022 and CPI claims name the exact accepted mint, extension, callee, or program ID assumption.
5. Remediation status says what was verified, not merely what was changed.
6. Limitations are visible enough that readers cannot mistake a compact review for full certification.
