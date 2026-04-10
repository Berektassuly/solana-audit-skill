---
title: Taxonomy Methodology
description: Rules for normalizing Solana audit findings into a defensible, report-backed taxonomy without inventing unsupported categories.
---

# Taxonomy Methodology

This repository does not treat one firm's naming scheme as the taxonomy. It normalizes repeated exploit mechanics across firms into canonical Solana review classes.

## Normalization rules

1. A category must map to an exploit mechanic, not to a vague theme.
2. Auditor-specific names are merged only when the exploit path is materially the same.
3. Adjacent risks stay separate when the exploit mechanics differ.

Examples:

- "missing owner check", "account validation bypass", and "fake account accepted" map to `account-validation`
- "arbitrary CPI", "untrusted program invocation", and "instruction-program spoofing" map to `cpi-trust-boundaries`
- "reinitialization", "revival", and "close-and-reopen" stay under a shared lifecycle family, but `duplicate-mutable-aliasing` stays separate because it is a same-account alias hazard rather than an account lifecycle bug

## Evidence threshold

Use a canonical class only if one of these is true:

1. There are at least two independent public findings with substantially the same exploit path.
2. There is one strong public finding plus one authoritative technical write-up or disclosure.

If neither threshold is met:

1. keep the discussion in a narrower boundary-pattern note
2. do not create a deeper subclass
3. state that public finding coverage is thin

## Corpus fields

Each normalized row in the public corpus tracks:

1. source URL
2. source organization
3. year
4. project or product
5. codebase type
6. finding title
7. severity
8. root cause
9. exploit path
10. affected layer
11. remediation pattern
12. candidate taxonomy class

## Inclusion rules

Include:

1. public finding pages
2. public audit reports and report summaries
3. official incident disclosures and bug-fix reviews
4. official Solana security course or program documentation when report coverage is thin

Exclude or downgrade:

1. anonymous social-media claims without code or transaction evidence
2. private reports
3. generic EVM-only taxonomies unless the mechanic clearly matches Solana boundary semantics
4. categories inferred purely from intuition

## Audit scope versus incident mix

Recent public Solana incident coverage also includes governance social engineering, wallet and client compromise, phishing, and developer-environment compromise, as shown by the [Drift Protocol incident analysis](https://www.chainalysis.com/blog/lessons-from-the-drift-hack/), the [Anza `@solana/web3.js` root cause analysis](https://www.anza.xyz/blog/web3-js-exploit-root-cause-analysis), and [SolPhishHunter](https://arxiv.org/abs/2505.04094).

1. Public loss headlines are not a clean proxy for on-chain bug density.
2. A code audit can materially reduce exploit risk while leaving operational, governance, wallet, or developer-environment exposure unchanged.
3. When that broader residual risk dominates, reviewers should call it out explicitly instead of implying the audited code covers the full real-world attack surface.

## Severity normalization

Severity labels differ across firms. Normalize by outcome:

1. Critical: unbounded mint, vault drain, arbitrary signer or authority takeover, bridge-message forgery, or irreversible high-impact loss
2. High: loss of funds under realistic preconditions, replayable auth bypass, or major governance or upgrade compromise
3. Medium: constrained value leakage, liveness failure on important paths, stale-state exploitation, or partial admin abuse
4. Low: hardening, thin-edge liveness, operator hazard, or nondefault misconfiguration risk

See [severity-triage.md](severity-triage.md) for the final decision rubric.

## Category design rules

Each taxonomy file should answer these questions:

1. What is the canonical bug?
2. Why is Solana especially exposed to it?
3. What code smells should the reviewer search for?
4. How do Anchor and native Rust review notes differ?
5. What are the boundary-layer implications for clients and wallets?
6. Which public examples demonstrate the mechanic?

## Known thin-coverage areas

The public corpus is strongest for account validation, signer auth, CPI boundaries, token integration, arithmetic, and lifecycle issues.

Coverage is thinner for:

1. duplicate mutable aliasing as a standalone published finding
2. client and wallet UX as an audited category rather than an incident class

For those areas, this pack stays narrow and cites authoritative Solana-specific write-ups instead of inventing unsupported subclasses.
