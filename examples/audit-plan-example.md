# Taxonomy-First Audit Plan Example

## User Prompt

Create a pre-mainnet audit plan for our Anchor vault program. It accepts Token-2022 mints, uses a PDA vault authority, calls an external rewards program through CPI, and the upgrade authority is controlled by a multisig.

## Expected Artifact

Taxonomy-first audit plan with attack surface, priority review order, evidence to collect, and verification targets.

## Sample Output

### Attack Surface

- `account-validation`: review all vault, mint, token account, config, and `remaining_accounts` inputs before any CPI or token movement.
- `signer-authority`: verify depositor, admin, vault authority, rewards authority, and multisig signer relationships.
- `pda-seeds-bumps`: check PDA vault authority derivation, stored bump use, and domain separation by vault, mint, and market.
- `cpi-trust-boundaries`: review rewards CPI callee identity, forwarded writable accounts, and signer seeds.
- `token-integration`: check mint identity, token account owner, token program variant, transfer fees, close behavior, and balance-delta accounting.
- `token-2022-transfer-hooks`: treat accepted hook-enabled mints as a separate trust boundary.
- `upgrade-admin-governance`: review upgrade authority, multisig threshold, timelock policy, and emergency pause assumptions.

### Priority Review Order

1. Review account constraints and manual checks for every value-moving instruction.
2. Verify PDA vault authority seeds and stored bump correctness before reviewing CPI signing.
3. Check Token-2022 extension assumptions for accepted mints, then verify balance accounting under transfer fees or hooks.
4. Check rewards CPI callee identity and whether caller-supplied accounts can redirect reward mint or reward destination behavior.
5. Review multisig and upgrade authority trust model; classify unresolved policy gaps as residual risk, not confirmed findings.

### Evidence To Collect

- Anchor account structs, constraints, IDL, and any manual validation helpers.
- PDA seed definitions, stored bump fields, and ProgramTest-style expected PDA assertions.
- Accepted mint allowlist or policy for Token-2022 extensions, including transfer hooks, permanent delegate, transfer fee, default account state, and memo requirements.
- CPI call sites for the rewards program, including callee program ID checks and forwarded signer seeds.
- Multisig config, threshold, timelock, upgrade authority address, and release process notes.
- Existing tests that prove rejection before state mutation; note impact and fix options only after evidence supports a hypothesis.

### Verification Targets

- PDA derivation: add a regression test that supplies an alternate PDA or wrong stored bump and expects rejection before vault authority signing.
- Token-2022 extensions: run property or LiteSVM tests with unsupported extension mixes and verify the vault rejects them before accounting state changes.
- CPI callee identity: add a test that swaps the rewards program account and verifies no signer seeds or writable vault accounts are forwarded.
- Multisig trust model: verify the upgrade authority is the documented multisig and that threshold or timelock assumptions are either enforced or recorded as residual risk.

### Out Of Scope For This Pass

- Frontend wallet UX, monitoring, and incident response playbooks.
- Economic reward-rate correctness unless it affects token conservation or authority safety.
- Full formal verification; this pass only identifies verification candidates and required evidence.

## Why This Example Matters

It demonstrates progressive disclosure from `skill/SKILL.md` into taxonomy and workflow references: the agent produces a scoped Solana audit plan with evidence, impact, fix, and verification discipline instead of a generic checklist.
