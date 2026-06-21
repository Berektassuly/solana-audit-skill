---
title: Client Review Checklist
description: Checklist for reviewing Solana client, wallet, and signing flows that can create security issues even when the on-chain program is sound.
---

# Client Review Checklist

Use this when the security boundary extends into the client or wallet flow.

For a concrete decoded transaction, serialized transaction, backend signer action, wallet prompt, or agent-proposed action, use [../workflows/transaction-safety-workflow.md](../workflows/transaction-safety-workflow.md) and emit `AUTONOMOUS_OK`, `CONFIRM_REQUIRED`, `NEVER_AUTO_SIGN`, or `NEEDS_MORE_INFO` as the review label.

## Signing surface

1. Check what the user is asked to sign and whether the prompt is legible.
Why it matters: blind-signing or vague signing prompts turn client code into the weak link.

2. Check whether the client can show decoded program IDs, writable accounts, token mints, expected deltas, authority changes, and user-approved limits before signing.
Why it matters: missing critical facts should become `NEEDS_MORE_INFO`, not a guessed pass.

3. Check whether the client distinguishes simulation evidence from approval.
Why it matters: simulation can prove the transaction executes, but it cannot prove the user intended the decoded effects.

4. Check cluster handling.
Why it matters: mislabelled or silently switched clusters can cause unsafe assumptions during rollout or incident response.

## Transaction construction

5. Check how program IDs, account metas, address lookup tables, compute budget instructions, priority fees, recent blockhashes, and durable nonce details are sourced.
Why it matters: client bugs can route valid user intent into unsafe program invocations.

6. Check whether the client hardcodes Token assumptions.
Why it matters: Token-2022 extension semantics often break wallet and frontend assumptions even when the on-chain code is careful.

7. Check whether user-visible amounts match on-chain units and token decimals.
Why it matters: arithmetic and display mismatches can create practical signing-risk even when the transaction is technically valid.

## Supply chain and dependency boundary

8. Check wallet, SDK, and signing-library provenance.
Why it matters: the `@solana/web3.js` supply-chain incident showed that wallet-boundary risk is not purely on-chain.

9. Check whether off-chain message verification or replay prevention is explicit.
Why it matters: signature replay and weak message domain separation can move an auth bug from the program into the client.

## Operational safety

10. Check backend signer policy when a server, relayer, agent, or fee sponsor co-signs transactions.
Why it matters: backend signers need allowed programs, mints, accounts, max value, expiry, approver, decoded effects, and simulation evidence before they sign.

11. Check whether the release path defaults to devnet or local verification first.
Why it matters: unaudited mainnet execution should be opt-in and explicit, not the silent default.

12. Check incident-response hooks.
Why it matters: if a wallet or SDK issue emerges, the team should be able to pause signing flows, not just the program itself.
