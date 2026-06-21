---
name: audit-solana
description: Run an end-to-end Solana or Anchor audit workflow using the solana-audit skill, taxonomy references, severity triage, and evidence-backed report output.
---

# Audit Solana

Use [../skill/SKILL.md](../skill/SKILL.md) as the canonical instruction source. Load only the references needed for the current scope.

## Workflow

1. Confirm intake and scope: programs, instructions, token programs, upgrade authority, admin model, client or wallet boundary, tests, and deployment target.
2. Classify attack surface before reviewing details: account validation, signer and authority, PDA seeds and bumps, CPI trust boundaries, token integration, arithmetic and accounting, state machines, lifecycle and closure, oracle assumptions, governance and upgrade risk, liveness, client and wallet UX, Token-2022, durable nonce governance, or ZK proof soundness.
3. Review by taxonomy class, not by tool output alone. Use the closest reference under `../skill/references/taxonomy/` when a class is relevant.
4. Triage severity with [../skill/references/severity-triage.md](../skill/references/severity-triage.md). Separate confirmed exploitability, hardening, false-positive conditions, and residual risk.
5. Write findings with [../skill/references/workflows/finding-writeup-workflow.md](../skill/references/workflows/finding-writeup-workflow.md): evidence, exploit path, impact, fix, and verification.
6. Verify remediation with targeted tests, local reproduction, invariant checks, or simulation. Do not present a fix as verified until the verification step is actually reviewed.
7. Generate the final report from confirmed findings, unresolved assumptions, residual risks, and remediation status.

## Required Output Contract

For each finding, lead with:

- Evidence: file, line, transaction, report citation, or reproduced behavior.
- Impact: what an attacker can gain, break, or block, and under what preconditions.
- Fix: the smallest credible mitigation tied to the protected invariant.
- Verification: the test, invariant, reproduction, or review step that proves the fix.

Label unverified suspicions as hypotheses. Do not imply exploit reproduction from pattern similarity alone.

## Useful References

- Engagement workflow: [../skill/references/workflows/audit-engagement-workflow.md](../skill/references/workflows/audit-engagement-workflow.md)
- Intake checklist: [../skill/references/checklists/pre-audit-intake.md](../skill/references/checklists/pre-audit-intake.md)
- Program review checklist: [../skill/references/checklists/program-review-checklist.md](../skill/references/checklists/program-review-checklist.md)
- Client review checklist: [../skill/references/checklists/client-review-checklist.md](../skill/references/checklists/client-review-checklist.md)
- Release blockers: [../skill/references/checklists/release-blocker-checklist.md](../skill/references/checklists/release-blocker-checklist.md)
- Public corpus: [../skill/references/reports/public-audit-corpus.md](../skill/references/reports/public-audit-corpus.md)
