---
title: Formal Verification Handoff
description: Audit workflow for translating Solana findings, invariants, and release risks into property tests, SBF harnesses, and proof-oriented handoff artifacts without overclaiming.
---

# Formal Verification Handoff

Use this workflow when a Solana audit needs invariants, fuzz or property testing, SBF-focused harnesses, or proof handoff. The goal is not to replace manual review. The goal is to turn the highest-risk claims into checkable properties with clear evidence.

Primary sources:

- [LiteSVM](https://www.litesvm.com/) and [Anchor LiteSVM testing](https://www.anchor-lang.com/docs/testing/litesvm)
- [Solana Mollusk testing docs](https://solana.com/docs/programs/testing/mollusk) and [Anza Mollusk](https://github.com/anza-xyz/mollusk)
- [QEDGen Solana skills](https://github.com/qedgen/solana-skills)
- [OtterSec Solana formal verification case study](https://osec.io/blog/2023-01-26-formally-verifying-solana-programs/)
- [Token-2022 transfer hook guide](https://solana.com/developers/guides/token-extensions/transfer-hook)

## When To Use Formal Verification

Escalate from ordinary audit review to a formal handoff when at least one is true:

1. A high-value invariant cannot be covered by one or two example tests.
2. The bug class depends on many account permutations, instruction orderings, bumps, token variants, or governance states.
3. A fix is subtle enough that reviewers need regression evidence beyond "the check was added."
4. The protocol needs a release-gate artifact for auditors, governance, or internal signoff.
5. The property is stable and precise enough to state without relying on vague intent.

Good candidates:

1. token conservation, vault solvency, fee bounds, and balance-delta accounting
2. signer and stored-authority binding
3. PDA derivation, canonical bump, and namespace separation
4. CPI callee identity and forwarded signer-seed constraints
5. lifecycle transitions such as initialize, pause, close, reopen, settle, claim, and withdraw
6. governance threshold, timelock, and upgrade-authority preconditions

Poor candidates:

1. "the protocol is secure"
2. "there are no vulnerabilities"
3. UI or social-operational claims with no program-state predicate
4. properties whose expected behavior is still changing

## Handoff Inputs

Collect these before writing the handoff:

1. reviewed commit, program IDs, deployment target, and framework version
2. instruction list, account structs, IDL, and known `remaining_accounts` use
3. PDA seed definitions, stored bump fields, and expected authority graph
4. token program variants, accepted mints, Token-2022 extension policy, and transfer-hook policy
5. external CPI callees and whether they are fixed, allowlisted, or user-selected
6. governance, multisig, timelock, pause, and upgrade authority assumptions
7. existing unit tests, LiteSVM or ProgramTest tests, Mollusk harnesses, fuzz fixtures, and proof specs
8. findings or hypotheses that need regression evidence

## Tool Routing

### LiteSVM Property And Invariant Tests

Use LiteSVM when the property is best expressed as fast, in-process program execution with controlled accounts, sysvars, slots, and transaction sequences.

Handoff targets:

1. seed a minimal protocol state
2. generate valid and invalid account combinations
3. execute the instruction under test
4. assert exact post-state, emitted error, or unchanged balances
5. rerun with classic SPL Token and supported Token-2022 variants where the protocol claims support

Evidence to require:

1. test names that match the property
2. explicit expected error or post-state
3. at least one negative case that would have failed before the fix, when a finding is being remediated
4. deterministic account setup with no external cluster dependency

### Mollusk Or SBF-Focused Harnesses

Use Mollusk or another SBF-focused harness when the review needs deterministic instruction execution close to the compiled program boundary, compute profiling, fuzz fixtures, or account-state permutations without a validator-shaped runtime.

Handoff targets:

1. define all instruction accounts explicitly
2. vary signer, writable, owner, discriminator, and executable flags
3. fuzz serialized account data around unpack and constraint boundaries
4. measure compute-unit changes for denial-of-service or hook-heavy paths
5. preserve fixtures for regression when a crash, panic, or unexpected success is found

Evidence to require:

1. harness code or fixture path
2. SBF artifact or program binary under test
3. failing input minimized to a readable fixture
4. expected exit status, return data, logs, and post-account diffs

### QEDGen, Lean, Kani, Or Proof Handoff

Use QEDGen, Lean-style proofs, or Kani-style bounded verification when the property is small enough to specify precisely and important enough to justify proof maintenance.

Handoff targets:

1. write the invariant as a state predicate before choosing the proof tool
2. define assumptions separately from assertions
3. model only the program state needed for the property
4. connect the proof to regression tests so future changes do not bypass it
5. document bounded-model limits such as loop bounds, maximum accounts, or simplified token behavior

Evidence to require:

1. spec file or proof artifact path
2. proof command and exact result
3. assumptions list
4. counterexample or proof log, when available
5. CI or local command showing how the property is rerun

## Property Checklist

Use these as review prompts. Convert only the relevant prompts into concrete properties.

### Account Validation

1. Every security-sensitive account has the expected owner, type discriminator, data length, and relationship to state.
2. `remaining_accounts` entries are validated before token, authority, PDA, or CPI use.
3. Fake accounts with correct shape but wrong owner or wrong stored key are rejected before state mutation.

### Signer Authority

1. A signer is both present and equal to the stored authority for the target object.
2. Delegated authority cannot be replayed across vaults, users, markets, or mints.
3. Governance or admin signatures bind the exact operation, target account, and replay domain.

### PDA Derivation

1. Initialization uses canonical PDA derivation.
2. Later instructions recompute and compare PDA address and stored bump.
3. Seeds include the full privilege domain: user, vault, market, mint, role, or governance realm where required.

### CPI Boundaries

1. Every callee program ID is fixed, typed, or allowlisted before invocation.
2. Signer seeds are forwarded only to the expected callee and only with required writable accounts.
3. Instruction introspection proves the exact program ID, instruction index, offsets, and business message consumed later.

### Token Accounting

1. Mint identity, token account owner, token account mint, token program ID, and stored vault authority are validated as one unit.
2. Balance changes are measured by pre/post deltas when fees, hooks, or transfer semantics can alter received amounts.
3. Close, freeze, delegate, wrap, unwrap, and fee paths preserve the same solvency invariant as transfer paths.

### Lifecycle

1. Initialization cannot be repeated to overwrite authority or accounting state.
2. Close and reclaim paths cannot revive accounts into trusted state.
3. Paused, settled, expired, closed, and emergency states reject value-moving instructions unless explicitly allowed.

### Governance And Upgrade

1. Upgrade authority, pause authority, and emergency roles match the documented trust model.
2. Multisig threshold, timelock, nonce, and execution paths cannot bypass each other.
3. Authority rotation revokes prior roles and preserves pending-operation safety.

### Token-2022

1. The protocol either rejects unsupported extensions or proves how each accepted extension is handled.
2. Transfer hooks are pinned or allowlisted when value-bearing flows cannot tolerate arbitrary hook behavior.
3. Extra account metas are derived and validated when they affect security-sensitive state.
4. Transfer fees, default account state, permanent delegate, confidential transfers, and memo requirements are covered when accepted.

## Evidence Rules

Do not say a property is verified unless the handoff includes:

1. the exact property statement
2. the tested or proven scope
3. the command or CI job that ran
4. the artifact path or link
5. the result and date
6. the assumptions and exclusions

Use these labels:

1. `Proposed`: property is written but no harness or proof has run.
2. `Tested`: deterministic property or regression tests ran and passed.
3. `Fuzzed`: a fuzz or randomized harness ran for a stated duration or corpus and found no counterexample.
4. `Proven`: a proof tool discharged the property under stated assumptions.
5. `Not Verified`: the property is important but lacks enough evidence.

## Avoid Overclaiming

1. Say "no counterexample found in this harness" rather than "impossible" for fuzz results.
2. Say "verified under these assumptions" rather than "secure" for proofs.
3. Keep Token-2022 extension coverage specific to the extensions actually modeled.
4. Do not mix localnet simulation, SBF harness results, and mathematical proof under one undifferentiated "verified" label.
5. If a property depends on an external program, multisig process, oracle, or client, state what was mocked or assumed.

## Output Template

```markdown
# Formal Verification Handoff: <program or finding>

## Scope
- Commit:
- Instructions:
- Programs:
- Token variants:
- External callees:
- Governance assumptions:

## Property Inventory
| ID | Status | Taxonomy | Property | Tool Route | Evidence |
|---|---|---|---|---|---|
| FV-01 | Proposed/Tested/Fuzzed/Proven/Not Verified | account-validation | <precise predicate> | LiteSVM/Mollusk/QEDGen/Lean/Kani | <artifact or missing evidence> |

## Priority Properties
1. <property statement>
   - Why this matters:
   - Assumptions:
   - Harness/proof target:
   - Expected failure mode:
   - Evidence required before saying verified:

## Regression Targets
- <finding ID or hypothesis>: <negative case and expected rejection>

## Tooling Plan
- LiteSVM:
- Mollusk/SBF:
- Proof handoff:

## Current Evidence
- Passed:
- Counterexamples:
- Not yet covered:

## Overclaiming Guardrails
- This handoff verifies only the listed properties under the stated assumptions.
- It does not certify the full protocol, frontend, governance operations, oracle behavior, or future upgrades.
```
