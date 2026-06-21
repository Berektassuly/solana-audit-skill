# Valorem Local Audit Evaluation

This is a local evaluation of `solana-audit` against `Berektassuly/valorem`. The evaluator installed the skill into the target repo, did not browse the web, and used only the local `solana-audit` skill files plus the scoped Valorem source files.

## Scope

Target repository: `Berektassuly/valorem`

Scoped files:

- `contracts/valorem-auction/src/instructions.rs`
- `contracts/valorem-auction/src/contexts.rs`
- `contracts/valorem-transfer-hook/src/lib.rs`

Focus:

- Token-2022 transfer-hook flow
- CPI trust boundaries
- `ExtraAccountMeta` and `remaining_accounts`
- permit issuance and consumption
- compliance approval and expiry
- auction settlement state transitions

## References Loaded

- `skill/SKILL.md`
- `skill/references/methodology.md`
- `skill/references/common-false-positives.md`
- `skill/references/severity-triage.md`
- `skill/references/workflows/finding-writeup-workflow.md`
- `skill/references/workflows/token-2022-policy-workflow.md`
- `skill/references/taxonomy/account-validation.md`
- `skill/references/taxonomy/cpi-trust-boundaries.md`
- `skill/references/taxonomy/duplicate-mutable-aliasing.md`
- `skill/references/taxonomy/pda-seeds-bumps.md`
- `skill/references/taxonomy/signer-authority.md`
- `skill/references/taxonomy/state-machine-invariants.md`
- `skill/references/taxonomy/token-2022-transfer-hooks.md`
- `skill/references/taxonomy/token-integration.md`

## Attack Surface Summary

The scoped auction program accepts asset and payment mints through `TokenInterface`, initializes and stores hook config and validation PDAs, issues a Valorem hook permit during settlement, and passes `extra_account_meta_list` plus `transfer_permit` as hook remaining accounts. CPI targets for the Valorem hook program are strongly typed, and the hook validates permit mint, source, destination, authority, expiry, and allowance before consuming the permit.

The main review surfaces are manual mutable bidder-state updates, Token-2022 extension assumptions, and whether the transfer-hook permit is actually enforced by the asset mint's extension configuration.

## Finding 1: Slash Paths Do Not Bind BidderState To The Current Auction

Status: Confirmed Finding

Taxonomy: `account-validation`, `pda-seeds-bumps`, `state-machine-invariants`, `signer-authority`

Severity: Medium provisional

### Evidence

`contracts/valorem-auction/src/contexts.rs:273` defines `SlashUnrevealed` with a mutable `bidder_state` account but no PDA seed constraint and no `bidder_state.auction == auction.key()` relationship check.

`contracts/valorem-auction/src/contexts.rs:282` defines `SlashCandidateAndAdvance` with a mutable `current_bidder_state` account but no PDA seed constraint and no stored-auction relationship check.

`contracts/valorem-auction/src/instructions.rs:456` through `contracts/valorem-auction/src/instructions.rs:485` mutates the supplied `bidder_state.deposit_slashed` while authorization and timing checks come from the supplied `auction`.

`contracts/valorem-auction/src/instructions.rs:489` through `contracts/valorem-auction/src/instructions.rs:538` mutates the supplied `current_bidder_state` and disqualifies by `bidder_state.bidder` while admin authorization comes from the supplied `auction`.

Nearby contexts do bind bidder state to the auction using `[BIDDER_SEED, auction.key().as_ref(), bidder.key().as_ref()]`, for example `SubmitCommitment`, `RevealBid`, `RecordCompliance`, `SettleCandidate`, and `ClaimRefund`.

### Exploit Path

1. An admin or reviewer authorized for Auction A calls a slash instruction using Auction A.
2. The call supplies a `BidderState` account created for Auction B.
3. Because the slash context does not derive the bidder-state PDA from Auction A, the instruction can mutate the unrelated bidder state.
4. The unrelated bidder state can be marked `deposit_slashed = true` or `settlement_eligible = false`.
5. A later refund path can reject the victim state because it observes a slashed deposit flag.

This is an auction-boundary authorization issue, not a proven vault-drain issue from the scoped code.

### Impact

An auction admin or reviewer can corrupt bidder state outside the auction they are authorized to administer. The likely impact is cross-auction griefing, refund denial, or stranded bidder funds if auction admin authority is intended to be scoped per auction.

### Fix

Bind every slashed bidder state to the auction being mutated. Add PDA seed constraints and an explicit stored-auction relationship check to both slash contexts.

