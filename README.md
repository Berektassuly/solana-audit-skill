# Solana Audit Skill

From public Solana failures to audit-ready findings: solana-audit turns real report-backed vulnerability patterns into progressive audit workflows for attack-surface mapping, pre-audit design review, transaction signing boundaries, Token-2022 policy, payment verification, release gates, severity triage, finding writeups, remediation verification, formal-verification handoff, and final audit reports.

An evidence-backed Agent Skill for Solana security reviews, audit planning, exploit-path analysis, transaction and payment boundary review, remediation verification, release-readiness review, and report-driven vulnerability taxonomy work.

In 60 seconds, a judge should see the prompt, the references loaded, the output contract, and one compact finding with Evidence, Impact, Fix, and Verification. This repo keeps that path short while preserving the deeper taxonomy under `skill/references/`.

## What Problem This Solves

Solana audits are easy to flatten into generic lists like "check signers" or "validate accounts." That misses the part reviewers actually need: the exploit path, the Solana account model boundary that failed, the public evidence behind the class, and the smallest verification step that proves a fix works.

Builders do not only need another list of Solana security checks. They need an agent that can move from scope and attack surface to evidence, exploit path, severity, fix, verification, and customer-facing report artifacts without pretending every suspicion is a confirmed exploit.

This repository packages that audit lifecycle into a compact Agent Skill. It helps agents:

- classify Solana and Anchor attack surface before reviewing details
- map observations to report-backed vulnerability classes
- write findings with evidence, impact, fix, and verification
- generate audit-readiness, pre-audit design review, release-gate, transaction-safety, payment-audit, Token-2022 policy, remediation, formal verification handoff, and final-report workflows
- review client signing, backend signer, concrete transaction, payment verification, and release-readiness boundaries without signing or sending transactions
- produce final audit report artifacts from confirmed findings, resolved hypotheses, and residual risk
- digest public Solana audit reports into a normalized taxonomy

## Why This Is Not Just Another Checklist

The skill is taxonomy-first and evidence-backed. `skill/SKILL.md` stays concise and routes to focused references only when needed. Detailed material lives under `skill/references/`, including workflows, checklists, severity triage, public audit corpus notes, incident summaries, false-positive guidance, and taxonomy files for canonical Solana bug classes.

The result is token-efficient progressive disclosure: an agent can start with the operating procedure, then load only the relevant taxonomy file or workflow for the engagement in front of it.

## What Makes It Novel

The novelty is the lifecycle plus evidence discipline: a normalized public-report taxonomy, explicit hypothesis versus confirmed-finding labels, residual-risk handling, and formal-verification handoff for LiteSVM, Mollusk, SBF harnesses, QEDGen, Lean, or Kani-style workflows.

- Normalizes Solana findings across public reports instead of inheriting one firm's naming scheme.
- Separates exploitability from hardening, residual governance risk, wallet/client risk, and operational risk.
- Covers Solana-specific classes such as PDA seed and bump mistakes, CPI trust boundaries, duplicate mutable aliasing, lifecycle revival, Token-2022 transfer hooks, durable nonce governance abuse, and Token-2022 confidential-transfer proof assumptions.
- Enforces a claim discipline: findings should cite public analogs or local evidence, explain impact, propose a fix, and include verification.
- Adds audit workflows for pre-audit design review, concrete transaction safety review, Solana payment verification, Token-2022 support policy, and machine-readable release gates.
- Keeps operational and client-side risk visible without turning the skill into a wallet, scanner, deployment, payment, or token-creation tool.
- Adds a formal verification handoff workflow for LiteSVM property tests, Mollusk or SBF-focused harnesses, and proof-oriented handoff without overclaiming verification results.
- Adds a final audit report template that separates confirmed findings, resolved hypotheses, residual risk, remediation status, and limitations.

## 60-Second Judge Demo

User prompt:

```text
Audit this Anchor vault claim path. It accepts Token-2022 mints, uses a PDA vault authority, and passes a reward mint through remaining_accounts before a rewards CPI. Produce one audit finding if the issue is supported.
```

References the agent should load:

