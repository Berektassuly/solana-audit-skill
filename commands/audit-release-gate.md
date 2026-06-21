---
name: audit-release-gate
description: Produce a machine-readable Solana release gate using the solana-audit release workflow and evidence-backed PASS, FAIL, or SKIP checks.
---

# Audit Release Gate

Route first to `../skill/SKILL.md`, then load `../skill/references/workflows/release-gate-workflow.md` and only the taxonomy or checklist references needed for the release target.

## Required Output

Use machine-readable gate output:

```text
GATE: PASS|FAIL target=<program-or-release> blockers=<n> warnings=<n> skipped=<n>
CHECK: <name> status=PASS|FAIL|SKIP severity=<level> evidence="<reviewed evidence>" action="<required action>"
```

Rules:

- Every `FAIL` must map to a blocker, finding, or missing required evidence.
- Missing required evidence is `FAIL`, not `SKIP`.
- Use `SKIP` only when a check is not applicable or explicitly scoped out.
- Every `PASS` must name reviewed evidence such as a command result, test, simulation, artifact, byte diff, account diff, authority record, or approval record.

## Minimum Review Areas

Review authority custody, build provenance, compute and liveness, account size and realloc, upgrade or migration lifecycle, release controls, and transaction landing evidence when they apply to the release.
