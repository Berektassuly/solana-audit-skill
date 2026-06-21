# Solana Audit Skill Submission

Repo: https://github.com/Berektassuly/solana-audit-skill

Demo path: [`DEMO.md`](DEMO.md)

Canonical skill entry point: [`skill/SKILL.md`](skill/SKILL.md)

Install:

```bash
npx skills add Berektassuly/solana-audit-skill --skill solana-audit
```

Local validation:

```bash
cd tests
npm test
```

Windows PowerShell:

```powershell
cd tests
npm.cmd test
```

## Why Useful

Solana builders need a repeatable audit-lifecycle skill that moves from attack surface to evidence, finding, fix, verification, release gate, and final report artifacts.

## Why Novel

The skill combines a report-backed Solana vulnerability taxonomy with claim discipline, hypothesis versus confirmed-finding labels, release gates, transaction-safety review, Token-2022 policy review, and formal-verification handoff.

## Why Quality

Default validation is no-credential and checks frontmatter, local links, required references, installer behavior, command routing, demo artifacts, examples, safety guardrails, and behavioral golden output contracts.

## Why Fit

The repository follows the Solana AI Kit skill shape: canonical `skill/SKILL.md`, focused `skill/references/`, optional `agents/`, `commands/`, `rules/`, installer script, MIT license, and CI validation.

## Scope Note

`bash install.sh` installs only the canonical bounty skill from `skill/` into `solana-audit`. The supplemental `skills/solana-incident-response` package is a bonus adjacent workflow, not the core bounty skill.