- `skill/SKILL.md`
- `skill/references/workflows/finding-writeup-workflow.md`
- `skill/references/taxonomy/account-validation.md`
- `skill/references/taxonomy/token-integration.md`
- `skill/references/taxonomy/cpi-trust-boundaries.md`

Output contract:

- classify the result as `Hypothesis`, `Confirmed Finding`, or `Residual Risk`
- map it to the taxonomy
- include Evidence, Impact, Fix, and Verification
- state false-positive conditions when exploitability depends on missing code or tests

Compact sample finding:

```text
Status: Hypothesis
Taxonomy: account-validation, token-integration, cpi-trust-boundaries

Evidence:
The claim path passes `ctx.remaining_accounts[0]` as the reward mint into the rewards CPI. The prompt does not show a check that binds this mint to vault state, an allowlist, the expected token program variant, or supported Token-2022 extensions before CPI construction.

Impact:
If reachable, an attacker may redirect reward accounting or execution through an unintended mint. This is not a confirmed drain until the review proves the CPI can credit value or mutate vault accounting with the attacker-selected mint.

Fix:
Bind the reward mint to vault state or an allowlist, validate owner and token program variant, reject unsupported Token-2022 extension behavior, and perform these checks before building the CPI or forwarding signer seeds.

Verification:
Add regression tests that provide a wrong mint, wrong token program variant, and unsupported Token-2022 extension mix through `remaining_accounts`; each test should reject before CPI and before state mutation.
```

For complete prompt-to-artifact examples, see `examples/audit-plan-example.md`, `examples/finding-writeup-example.md`, and `examples/final-report-example.md`.

## Repository Structure

```text
solana-audit-skill/
|-- AGENTS.md
|-- LICENSE
|-- README.md
|-- install.sh
|-- commands/
|   `-- audit-solana.md
|-- examples/
|   |-- audit-plan-example.md
|   |-- finding-writeup-example.md
|   `-- final-report-example.md
|-- skill/
|   |-- SKILL.md
|   `-- references/
|       |-- checklists/
|       |-- reports/
|       |-- taxonomy/
|       `-- workflows/
|-- skills/
|   `-- solana-incident-response/
|       |-- SKILL.md
|       |-- agents/
|       `-- references/
`-- tests/
    |-- golden-validation.ts
    |-- package.json
    |-- run.ts
    `-- static-validation.ts
```

## Installation

### Skills CLI

```bash
npx skills add Berektassuly/solana-audit-skill --skill solana-audit
```

Use the skill without installing it:

```bash
npx skills use Berektassuly/solana-audit-skill --skill solana-audit
```

On Windows PowerShell, use `npx.cmd` if script execution policy blocks `npx.ps1`.

### Bash Installer

The installer targets macOS, Linux, WSL, and Git Bash. It copies the contents of `skill/` into a target directory named `solana-audit` and is safe to rerun.

```bash
bash install.sh
```

Default Claude-style install path:

```text
~/.claude/skills/solana-audit
```

Install for `.agents`-style runtimes:

```bash
bash install.sh --agents
```

Custom target path:

```bash
bash install.sh --path ~/.claude/skills/solana-audit
bash install.sh ~/.agents/skills/solana-audit
```

When passing custom Windows paths through WSL or Git Bash, prefer POSIX-style or forward-slash paths:

```bash
bash install.sh --path /mnt/c/Users/you/.claude/skills/solana-audit
bash install.sh --path C:/Users/you/.agents/skills/solana-audit
```

Backslash-style `C:\...` arguments can be interpreted by the shell before the installer sees them, so this repo does not claim support for that form. Windows users who do not use WSL or Git Bash should prefer the Skills CLI or manually copy `skill/` to the desired skill directory.

The bash installer remains scoped to the canonical `solana-audit` package under `skill/`.

## Solana AI Kit Integration

Add this repository as an external skill submodule:

```bash
git submodule add https://github.com/Berektassuly/solana-audit-skill .claude/skills/ext/solana-audit
```

The Solana AI Kit skill hub should route Solana audit lifecycle requests to:

```text
.claude/skills/ext/solana-audit/skill/SKILL.md
```

