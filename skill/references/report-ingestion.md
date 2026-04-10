---
title: Public Report Ingestion
description: Workflow for ingesting a new public Solana audit finding, normalizing its terminology, and mapping it into the repository taxonomy.
---

# Public Report Ingestion

Use this workflow whenever you need to incorporate a new public Solana audit, incident disclosure, or technical write-up into the taxonomy.

## Step 1: Confirm the source class

Prefer sources in this order:

1. public audit report or public finding page
2. official incident disclosure or bug-fix review
3. authoritative technical write-up from a recognized Solana security source
4. official Solana security course or program documentation

## Step 2: Extract the finding fields

Record these fields before deciding the category:

1. source URL
2. source organization
3. date or year
4. project or product
5. codebase type
6. finding title and severity
7. root cause
8. exploit path
9. affected layer
10. remediation pattern

## Step 3: Find the first exploit step

Do not classify by the last consequence. Classify by the first security boundary the attacker crosses.

Examples:

1. if the attacker first gets a fake account accepted, the category is usually `account-validation`
2. if the attacker first abuses a weak signer or authority gate, the category is `signer-authority`
3. if the attacker first swaps in an untrusted program or instruction path, the category is `cpi-trust-boundaries`

## Step 4: Compare against existing categories

Read the closest taxonomy files first. Merge terminology if the exploit mechanic is already covered.

## Step 5: Decide whether the example is strong enough

Add the example directly if:

1. it matches an existing category clearly, or
2. it is the second strong public example needed to stabilize a thin category

## Step 6: Update the taxonomy file

When editing the relevant taxonomy note:

1. add the example under `Public Examples`
2. update alias names if the source uses materially different wording
3. refine review signals only if the new report adds something Solana-specific

## Step 7: Update cross-report references

Then update:

1. [reports/public-audit-corpus.md](reports/public-audit-corpus.md)
2. [reports/cross-report-patterns.md](reports/cross-report-patterns.md)
3. [common-false-positives.md](common-false-positives.md) if the new source narrows a noisy signal