Remediation applied in the local Valorem checkout:

```rust
#[account(
    mut,
    seeds = [BIDDER_SEED, auction.key().as_ref(), bidder_state.bidder.as_ref()],
    bump = bidder_state.bump,
    constraint = bidder_state.auction == auction.key() @ AuctionError::BidderMismatch
)]
pub bidder_state: Account<'info, BidderState>,
```

and the equivalent constraint for `current_bidder_state`.

### Verification

Commands run after the local remediation:

```text
cargo check -p valorem-auction
cargo test -p valorem-auction --lib
```

Result:

```text
valorem-auction cargo check passed
4 valorem-auction unit tests passed
```

Recommended regression coverage:

1. Create Auction A and Auction B.
2. Create a bidder state under Auction B.
3. Call `slash_unrevealed` using Auction A and the Auction B bidder state.
4. Assert rejection before mutation.
5. Repeat for `slash_candidate_and_advance`.

### False-Positive Conditions

This finding should be downgraded only if the intended trust model allows any auction admin or reviewer to mutate bidder state from any other auction. The scoped code does not document that trust model, and the rest of the program mostly treats bidder state as auction-scoped.

## Finding 2: Transfer-Hook Permit Enforcement Depends On Mint Extension Policy Not Proven In Scope

Status: Residual Risk

Taxonomy: `token-2022-transfer-hooks`, `token-integration`, `cpi-trust-boundaries`

Severity: Medium provisional residual risk

### Evidence

`contracts/valorem-auction/src/contexts.rs:202` through `contracts/valorem-auction/src/contexts.rs:211` bind `asset_mint` to the caller-supplied token program, but the scoped context does not prove that the mint has a Token-2022 transfer-hook extension pointing at the Valorem hook program.

`contracts/valorem-auction/src/instructions.rs:398` through `contracts/valorem-auction/src/instructions.rs:431` issues a transfer permit and passes hook remaining accounts during settlement.

`contracts/valorem-transfer-hook/src/lib.rs:134` through `contracts/valorem-transfer-hook/src/lib.rs:179` consumes the permit only if the hook executes.

`contracts/valorem-auction/src/instructions.rs:130` through `contracts/valorem-auction/src/instructions.rs:142` deposits the asset through a plain `transfer_checked` path without hook remaining accounts.

### Risk Path

1. Settlement issues a Valorem transfer-hook permit.
2. Settlement then transfers the asset and supplies hook remaining accounts.
3. The permit is only consumed if the asset mint actually invokes the Valorem transfer hook.
4. If mint creation or extension setup is not enforced elsewhere, the permit may look like a security boundary while not being invoked.
5. If a hook-bearing mint is required, the deposit path also needs explicit compatibility tests because it does not pass the hook accounts or a deposit permit.

### Impact

The scoped code does not prove a compliance bypass because settlement also checks compliance in-program. The residual risk is architectural: the transfer-hook permit should not be treated as an enforced security boundary unless mint extension setup and hook execution are proven by code, deployment policy, or tests.

### Fix

Choose and document one policy:

1. If the hook is required, verify that the asset mint's Transfer Hook extension points to `valorem_transfer_hook::ID`, and make both deposit and settlement paths hook-compatible.
2. If the hook is defense-in-depth only, document that compliance is enforced by the auction settlement checks and treat permit consumption as a monitored invariant rather than the primary control.

### Verification

Add integration tests for:

1. non-hook Token-2022 mint under the intended policy
2. Valorem-hook mint settlement
3. permit consumed after settlement when hooks are required
4. deposit behavior for hook-bearing mints

### False-Positive Conditions

Downgrade this residual risk if mint creation, extension configuration, and transfer-hook execution are enforced outside the scoped files and tests prove both deposit and settlement behave under the intended policy.

## Skill Evaluation Notes

Where the skill helped:

- It routed the review to the correct Solana-specific surfaces: PDA seed binding, state-machine invariants, CPI trust boundaries, Token-2022 transfer-hook assumptions, and token integration policy.
- It preserved uncertainty: one supported local finding was labeled `Confirmed Finding`, while the Token-2022 hook concern stayed `Residual Risk`.
- It produced actionable verification targets instead of only saying "add constraints".

Where evidence was missing:

- The scoped files did not include mint creation or deployment policy, so Token-2022 hook enforcement could not be promoted from residual risk to confirmed finding.
- The initial evaluation did not run a full Anchor integration test; local follow-up verification used `cargo check -p valorem-auction` and `cargo test -p valorem-auction --lib`.