Useful routing triggers include audit, security review, exploit analysis, signer bugs, PDA bugs, CPI trust boundaries, Token-2022 integration risk, Token-2022 policy, Solana payment verification, decoded transaction review, pre-sign transaction safety, backend signer policy, pre-audit design review, public audit report digestion, remediation verification, release gates, release blockers, and final report generation.

For this bounty submission, add these triggers when wiring the Solana AI Kit hub: Solana audit, Anchor audit, signer bugs, PDA bugs, CPI trust boundaries, Token-2022 integration risk, Token-2022 policy workflow, payment audit workflow, transaction safety workflow, pre-audit design review, formal verification handoff, audit report generation, release gates, release blockers, remediation verification, incident-to-audit taxonomy mapping.

For non-Claude or Codex-style setups that use `.agents`:

```bash
git submodule add https://github.com/Berektassuly/solana-audit-skill .agents/skills/ext/solana-audit
```

Route to:

```text
.agents/skills/ext/solana-audit/skill/SKILL.md
```

## Skills CLI Compatibility

The canonical layout remains `skill/SKILL.md`, matching Solana AI Kit-style external skill repos. The Skills CLI discovers that layout, so this repo does not add a root `SKILL.md` compatibility shim.

Useful local compatibility checks:

```bash
npx.cmd skills add . --list
npx.cmd skills use . --skill solana-audit
npx.cmd skills use . --skill solana-incident-response
```

These commands exercise the canonical audit skill and the supplemental incident-response package. Supplemental skills live under `skills/<skill-name>/SKILL.md`; this preserves the canonical audit entry point while allowing focused adjacent workflows.

## Usage

After installation, ask your agent for work such as:

```text
Audit this Anchor instruction for signer and PDA bugs.
Review this Solana program for CPI trust-boundary issues.
Run a pre-audit design review for this Anchor vault before implementation is frozen.
Generate a release blocker checklist for this Token-2022 integration.
Create a Token-2022 support policy for accepted collateral mints.
Review this decoded transaction before an agent or backend signer signs it.
Audit this Solana Pay checkout flow for server-side verification and replay risk.
Produce a release-gate verdict for this pre-mainnet upgrade.
Digest this public audit report and map the findings to the taxonomy.
Plan a formal verification handoff for these vault invariants.
Write a remediation verification plan for these Solana findings.
Create a final audit report from these confirmed findings.
```

This repo also ships a command file:

```text
commands/audit-solana.md
```

In command-aware agent setups, expose it as `/audit-solana` and have it route to `skill/SKILL.md`.

## Additional Skill: Solana Incident Response

This repo also includes a supplemental package:

```text
skills/solana-incident-response/SKILL.md
```

Use `solana-incident-response` for active or recent Solana incidents: suspicious transaction triage, transaction timeline reconstruction, evidence preservation, blast-radius classification, containment planning, and post-mortem drafting. It is a bonus adjacent workflow, not the bounty skill. It links back to the audit taxonomy when exploit classification is needed, but keeps incident operations in a separate workflow. The canonical bounty skill remains `skill/SKILL.md`; `skills/solana-incident-response` is supplemental.

## Examples

The `examples/` directory contains prompt-to-artifact contracts for:

- `examples/audit-plan-example.md`: taxonomy-first pre-mainnet audit planning.
- `examples/finding-writeup-example.md`: single finding draft with evidence, impact, fix, verification, severity, and false-positive conditions.
- `examples/final-report-example.md`: compact final audit report aligned to the final audit report template.

These examples are intentionally short and testable. They show how agents should route from `skill/SKILL.md` into the focused workflow and taxonomy references rather than copying large reference sections into commands.

## Evidence and References

The taxonomy and workflows are grounded in public material from:

