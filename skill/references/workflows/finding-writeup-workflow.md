---
title: Finding Writeup Workflow
description: Procedure for drafting a Solana audit finding so it is exploit-oriented, taxonomy-backed, and actionable for engineers.
---

# Finding Writeup Workflow

Good Solana findings explain the exploit path, not just the missing check.

## Step 1: State the exploit mechanic

Open with the primary boundary failure:

1. fake account accepted
2. signer or authority bypass
3. noncanonical PDA acceptance
4. untrusted CPI target
5. token-extension mismatch

## Step 2: Describe why it is reachable on Solana

Explain the model-specific reason:

1. all relevant accounts are user-supplied
2. code and data are separated
3. signer privileges are explicit transaction metadata
4. PDAs depend on exact seeds and bumps
5. Token-2022 extensions change transfer and close semantics

## Step 3: Show the concrete path

Use a short numbered path:

1. attacker creates or reuses controlled account(s)
2. attacker calls the vulnerable instruction
3. validation fails to reject the state
4. privileged state transition or value movement happens

## Step 4: Anchor the finding in public evidence

Name at least one similar public example from the taxonomy file. This keeps the finding grounded and helps reviewers compare patterns.

## Step 5: Assign severity and blast radius

State:

1. what the attacker can gain or break
2. whether the attack is replayable
3. what limits the exploit, if anything

## Step 6: Propose the minimal credible fix

Prefer small, testable fixes:

1. owner and relationship checks
2. signer or authority assertion
3. canonical bump derivation and stored bump verification
4. explicit program-ID validation
5. balance-delta accounting for token transfers

## Step 7: Add verification guidance

End with one or more of:

1. unit test target
2. invariant to assert
3. local reproduction idea
4. regression scenario involving the previously missing boundary

## Common mistakes

1. reporting only the missing check, not the exploit
2. treating a trust-model note as a drain
3. ignoring post-CPI stale-state behavior in the fix
4. suggesting a framework convenience without naming the protected invariant
