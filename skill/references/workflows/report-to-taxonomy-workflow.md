---
title: Report To Taxonomy Workflow
description: Workflow for converting a public Solana report or incident write-up into normalized taxonomy entries and reusable review notes.
---

# Report To Taxonomy Workflow

Use this when the user asks you to digest a public report, compare auditors, or derive reusable review lessons.

## Step 1: Read the report at the finding level

Capture:

1. finding titles
2. severity
3. vulnerable function or instruction
4. the first security boundary crossed

Do not normalize directly from the report summary.

## Step 2: Translate the source's wording

Map the source wording into repository language:

1. "fake account" -> `account-validation`
2. "authority update" -> `signer-authority`
3. "noncanonical bump" -> `pda-seeds-bumps`
4. "malicious program" -> `cpi-trust-boundaries`
5. "fee mismatch" or "rounding leakage" -> `arithmetic-precision`

## Step 3: Separate primary and secondary effects

Many Solana findings touch multiple surfaces. Classify by the primary exploit step and record the rest as secondary notes.

## Step 4: Update the corpus table

Add a compact row to [../reports/public-audit-corpus.md](../reports/public-audit-corpus.md) with the normalized fields.

## Step 5: Update the canonical taxonomy file

Only edit the canonical file if the report:

1. adds a new alias that is materially useful
2. sharpens review signals
3. provides a better public example than an existing citation

## Step 6: Record new review heuristics

If the report reveals a reviewer habit that is broadly reusable, update:

1. [../common-false-positives.md](../common-false-positives.md), or
2. one of the checklists

## Failure modes

1. one source title becomes a new category even though the exploit path already exists in the taxonomy
2. the normalization keeps source-specific jargon and becomes harder to search
3. the report is copied without stating why the issue matters specifically on Solana
