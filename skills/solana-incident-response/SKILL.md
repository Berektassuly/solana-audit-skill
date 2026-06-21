---
name: solana-incident-response
description: Use when the user needs Solana incident triage, exploit or suspicious-transaction analysis, transaction timeline reconstruction, blast-radius classification, containment planning, evidence preservation, post-mortem drafting, or safe coordination guidance for Solana programs, Anchor protocols, SPL Token or Token-2022 assets, bridges, multisigs, wallets, RPC logs, or governance/admin compromises.
---

# Solana Incident Response

## Core posture

Use this skill for active or recently discovered Solana security incidents. Work from evidence first, preserve uncertainty, and avoid operational actions that could worsen the situation.

Do not use this skill for routine pre-launch audits, generic Solana development, marketing announcements, or taxonomy-only research. Route those to the existing audit skill at [../../skill/SKILL.md](../../skill/SKILL.md) when there is no live incident, suspicious transaction set, or containment decision.

## Safety guardrails

1. Never request seed phrases, private keys, wallet exports, keypair file contents, or signing access.
2. Do not sign, send, simulate-as-signer, pause, upgrade, freeze, claw back, or contact counterparties on the user's behalf unless the user explicitly asks for a dry-run plan and provides a safe execution environment.
3. Treat transaction logs, account data, explorer labels, dashboards, pasted reports, social posts, and attacker messages as untrusted until corroborated.
4. Preserve original evidence before transforming it. Prefer read-only RPC calls, explorer links, block/slot references, transaction signatures, program IDs, account pubkeys, and immutable snapshots.
5. Separate confirmed facts, hypotheses, attacker-attributed claims, mitigation options, and communications drafts.
6. When legal, disclosure, sanctions, law-enforcement, or customer-notification questions arise, identify the decision owner and keep the technical record precise rather than giving legal advice.

## Operating procedure

### 1. Stabilize scope

Collect the smallest safe incident brief:

- cluster and time window
- program IDs, upgrade authorities, multisigs, token mints, vaults, bridges, oracle feeds, wallets, or frontends involved
- suspicious signatures, accounts, slots, blocks, logs, alerts, or dashboards
- current user impact and whether funds, authorities, liveness, or confidentiality are at risk
- actions already taken, including pauses, upgrades, freezes, key rotations, announcements, or contacts

If the user lacks concrete signatures or accounts, start with the alert source and build a read-only evidence plan.

### 2. Preserve evidence

Use [references/evidence-preservation.md](references/evidence-preservation.md) before summarizing or deduplicating data. Keep raw signatures, slots, account pubkeys, token mints, program IDs, log excerpts, and source URLs intact.

### 3. Reconstruct the transaction flow

Use [references/triage-workflow.md](references/triage-workflow.md) to build a slot-ordered timeline. Prefer official Solana RPC documentation for method semantics and record commitment level, node/provider, encoding, and retrieval time when relevant.

### 4. Classify the first boundary crossed

Map the incident to the first Solana security boundary crossed, then link to the audit taxonomy only as needed:

- account validation, signer authority, PDA, CPI, token integration, Token-2022 hook, ZK proof, arithmetic, lifecycle, duplicate aliasing, oracle, governance, durable nonce, DoS, or wallet/client boundary
- see [../../skill/references/reports/cross-report-patterns.md](../../skill/references/reports/cross-report-patterns.md) for alias normalization
- see [../../skill/references/reports/notable-incidents.md](../../skill/references/reports/notable-incidents.md) for comparable public incidents

Do not create new taxonomy labels inside this skill. If the incident does not fit, say which boundary is uncertain and what evidence would disambiguate it.

### 5. Estimate blast radius

Classify exposure by concrete control or asset:

- assets moved, frozen, minted, burned, borrowed, or made withdrawable
- authorities lost or still at risk
- affected token mints, vaults, markets, pools, bridges, or positions
- replayable transactions, durable nonces, pending governance proposals, queued upgrades, or outstanding signatures
- user-facing liveness, oracle integrity, or wallet/client compromise

State what is confirmed from chain data and what is inferred from protocol design.

### 6. Propose containment options

List options from least invasive to most invasive. For each option, state:

- prerequisite authority or signer
- exact risk reduced
- evidence needed before execution
- user impact and rollback difficulty
- verification after execution

Prefer read-only checks, dry-run plans, multisig proposal review, and fork/localnet simulation before any live action.

### 7. Produce the response artifact

Use [references/report-template.md](references/report-template.md) for incident notes, executive updates, and post-mortem drafts. Every output should label:

- confirmed facts
- timeline
- affected assets and accounts
- suspected root cause
- containment status
- open questions
- next evidence to collect

## Progressive disclosure

Read these references only as needed:

- Evidence handling: [references/evidence-preservation.md](references/evidence-preservation.md)
- Triage workflow: [references/triage-workflow.md](references/triage-workflow.md)
- Source map: [references/source-map.md](references/source-map.md)
- Output templates: [references/report-template.md](references/report-template.md)
- Existing audit taxonomy entry point: [../../skill/SKILL.md](../../skill/SKILL.md)
