---
title: Evidence Preservation
description: Checklist for preserving Solana incident evidence without requesting secrets or mutating live state.
---

# Evidence Preservation

## First capture

Record raw identifiers before analysis:

1. cluster, RPC endpoint or provider, and retrieval time
2. transaction signatures, slots, block times, and commitment level
3. program IDs, token program IDs, mint addresses, vaults, PDAs, oracle accounts, multisig addresses, nonce accounts, and upgrade authorities
4. explorer URLs, monitoring alert IDs, webhook payload IDs, governance proposal IDs, and public statements
5. exact error logs, program logs, and account data hashes when available

Do not ask for private keys, seed phrases, wallet export files, signing access, or keypair JSON contents. If key rotation is relevant, ask for the public key, authority model, and planned rotation procedure only.

## Chain data hygiene

1. Prefer `finalized` or `confirmed` data for historical reconstruction; label any `processed` data as provisional.
2. Save raw JSON before converting it into tables or summaries.
3. Record whether parsed transaction output includes address lookup table accounts.
4. Keep failed transactions if they show probing, replay attempts, or containment failures.
5. Preserve negative evidence, such as no signatures found after a boundary slot, because it can matter for containment.

## Snapshot targets

Capture snapshots for:

- affected program accounts and config accounts
- token mint supply, mint authority, freeze authority, transfer-hook or confidential-transfer extensions
- vault token-account balances and owners
- oracle price, confidence, publish time, and feed identity
- multisig signer set, threshold, timelock, queued proposals, and durable nonce accounts
- upgrade authority and program data account
- frontend, SDK, package-lock, deployment, and DNS evidence for client incidents

## Evidence log format

Use this compact table while triaging:

| Time | Source | Artifact | Why It Matters | Integrity Note |
| --- | --- | --- | --- | --- |
| UTC timestamp | RPC, explorer, monitor, repo, statement | signature, slot, account, commit, URL | fact being supported | raw JSON saved, screenshot, hash, or not preserved |

## Handling sensitive material

If a user offers secrets, stop and ask them to rotate or move secrets through their normal incident process outside chat. Continue with public keys, transaction signatures, account addresses, logs, and read-only evidence.
