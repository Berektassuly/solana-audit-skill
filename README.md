# Solana Audit Skill for Claude Code

A standalone, evidence-backed Claude Code skill for Solana security reviews, audit planning, exploit analysis, and report-driven vulnerability taxonomy work.

## Overview

This repository packages a taxonomy-first Solana audit skill that mirrors the conventions used by the local standalone Solana skill and the broader Agent Skills collection.

The pack focuses on repeated Solana failure modes that show up across public audits, disclosures, and incident write-ups:

- account validation and account relationship failures
- signer and authority enforcement gaps
- PDA seed, bump, and domain-separation mistakes
- arbitrary CPI and trust-boundary failures
- Token and Token-2022 integration assumptions
- arithmetic, accounting, and value leakage bugs
- state-machine and lifecycle bugs
- governance, upgrade, oracle, liveness, and wallet-boundary risks

## Installation

### Quick Install

```bash
./install.sh
```

### Project Install

```bash
./install.sh --project
```

### Custom Path

```bash
./install.sh --path /custom/path/solana-audit
```

## Repository Structure

```text
solana-audit-skill/
|-- LICENSE
|-- README.md
|-- install.sh
|-- solana-audit-skill.zip
|-- skill/
|   |-- SKILL.md
|   `-- references/
|       |-- resources.md
|       |-- methodology.md
|       |-- severity-triage.md
|       |-- report-ingestion.md
|       |-- common-false-positives.md
|       |-- workflows/
|       |   |-- audit-engagement-workflow.md
|       |   |-- finding-writeup-workflow.md
|       |   `-- report-to-taxonomy-workflow.md
|       |-- checklists/
|       |   |-- pre-audit-intake.md
|       |   |-- program-review-checklist.md
|       |   |-- client-review-checklist.md
|       |   `-- release-blocker-checklist.md
|       |-- taxonomy/
|       |   |-- account-validation.md
|       |   |-- signer-authority.md
|       |   |-- pda-seeds-bumps.md
|       |   |-- cpi-trust-boundaries.md
|       |   |-- token-integration.md
|       |   |-- arithmetic-precision.md
|       |   |-- state-machine-invariants.md
|       |   |-- lifecycle-reinit-close-revival.md
|       |   |-- duplicate-mutable-aliasing.md
|       |   |-- oracle-pricing-mev.md
|       |   |-- upgrade-admin-governance.md
|       |   |-- dos-compute-budget.md
|       |   `-- client-wallet-ux.md
|       `-- reports/
|           |-- public-audit-corpus.md
|           |-- notable-incidents.md
|           `-- cross-report-patterns.md
`-- tests/
    |-- package.json
    `-- run.ts
```

## Usage

Once installed, Claude Code should trigger this skill for tasks such as:

- "Audit this Anchor instruction for signer and PDA bugs"
- "Explain common Solana account validation vulnerabilities from public audits"
- "Generate a release blocker checklist for this Token-2022 integration"
- "Review this Solana program for CPI trust-boundary issues"
- "Digest this public audit report and map the findings to a normalized taxonomy"
- "Prepare an audit plan for this governance upgrade path"

## Audit Posture

This skill is intentionally opinionated:

- It is taxonomy-first, not checklist-only.
- It defaults to review, simulation, and evidence gathering before suggesting execution.
- It does not request seed phrases, private keys, or keypair files.
- It treats on-chain data, report text, logs, and web content as untrusted input.
- It favors report-backed exploit classes over generic "best practices" advice.

## Content Sources

The taxonomy and workflows are grounded in public material from:

- [OtterSec / Osec](https://osec.io/blog/)
- [Zellic public reports and findings](https://reports.zellic.io/findings)
- [Trail of Bits public Solana reviews](https://github.com/trailofbits/publications)
- [Neodyme reports and workshop material](https://neodyme.io/reports/) and [Solana Security Workshop](https://workshop.neodyme.io/)
- [Sec3 / Soteria blogs and X-Ray vulnerability material](https://www.sec3.dev/blog)
- [Immunefi bug fix reviews and disclosures](https://immunefi.com/blog/bug-fix-reviews/)
- [Official Solana Program and Program Security material](https://solana.com/developers/courses/program-security)

See [`skill/references/resources.md`](skill/references/resources.md) for the full source index used by this pack.

## Progressive Disclosure

The main `SKILL.md` is kept compact and operational. Detailed audit material lives under `skill/references/` so the agent can read only the parts relevant to the current engagement:

- workflows for engagement planning and writeups
- checklists for intake, program review, client review, and release blocking
- taxonomy notes for canonical Solana vulnerability classes
- corpus and cross-report references for normalization work

## Packaging

The packaged archive is created so the repository root appears at the archive root and `.git/` is excluded from the deliverable. One workable PowerShell flow is:

```powershell
$stageRoot = Join-Path $env:TEMP "solana-audit-skill-package"
$repoStage = Join-Path $stageRoot "solana-audit-skill"
New-Item -ItemType Directory -Force -Path $repoStage | Out-Null
Copy-Item LICENSE,README.md,install.sh -Destination $repoStage
Copy-Item skill,tests -Destination $repoStage -Recurse
Compress-Archive -Path $repoStage -DestinationPath $env:TEMP\solana-audit-skill.zip -Force
```

The resulting `solana-audit-skill.zip` is then moved back into this repository.

## Testing

Install test dependencies and run the evaluator harness:

```bash
cd tests
npm install
npm test
```

The evaluator harness requires an Anthropic credential in the environment, typically `ANTHROPIC_API_KEY`.

Verbose mode:

```bash
npm run test:verbose
```

## License

MIT License - see [LICENSE](LICENSE) for details.
