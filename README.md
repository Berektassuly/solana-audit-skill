# Solana Audit Skill

An evidence-backed Agent Skill for Solana security reviews, audit planning, exploit analysis, and report-driven vulnerability taxonomy work.

## Overview

This repository packages a taxonomy-first Solana audit skill for Agent Skills-compatible tools such as Claude Code and similar IDE agents.

The pack focuses on repeated Solana failure modes that show up across public audits, disclosures, and incident write-ups:

- account validation and account relationship failures
- signer and authority enforcement gaps
- PDA seed, bump, and domain-separation mistakes
- arbitrary CPI and trust-boundary failures
- Token and Token-2022 integration assumptions
- arithmetic, accounting, and value leakage bugs
- state-machine and lifecycle bugs
- governance, upgrade, oracle, liveness, and wallet-boundary risks

It also distinguishes code-level exploit classes from broader residual risk in governance, wallet, client, phishing, and developer-environment boundaries rather than treating public incident headlines as a pure proxy for on-chain bug density.

## Installation

### Quick Install With `npx`

```bash
npx skills add Berektassuly/solana-audit-skill --skill solana-audit
```

This is the recommended installation path for Agent Skills-compatible environments.

## Repository Structure

```text
solana-audit-skill/
|-- .gitignore
|-- LICENSE
|-- README.md
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
|       |   |-- client-wallet-ux.md
|       |   |-- durable-nonce-governance.md
|       |   |-- token-2022-transfer-hooks.md
|       |   `-- zk-proof-soundness.md
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
- "Review this Token-2022 transfer-hook path for callback and extra-account trust-boundary risks"
- "Review this Solana program for CPI trust-boundary issues"
- "Digest this public audit report and map the findings to a normalized taxonomy"
- "Prepare an audit plan for this governance upgrade path"
- "Analyze this durable nonce governance flow for delayed-execution admin risk"

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
- [Official Solana Foundation security disclosures and ecosystem security material](https://solana.com/news/solana-ecosystem-security)
- public incident analyses such as BlockSec, Chainalysis, and TRM Labs where they materially clarify the first boundary crossed in a class-defining case

See [`skill/references/resources.md`](skill/references/resources.md) for the full source index used by this pack.

## Progressive Disclosure

The main `SKILL.md` is kept compact and operational. Detailed audit material lives under `skill/references/` so the agent can read only the parts relevant to the current engagement:

- workflows for engagement planning and writeups
- checklists for intake, program review, client review, and release blocking
- taxonomy notes for canonical Solana vulnerability classes
- corpus and cross-report references for normalization work

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
