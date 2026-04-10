---
title: Cross Report Patterns
description: Crosswalk from public Solana auditor terminology to the canonical taxonomy names used in this repository.
---

# Cross Report Patterns

Different Solana auditors name similar exploit mechanics differently. This crosswalk keeps the taxonomy searchable without collapsing genuinely different bug classes.

| Canonical Class | Common Source Terms | Typical Sources | Notes |
| --- | --- | --- | --- |
| account-validation | missing owner check, fake account accepted, type cosplay, missing relationship check | Sec3 recent hacks, Neodyme workshop, Solana Program Security course | Usually the first boundary crossed in large-loss Solana incidents |
| signer-authority | missing signer check, arbitrary authority modification, signature replay, weak auth binding | Zellic claim and rewards, Neodyme reports, Solana Program Security course | Distinct from account validation when the account is real but the wrong actor controls it |
| pda-seeds-bumps | bump seed bug, noncanonical bump, PDA sharing, weak seed domain separation | Sec3 bump-seed write-up, Neodyme core notes, Solana Program Security course | Separate from generic auth because the address derivation itself is the vulnerable primitive |
| cpi-trust-boundaries | arbitrary CPI, untrusted program invocation, instruction introspection mismatch, arbitrary signed program invocation | Solana Program Security course, Zellic signature-boundary findings, Sec3 X-Ray classes | Distinct from signer bugs because the trust boundary is external program or instruction identity |
| token-integration | token validation issue, mint identity mismatch, wrong token program assumption, Token-2022 integration risk | Osec token validation, Zellic N1 bridge and token wrap, official Token-2022 docs | Includes classic Token vs Token-2022 boundary mistakes |
| arithmetic-precision | unsafe arithmetic, bidirectional rounding, accounting drift, redemption math bug | Sec3 Jet and rounding write-ups, Immunefi Raydium review, Zellic Pye | The first security failure is economic math, not auth |
| state-machine-invariants | semantic inconsistency, invalid phase transition, front-runnable business logic, stale state | Sec3 stake-pool write-up, Zellic Pye, official course material | Useful for bugs that are not reducible to a single missing check |
| lifecycle-reinit-close-revival | reinitialization attack, revival, zombie account, rent-thief pattern | Osec rent thief, official reinit and closing labs | Lifecycle bugs often need timing or same-transaction reasoning |
| duplicate-mutable-aliasing | duplicate mutable accounts, same-account aliasing | official duplicate mutable lesson, comparable Solana public corpora | Public audit finding density is thinner here, so the category stays narrow |
| oracle-pricing-mev | oracle manipulation, stale price, tick manipulation, LP valuation spoofing | Osec LP oracle write-up, Immunefi Raydium review, Sec3 incident review | This class is economic even if the underlying state also has validation gaps |
| upgrade-admin-governance | governance threshold bypass, blind-signing multisig risk, weak upgrade authority model | Trail of Bits Solana reports, Osec multisig security, Zellic public findings index | Often operational, but still security-critical |
| dos-compute-budget | dust attack, griefing, liveness failure, resource-sensitive failure | Zellic dust attack, Osec lamport transfer write-up, stateful front-run cases | Report only when the blocked path matters to users or operators |
| client-wallet-ux | blind signing, wallet boundary issue, signing UX failure, client compromise | Anza web3.js RCA, Osec multisig security, Sec3 Slope summary | Boundary-layer category that often appears as incidents rather than audit findings |
| token-2022-transfer-hooks | transfer hook reentrancy, ExtraAccountMeta injection, hook callback exploit, CPI depth exhaustion via hook | official Transfer Hook course material, official Token-2022 docs, thin-coverage POC-style transfer-hook write-ups | Thin-coverage class. Treat it as callback and extra-account trust-boundary risk, not as a confirmed in-the-wild exploit family unless the hook path is the first boundary crossed in a public case |
| durable-nonce-governance | durable nonce exploit, pre-signed admin takeover, zero-timelock multisig compromise, delayed execution attack | BlockSec Drift analysis, Chainalysis Drift timeline, TRM Labs Drift report, Drift official statement (April 2026) | Social engineering may be the enabling precursor, but the taxonomy label stays here when the first decisive boundary is indefinite pre-signed admin execution through a durable nonce path |
| zk-proof-soundness | Fiat-Shamir transcript bug, phantom challenge, ZK soundness failure, confidential transfer proof forgery | zksecurity.xyz (June 2025), Solana Foundation post-mortems (May and June 2025) | Affects Token-2022 Confidential Transfer integrators and any system that treats native proof verification as infallible; currently one class-defining incident |

## Pattern summary

1. Sec3 and Neodyme write-ups tend to classify by missing validation primitive.
2. Zellic public findings tend to classify by the concrete user-visible effect.
3. Osec write-ups often expose the hidden Solana runtime assumption behind the bug.
4. Official Solana course material is valuable for classes that are clearly real but underrepresented in public finding pages.

## How to normalize new reports

1. Find the first boundary crossed.
2. Match that boundary to the canonical class above.
3. Record any unique source wording as an alias if it improves future search.
