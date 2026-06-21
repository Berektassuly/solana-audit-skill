# Case Studies

These case studies are judge-facing proof points for `solana-audit`. They are intentionally compact: each one shows the user prompt, the focused references the agent should load, the output contract, a sample artifact, false-positive boundaries, and the verification target.

They are not claims that this repository audited a live protocol. They are reproducible prompt-to-artifact checks for the skill's behavior on recurring Solana builder problems.

## Review Matrix

| Case | Builder Problem | Primary Workflow | Expected Result |
|---|---|---|---|
| CS-01 | Anchor path forwards unchecked Token-2022 reward mint through `remaining_accounts` before CPI | finding writeup | Taxonomy-mapped `Hypothesis` with evidence, exploit path, fix, verification, and false-positive conditions |
| CS-02 | Pre-mainnet upgrade changes account layout without authority, binary, or migration evidence | release gate | Machine-readable `GATE: FAIL` where missing required evidence is `FAIL`, not `SKIP` |
| CS-03 | Solana Pay checkout fulfills from client-observed signature without server-side validation | payment audit | Payment-boundary finding or hypothesis with replay, wrong-mint, wrong-amount, and idempotency tests |

## CS-01: Token-2022 Mint Passed Through Remaining Accounts

### User Prompt

```text
Audit this Anchor vault claim path. It accepts Token-2022 reward mints, uses a PDA vault authority, and passes `ctx.remaining_accounts[0]` as the reward mint into a rewards CPI. Produce one finding only if the issue is supported.
```

### References Loaded

- [skill/SKILL.md](skill/SKILL.md)
- [skill/references/workflows/finding-writeup-workflow.md](skill/references/workflows/finding-writeup-workflow.md)
- [skill/references/taxonomy/account-validation.md](skill/references/taxonomy/account-validation.md)
- [skill/references/taxonomy/token-integration.md](skill/references/taxonomy/token-integration.md)
- [skill/references/taxonomy/cpi-trust-boundaries.md](skill/references/taxonomy/cpi-trust-boundaries.md)

### Expected Output Contract

The skill should not say "unchecked account bug" and stop. It should emit:

1. `Status: Hypothesis` unless reviewed code proves reachability and value impact.
2. Taxonomy mapping to `account-validation`, `token-integration`, and `cpi-trust-boundaries`.
3. Evidence tied to the unchecked account flow.
4. Exploit path in Solana terms.
5. Impact with preconditions.
6. Fix tied to the protected invariant.
7. Verification targets and false-positive conditions.

### Sample Artifact

```markdown
Status: Hypothesis
Taxonomy: account-validation, token-integration, cpi-trust-boundaries

Evidence:
The claim path forwards `ctx.remaining_accounts[0]` as the reward mint into the rewards CPI. The prompt does not show a check that binds this mint to vault state, an allowlist, the expected token program variant, or accepted Token-2022 extension behavior before CPI construction.

Exploit Path:
1. An attacker supplies an unexpected reward mint through `remaining_accounts`.
2. The claim instruction builds a rewards CPI with that mint.
3. The program forwards accounts or signer seeds before proving the mint relationship.
4. Reward accounting may execute against attacker-selected token semantics.

Impact:
If reachable, rewards may be credited, minted, or accounted against an unintended mint. This is not a confirmed drain until the review proves the CPI can mutate value or vault accounting with the attacker-selected mint.

Fix:
Bind the reward mint to vault state or an allowlist, validate mint owner and token program variant, reject unsupported Token-2022 extensions, and complete those checks before CPI construction or signer-seed forwarding.

Verification:
Add negative tests for wrong reward mint, wrong token program variant, and unsupported Token-2022 extension mix. Each case should reject before CPI and before vault state mutation.
```

### False-Positive Boundary

Downgrade or close the issue if reviewed code shows that a typed account constraint, validation helper, rewards-program precondition, or stored vault relationship proves mint identity and token program variant before any value or accounting effect.

### Why This Case Matters

It tests the skill's main discipline: preserve uncertainty, map the issue to Solana-specific taxonomy, and turn a suspected pattern into a verification target instead of overclaiming exploitability.

## CS-02: Account Migration Release Gate

### User Prompt

```text
Produce a release gate for this Anchor vault upgrade. The release changes the `Vault` account layout, keeps the upgrade authority as the deployer key, has tests that only initialize fresh accounts, and has no verified build diff or fork migration evidence. Target is mainnet.
```

### References Loaded

- [skill/SKILL.md](skill/SKILL.md)
- [skill/references/workflows/release-gate-workflow.md](skill/references/workflows/release-gate-workflow.md)
- [skill/references/checklists/release-blocker-checklist.md](skill/references/checklists/release-blocker-checklist.md)
- [skill/references/taxonomy/upgrade-admin-governance.md](skill/references/taxonomy/upgrade-admin-governance.md)
- [skill/references/taxonomy/state-machine-invariants.md](skill/references/taxonomy/state-machine-invariants.md)
- [skill/references/taxonomy/lifecycle-reinit-close-revival.md](skill/references/taxonomy/lifecycle-reinit-close-revival.md)

