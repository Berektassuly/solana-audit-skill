---
title: Solana Incident Triage Workflow
description: Step-by-step workflow for reconstructing suspicious Solana transactions and classifying incident blast radius.
---

# Solana Incident Triage Workflow

## 1. Build the seed set

Start from the smallest known evidence set:

- suspicious transaction signatures
- affected program IDs or deployed program data accounts
- token mints, vaults, pools, markets, bridges, or governance accounts
- attacker, victim, signer, or admin public keys
- alert windows, slots, block times, or monitoring event IDs

If the seed set is weak, state that the first output is a collection plan, not an incident conclusion.

## 2. Pull transaction history

Use read-only RPC and explorers:

1. `getSignaturesForAddress` for program, vault, mint, authority, nonce, and suspect addresses.
2. `getTransaction` for full transaction details, logs, account keys, inner instructions, token balances, return data, and errors.
3. `getBlock` or block explorers for slot-level ordering when multiple signatures are close together.
4. `getProgramAccounts` only with bounded filters and clear purpose; large scans can be incomplete or provider-limited.
5. `logsSubscribe` only for live monitoring; record that it is forward-looking and not a historical source.

Record commitment level, max supported transaction version, encoding, provider, and whether loaded addresses from lookup tables are included.

## 3. Normalize each transaction

For each relevant signature, extract:

- slot, block time, status, fee payer, signers, and writable accounts
- top-level instructions, inner instructions, and CPI targets
- token balance deltas, SOL lamport deltas, mint/burn/close/freeze/set-authority actions
- program logs and custom errors
- address lookup table accounts and loaded writable/readonly addresses
- pre-state and post-state for affected accounts when available

If parsed data is missing, fall back to raw instruction data and account metas. Do not infer signer intent from a wallet label alone.

## 4. Identify the first boundary crossed

Classify the earliest confirmed security boundary that failed:

| Boundary | Evidence Signal |
| --- | --- |
| account validation | fake, mismatched, or attacker-controlled account accepted |
| signer/authority | wrong signer, replayed signature, or authority transfer accepted |
| PDA | alternate bump, shared seeds, or wrong PDA namespace |
| CPI | untrusted program invoked or introspection mismatch |
| token integration | wrong mint, token program, extension, delegate, freeze, or fee assumption |
| Token-2022 hook | hook program or extra-account resolution changes control flow |
| ZK proof | proof verifier accepts invalid confidential-transfer action |
| arithmetic/accounting | value extracted through overflow, rounding, or invariant drift |
| lifecycle | create/init/close/revival timing abused |
| oracle/MEV | manipulated, stale, or fake price reaches settlement |
| governance/admin | upgrade, pause, multisig, timelock, threshold, or signer process fails |
| durable nonce | delayed pre-signed transaction remains executable |
| client/wallet | SDK, frontend, wallet, or signing prompt is compromised |

For deeper exploit mechanics, link to the existing audit taxonomy rather than copying it.

## 5. Trace funds and authority

Follow both assets and control:

1. SOL movement, token account deltas, mint supply changes, and wrapped asset issuance.
2. Authority changes for mints, token accounts, programs, multisigs, or governance records.
3. New accounts created during the incident that later become trusted state.
4. Replayable signed messages, durable nonce accounts, queued governance proposals, pending upgrades, or outstanding multisig approvals.
5. Bridges, CEX deposits, mixers, or cross-chain exits only as observed destinations; do not over-attribute without corroboration.

## 6. Containment decision frame

Rank candidate actions by evidence and reversibility:

1. monitor and preserve
2. disable frontend route or API path
3. pause program path if a documented pause authority exists
4. revoke, rotate, or transfer admin authority through the documented governance process
5. freeze token accounts or mints if the authority exists and policy permits
6. patch or upgrade after review, simulation, and signer inspection
7. coordinate disclosure, external response networks, exchanges, bridges, or ecosystem security contacts

For each action, state the authority required, operational risk, user impact, verification step, and who must decide.

## 7. Update cadence

Incident notes should be append-only during active response. Use timestamps and avoid overwriting prior hypotheses; mark them superseded when new evidence arrives.
