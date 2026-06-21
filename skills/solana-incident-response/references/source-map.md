---
title: Solana Incident Response Source Map
description: Primary and supporting sources for Solana incident response, chain reconstruction, and ecosystem coordination.
---

# Solana Incident Response Source Map

Prefer primary sources and immutable artifacts. Use secondary explainers as leads unless they include concrete transaction mechanics or link to primary evidence.

## Chain reconstruction

1. [Solana RPC overview](https://solana.com/docs/rpc) - official method families, endpoint concepts, and cluster distinctions.
2. [getSignaturesForAddress](https://solana.com/docs/rpc/http/getsignaturesforaddress) - official historical signature discovery for addresses.
3. [getTransaction](https://solana.com/docs/rpc/http/gettransaction) - official transaction lookup semantics.
4. [getProgramAccounts](https://solana.com/docs/rpc/http/getprogramaccounts) - official program-owned account enumeration and filters.
5. [logsSubscribe](https://solana.com/docs/rpc/websocket/logssubscribe) - official live log subscription semantics.
6. [Transaction confirmation and expiration](https://solana.com/developers/guides/advanced/confirmation) - official guidance for commitment and confirmation behavior.
7. [Versioned transactions](https://solana.com/developers/guides/advanced/versions) and [Address Lookup Tables](https://solana.com/developers/guides/advanced/lookup-tables) - official references for loaded account reconstruction.

## Ecosystem coordination

1. [Raising the Bar on Solana Ecosystem Security](https://solana.com/news/solana-ecosystem-security) - official Solana Foundation note on STRIDE and SIRN.
2. [Introducing STRIDE](https://blog.asymmetric.re/introducing-stride-a-security-program-for-the-solana-ecosystem/) - Asymmetric Research explanation of STRIDE and the Solana Incident Response Network.

## Comparable public incidents

Use these as response-pattern references, not as proof that a new incident has the same root cause:

1. [Existing notable Solana incidents](../../../skill/references/reports/notable-incidents.md) - local normalized incident summaries from the audit skill.
2. [Existing public audit corpus](../../../skill/references/reports/public-audit-corpus.md) - local table of report-backed findings and disclosed incident mechanics.
3. [Anza web3.js root cause analysis](https://www.anza.xyz/blog/web3-js-exploit-root-cause-analysis) - public client supply-chain incident analysis.
4. [Solana Foundation ZK ElGamal post-mortem, June 2025](https://solana.com/news/post-mortem-june-25-2025) - coordinated native-program incident response and no-known-exploitation disclosure.
5. [zksecurity phantom challenge write-up](https://blog.zksecurity.xyz/posts/solana-phantom-challenge-bug/) - technical explanation of the ZK proof soundness issue.

## Source quality labels

- Confirmed chain fact: directly observed from RPC, explorer, validator logs, or preserved raw transaction/account data.
- Official project statement: useful for intent, timeline, and containment, but corroborate against chain data.
- Public incident analysis: useful for mechanics and chronology, but distinguish analysis from primary evidence.
- Comparable training corpus: useful for hypothesis generation, not evidence of exploitation.
- Thin evidence: label explicitly and do not present as confirmed.
