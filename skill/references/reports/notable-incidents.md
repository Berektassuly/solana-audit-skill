---
title: Notable Incidents
description: Solana incident summaries that show how repeated taxonomy classes lead to real losses or high-impact operational failures.
---

# Notable Incidents

This file is a quick bridge from public incidents back to the taxonomy.

## Wormhole

Source: [Sec3 recent hacks review](https://www.sec3.dev/blog/recent-hacks)

1. Primary class: [account-validation](../taxonomy/account-validation.md)
2. Secondary class: [cpi-trust-boundaries](../taxonomy/cpi-trust-boundaries.md)
3. Why it matters: a bridge path accepted fake accounts in a context where forged trust is catastrophic.

## Cashio

Source: [Sec3 recent hacks review](https://www.sec3.dev/blog/recent-hacks)

1. Primary class: [account-validation](../taxonomy/account-validation.md)
2. Why it matters: fake-account acceptance on a minting path is one of the highest-blast-radius Solana bugs.

## Crema

Source: [Sec3 recent hacks review](https://www.sec3.dev/blog/recent-hacks)

1. Primary class: [account-validation](../taxonomy/account-validation.md)
2. Secondary class: [oracle-pricing-mev](../taxonomy/oracle-pricing-mev.md)
3. Why it matters: a fake tick account let pricing logic operate on attacker-chosen state.

## Nirvana

Source: [Sec3 recent hacks review](https://www.sec3.dev/blog/recent-hacks)

1. Primary class: [oracle-pricing-mev](../taxonomy/oracle-pricing-mev.md)
2. Why it matters: oracle and pricing assumptions fail differently from auth bugs, but losses can be just as large.

## Raydium Tick Manipulation

Source: [Immunefi bug fix review](https://immunefi.com/blog/bug-fix-reviews/raydium-tick-manipulation-bugfix-review/)

1. Primary class: [oracle-pricing-mev](../taxonomy/oracle-pricing-mev.md)
2. Secondary class: [state-machine-invariants](../taxonomy/state-machine-invariants.md)
3. Why it matters: concentrated-liquidity state can turn ordering and price assumptions into an exploit.

## Solend Rent Thief

Source: [Osec rent thief write-up](https://osec.io/blog/2022-08-19-solend-rent-thief/)

1. Primary class: [lifecycle-reinit-close-revival](../taxonomy/lifecycle-reinit-close-revival.md)
2. Secondary class: [dos-compute-budget](../taxonomy/dos-compute-budget.md)
3. Why it matters: lifecycle flaws do not need a mint or vault drain to be security-relevant.

## `@solana/web3.js` Supply-Chain Compromise

Source: [Anza root cause analysis](https://www.anza.xyz/blog/web3-js-exploit-root-cause-analysis)

1. Primary class: [client-wallet-ux](../taxonomy/client-wallet-ux.md)
2. Why it matters: Solana security is not only on-chain. The client and signing boundary can be the shortest path to user loss.

## Drift Protocol ($285M, April 2026)

Source: [BlockSec incident analysis](https://blocksec.com/blog/drift-protocol-incident-multisig-governance-compromise-via-durable-nonce-exploitation), [Chainalysis report](https://www.chainalysis.com/blog/lessons-from-the-drift-hack/), [TRM Labs report](https://www.trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist), [Drift official statement](https://x.com/DriftProtocol/status/2039564437795836039)

1. Primary class: [durable-nonce-governance](../taxonomy/durable-nonce-governance.md)
2. Secondary class: [oracle-pricing-mev](../taxonomy/oracle-pricing-mev.md)
3. Why it matters: the largest DeFi hack of 2026 was not a smart contract code bug. Social engineering and governance-process breakdown collected the needed approvals, but the decisive boundary crossed was durable-nonce-backed governance execution after a zero-timelock Security Council migration removed the last intervention window.

## ZK ElGamal Phantom Challenge (June 2025, no funds lost)

Source: [zksecurity.xyz post-mortem](https://blog.zksecurity.xyz/posts/solana-phantom-challenge-bug/), [Solana Foundation post mortem, May 2 2025](https://solana.com/ru/news/post-mortem-may-2-2025), [Solana Foundation post mortem, June 25 2025](https://solana.com/news/post-mortem-june-25-2025)

1. Primary class: [zk-proof-soundness](../taxonomy/zk-proof-soundness.md)
2. Secondary class: [token-integration](../taxonomy/token-integration.md)
3. Why it matters: a critical soundness bug in a native Solana ZK program would have enabled unlimited minting or full draining of confidential token balances. Responsible disclosure and coordinated validator patching prevented exploitation, proving that ZK verifier programs are not automatically trustworthy security boundaries for higher-level protocol logic.

## How to use these incidents

1. Start from the primary class.
2. Read the secondary class only after the primary exploit boundary is clear.
3. Ask whether your target codebase exposes the same boundary in a different product shape.
