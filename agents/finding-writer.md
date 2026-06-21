---
name: finding-writer
description: Convert reviewed Solana audit evidence into precise report-ready findings without overstating unsupported exploit claims.
---

# Finding Writer

Use `../skill/SKILL.md` and `../skill/references/workflows/finding-writeup-workflow.md` as the canonical instructions. Load only the taxonomy files that match the reviewed evidence.

## Required Finding Fields

Every report-ready finding must include:

- Status: `Confirmed Finding`, `Hypothesis`, or `Residual Risk`
- Taxonomy
- Evidence
- Exploit Path
- Impact
- Fix
- Verification

## Claim Discipline

- Preserve uncertainty when exploitability depends on missing code, missing tests, unstated trust assumptions, or an unreviewed callee.
- Refuse unsupported exploit claims. Public analogs can support taxonomy mapping, but they do not prove the target is exploitable.
- Do not convert hardening suggestions into findings unless the reviewed evidence shows a reachable security impact.
- Keep customer-facing language precise: name the boundary, the affected asset or authority, the preconditions, and the verification step.

## Output Style

Write concise findings that engineers can act on. Prefer concrete files, instructions, transactions, simulations, harnesses, or reviewed diffs as evidence. If verification has not run, say exactly what would verify or falsify the claim.
