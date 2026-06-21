---
title: Payment Audit Workflow
description: Focused Solana payment audit workflow for server-side verification, unique references, idempotent fulfillment, finality, Token-2022 payment behavior, and reconciliation.
---

# Payment Audit Workflow

Use this workflow when the target accepts Solana payments, Solana Pay requests, stablecoin checkout, server-composed payment transactions, sponsored payments, webhooks, or merchant reconciliation. This is an audit workflow, not a payment implementation guide.

Related taxonomy:

- [Client and wallet UX](../taxonomy/client-wallet-ux.md)
- [Token integration](../taxonomy/token-integration.md)
- [Token-2022 transfer hooks](../taxonomy/token-2022-transfer-hooks.md)
- [Arithmetic and precision](../taxonomy/arithmetic-precision.md)
- [State-machine invariants](../taxonomy/state-machine-invariants.md)

## Step 1: Map The Payment Flow

Identify:

1. payment type: static transfer request, server-composed transaction request, subscription, sponsored transaction, or custom program flow
2. source of price, recipient, token mint, token program, reference, memo, and order ID
3. server endpoint that creates the request and server endpoint that verifies payment
4. order states and every transition that can ship goods, grant access, settle inventory, or trigger an off-ramp
5. webhooks, pollers, indexers, RPC providers, and reconciliation jobs

Do not review QR generation or wallet return flow before this map exists.

## Step 2: Verify The Server-Side Payment Boundary

The client and wallet are untrusted evidence. The server should release value only after it independently proves the chain contains the expected payment.

Review signals:

1. goods or access are released from a client-reported success, wallet callback, webhook payload, or local UI timer
2. one payment reference can be reused across orders
3. the verification path checks only signature existence, only recipient, only amount, or only token
4. reference-to-order mapping is created after the QR or link is shown
5. transaction request endpoints accept price, recipient, token, or reference from user-controlled input

Expected evidence:

1. one unique reference per order, persisted before display or signing
2. server-side lookup by reference
3. validation of recipient, amount, token mint, token program, and reference together
4. suspicious matched-but-invalid transactions routed to manual review rather than fulfillment

## Step 3: Audit Fulfillment Idempotency

Payment systems usually have multiple detection paths. Polling, webhooks, retries, and user refreshes can all observe the same payment.

Review signals:

1. `paid` and `fulfilled` are represented by loose booleans instead of guarded states
2. two workers can fulfill the same order from the same transaction
3. webhook and poller code paths call separate fulfillment logic
4. late payments after expiry are neither reconciled nor refunded
5. fulfillment has side effects before the database records the payment signature

Expected evidence:

1. explicit states such as `pending`, `paid`, `fulfilled`, `expired`, and `flagged`
2. atomic transition from `pending` to `paid`
3. fulfillment guarded so repeated calls are no-ops
4. payment signature and reference stored for audit trail
5. TTL and expiry policy for unpaid and late-paid orders

## Step 4: Review Replay, Finality, And Value At Risk

The correct commitment level depends on what the payment unlocks.

Review signals:

1. low-latency `confirmed` status triggers irreversible shipping, off-ramp, or account credit for high-value orders
2. the same signature or reference can satisfy multiple orders
3. expired orders can be revived without a fresh payment reference
4. order state assumes a payment cannot be rolled back or duplicated

Expected evidence:

1. commitment choice is explicit and justified by value at risk
2. high-value or irreversible fulfillment waits for stronger finality
3. replay tests cover reused references, reused signatures, and duplicate webhook or poller events

## Step 5: Review Token And Stablecoin Assumptions

Payment bugs often hide in token assumptions rather than in checkout UI.

Review signals:

1. mint identity, decimals, and token program are hardcoded without runtime or deployment evidence
2. UI units and base units are mixed in verification or transaction construction
3. Token-2022 transfer fees can make net received amount differ from gross sent amount
4. transfer hooks, default account state, freeze authority, permanent delegate, memo requirements, or confidential transfers are accepted without an explicit policy
5. merchant reconciliation assumes the displayed amount equals the settled amount

Expected evidence:

1. mint, token program, decimals, recipient account, and merchant treasury are validated as one unit
2. payment verification uses the net amount actually received when transfer fees apply
3. unsupported Token-2022 extensions are rejected before checkout or treated as residual risk
4. stablecoin choices and accepted mints are documented in scope

## Step 6: Review Client And Transaction Construction Boundaries

For static transfer requests, the server should define the order before the client displays it. For transaction requests, the server is a transaction factory and must be treated as a security boundary.

Review signals:

1. server-composed transactions trust client-supplied amount, recipient, token, account metas, or instructions
2. sponsored-fee flows sign transactions that were composed by the client
3. sponsor, relayer, webhook, or RPC credentials are exposed to the frontend
4. frontend marks success without asking the server for verified status
5. QR or deep-link displays omit amount, token, merchant label, or expiry

Expected evidence:

1. server state is the source of truth for price, token, recipient, and reference
2. server signs only transactions it builds or fully validates
3. checkout status comes from the server's verified order state
4. frontend handles expired, flagged, and pending states without implying payment success

## Step 7: Reconcile Merchant Records

Reconciliation is the control that catches valid chain payments that the app missed and app states that claim payment without chain evidence.

Review signals:

1. no job compares paid orders to on-chain receipts
2. orphan payments are ignored
3. refunds, late payments, charge disputes, and off-ramp records cannot be tied to a signature
4. webhook authentication is missing or treated as sufficient proof of payment

Expected evidence:

1. periodic reconciliation by order, reference, signature, mint, amount, and recipient
2. orphan and late payments routed to a documented policy
3. webhook authenticity checked, then chain re-verification performed before fulfillment

## Finding And Test Targets

Prioritize findings in this order:

1. client-trusted fulfillment or missing server-side verification
2. reused reference, replay, or non-idempotent fulfillment
3. wrong token, wrong recipient, underpayment, or decimal confusion
4. finality mismatch for irreversible value
5. Token-2022 net-amount or hook behavior not modeled
6. missing reconciliation or webhook authentication

Minimum negative tests:

1. underpayment is not fulfilled
2. wrong token or wrong recipient is not fulfilled
3. replayed reference or signature fulfills at most once
4. poller and webhook race fulfills exactly once
5. expired order handles late payment according to policy
6. Token-2022 transfer-fee token is rejected or reconciled by net received amount