- [OtterSec / Osec](https://osec.io/blog/)
- [Zellic public reports and findings](https://reports.zellic.io/findings)
- [Trail of Bits public Solana reviews](https://github.com/trailofbits/publications)
- [Neodyme reports and Solana Security Workshop](https://workshop.neodyme.io/)
- [Sec3 / Soteria blogs and X-Ray material](https://www.sec3.dev/blog)
- [Immunefi bug fix reviews and disclosures](https://immunefi.com/blog/bug-fix-reviews/)
- [Archived Solana Program Security course material](https://github.com/solana-foundation/developer-content/tree/main/content/courses/program-security)
- [Blueshift Program Security](https://learn.blueshift.gg/en/courses/program-security/introduction)
- [Anchor security exploits and Sealevel examples](https://www.anchor-lang.com/docs/references/security-exploits)
- [Anza security audits](https://github.com/anza-xyz/security-audits)
- [Official Solana ecosystem security material](https://solana.com/news/solana-ecosystem-security)

See [`skill/references/resources.md`](skill/references/resources.md) for the source index.

### Source Freshness

This source index was refreshed against public Solana AI Kit bounty research and current Solana security material on 2026-06-21. The corpus and workflows cover current Solana concerns such as Token-2022 extension assumptions, transfer hooks, concrete transaction review, payment verification, durable nonce governance risk, ZK proof soundness, upgrade migration risk, release gates, LiteSVM, Mollusk, and SBF-focused harness planning. These references support audit planning and finding writeups; they do not certify any target protocol as secure.

## Tests and Validation

Default validation requires no external credentials and does not require any paid API key:

```bash
cd tests
npm install
npm test
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```powershell
cd tests
npm.cmd test
```

`npm test` runs `tests/static-validation.ts` and the no-credential golden validation in `tests/golden-validation.ts`. Static validation checks skill frontmatter, packaged local links, required references, the installer smoke path, command files, README coverage, Skills CLI documentation, and placeholder hygiene. Golden validation checks the new workflow links, prompt-to-artifact examples, required headings, output-contract terms, safety constraints, and README coverage.

### Optional Model-Backed Evaluator

The optional model-backed evaluator remains available as a non-default script:

```bash
cd tests
npm run test:anthropic
npm run test:anthropic:verbose
```

Set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` before running the optional evaluator. It checks trigger matching and audit-plan behavior against live model responses. Do not run this optional evaluator as part of default validation unless those credentials are already available.

## Bounty Fit

Usefulness: gives Solana builders and auditors an end-to-end audit lifecycle skill, not only scattered security tips. Builders can move from scope and attack surface to design assumptions, transaction and payment boundary review, release-gate evidence, exploit path, severity, fix, verification, and customer-facing report artifacts without treating every suspicion as a reproduced exploit.

Novelty: normalizes repeated public Solana findings into a report-backed taxonomy with explicit claim and verification discipline, hypothesis versus confirmed-finding labels, residual-risk handling, pre-audit design review, transaction safety review, Token-2022 support policy, formal verification handoff, and final report generation.

Quality: uses progressive disclosure, static validation, no-credential golden tests, optional model-backed evaluation, safe installer behavior, MIT-compatible content, and no required paid API access for default tests.

Fit with Solana AI Kit: preserves the `skill/` layout used by Solana ecosystem skills, documents `.claude/skills/ext/solana-audit` routing, includes an `.agents` equivalent, adds a command file suitable for command-aware AI Kit setups, and keeps detailed taxonomy and workflow material under `skill/references/`.

Competitive differentiation: Transaction reliability, Token-2022, program-upgrade, diagnostics, and payment skills are useful narrow tools. solana-audit is the cross-cutting audit layer that evaluates those surfaces as evidence, residual risk, release blockers, and report-ready findings before launch or remediation signoff.

## Maintaining the Taxonomy

When adding a new taxonomy entry, prefer public audit reports, disclosed incidents, or official Solana security material. Do not create a new subclass from intuition alone. If coverage is thin, keep the wording narrow and state the evidence limit.

Recommended maintenance loop:

```bash
cd tests
npm test
```

For a PR into `solanabr/solana-auditor-skill`, preserve `skill/SKILL.md` as the canonical entry point and keep integration docs pointing to `skill/SKILL.md`.

## Metadata

- Canonical skill name: `solana-audit`
- Author: Berektassuly
- Compatibility: Agent Skills-compatible runtimes; Node.js 18+ for packaged tests
- License: MIT, see [LICENSE](LICENSE)