### Expected Output Contract

The skill should produce a machine-readable gate, not a generic checklist. Missing required evidence for a mainnet release must be `FAIL`, not `SKIP`.

### Sample Artifact

```text
GATE: FAIL target=anchor-vault-mainnet-upgrade blockers=4 warnings=1 skipped=0
CHECK: authority status=FAIL severity=High evidence="upgrade authority remains deployer key for a value-holding mainnet program" action="move authority to documented multisig/governance or freeze if upgradeability is no longer required"
CHECK: build status=FAIL severity=High evidence="no verified build, binary diff, or source-to-program artifact link was provided" action="produce reproducible build evidence and compare reviewed source to deployed or planned binary"
CHECK: migration status=FAIL severity=High evidence="Vault account layout changed; tests cover fresh accounts only" action="add versioned, idempotent migration tests against old account bytes and mixed-version state"
CHECK: rollback status=FAIL severity=Medium evidence="no prior binary retention or half-migration recovery plan provided" action="document rollback and recovery plan before upgrade execution"
CHECK: compute status=PASS severity=Info evidence="not enough data for a final compute pass; treat as warning pending migration simulation" action="run realistic migration simulation and preserve logs"
```

### Verification Targets

1. Show authority custody evidence: multisig, governance, timelock, immutable program, or accepted trust model.
2. Show binary provenance: verified build output, binary dump comparison, or signed release artifact.
3. Add migration tests using old serialized account data, not only freshly initialized accounts.
4. Run fork, LiteSVM, Mollusk, or equivalent harness evidence for migration, rollback, and failure cases.

### False-Positive Boundary

If the release is not a mainnet upgrade, has no live state migration, or only changes documentation/client code, some checks may become `SKIP`. If the release does depend on the missing evidence, the skill must keep those checks as `FAIL`.

### Why This Case Matters

It demonstrates the difference between an audit note and a ship decision. The skill should create a release blocker artifact that engineering, governance, and auditors can act on.

## CS-03: Solana Pay Fulfillment Without Server-Side Validation

### User Prompt

```text
Audit this Solana Pay checkout design. The frontend creates a payment URL with a reference, watches for any confirmed signature containing that reference, and immediately marks the order paid. The merchant server does not call `findReference` or `validateTransfer`, and there is no idempotency key or replay protection. Asset is USDC.
```

### References Loaded

- [skill/SKILL.md](skill/SKILL.md)
- [skill/references/workflows/payment-audit-workflow.md](skill/references/workflows/payment-audit-workflow.md)
- [skill/references/taxonomy/client-wallet-ux.md](skill/references/taxonomy/client-wallet-ux.md)
- [skill/references/taxonomy/token-integration.md](skill/references/taxonomy/token-integration.md)
- [skill/references/taxonomy/state-machine-invariants.md](skill/references/taxonomy/state-machine-invariants.md)

### Expected Output Contract

The skill should treat checkout fulfillment as a payment verification boundary. It should not accept "confirmed transaction exists" as enough evidence of correct payment.

### Sample Artifact

```markdown
Status: Confirmed Finding if this design is implemented as described; otherwise Hypothesis pending code review
Taxonomy: client-wallet-ux, token-integration, state-machine-invariants

Evidence:
The checkout marks an order paid from a client-observed confirmed signature containing the payment reference. The merchant server does not verify recipient, amount, mint, reference uniqueness, finality policy, or replay/idempotency before fulfillment.

Exploit Path:
1. A transaction involving the reference is observed by the client or watcher.
2. The order is fulfilled without server-side validation of transfer details.
3. A wrong amount, wrong mint, stale reference, replayed reference, or non-merchant recipient can be accepted as payment if the watcher logic matches only the reference or signature presence.

Impact:
An attacker may receive goods or account credit without making the intended USDC payment to the merchant under the required terms.

Fix:
Move fulfillment to the merchant server. Verify the transaction by reference, recipient, amount, USDC mint, token program, confirmation/finality target, and order state. Enforce idempotency so one payment cannot fulfill multiple orders.

Verification:
Add tests for wrong mint, wrong amount, wrong recipient, replayed reference, duplicate webhook/client event, and insufficient finality. Each case should leave the order unpaid.
```

### False-Positive Boundary

Downgrade to a hardening note if server-side code already validates transfer recipient, amount, mint, reference uniqueness, finality target, and idempotent order state before fulfillment, and the frontend watcher is only a UI hint.

### Why This Case Matters

It proves the skill is broader than on-chain code review. Builders also need audit guidance for payment, wallet, and backend signer boundaries where real Solana applications lose safety outside the program binary.

## How Judges Should Use These

1. Start from the user prompt.
2. Confirm the skill routes to the focused references listed for the case.
3. Check whether the output preserves the expected status label: `Hypothesis`, `Confirmed Finding`, `Residual Risk`, or `GATE: FAIL`.
4. Check whether each artifact includes evidence, impact, fix, verification, and false-positive or missing-evidence boundaries.
5. Reject outputs that overclaim exploitability, treat missing release evidence as `SKIP`, or accept signatures/simulation as approval without policy checks.
