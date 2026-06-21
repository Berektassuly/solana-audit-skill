# Remaining Accounts Finding Writeup Example

## User Prompt

Draft a finding for a hypothetical Anchor instruction where `ctx.remaining_accounts[0]` is used as the reward mint account during a rewards CPI, but the instruction does not verify the account owner, mint identity, token program variant, or relationship to vault state.

## Expected Artifact

Single audit finding draft with evidence, exploit path, impact, fix, verification, severity, and false-positive conditions.

## Sample Output

### Finding

Unchecked reward mint supplied through `remaining_accounts` may redirect reward CPI accounting.

### Status

Hypothesis, because the prompt does not include a local reproduction or complete call graph.

### Severity

Medium provisional. The impact depends on whether the rewards CPI can mint, credit, or account rewards using the attacker-supplied mint.

### Taxonomy

- Primary: `account-validation`
- Secondary: `token-integration`

### Evidence

`ctx.remaining_accounts[0]` reaches the reward CPI as the mint account, but the instruction does not show owner, mint, token-program, or vault-state relationship validation before use.

### Exploit Path

1. Attacker supplies a reward mint through `remaining_accounts[0]`.
2. The vault instruction builds the rewards CPI using that account as the reward mint.
3. No check proves the mint matches vault state, an allowlist, or the expected token program variant.
4. The rewards CPI executes with attacker-chosen mint semantics, potentially misdirecting rewards or corrupting vault reward accounting.

### Impact

If reachable, an attacker may redirect reward issuance or accounting to an unintended mint. The finding is not a confirmed drain without evidence that the CPI credits value or changes vault accounting.

### Fix

Validate the mint account owner and token program, validate mint identity against vault state or an allowlist, validate the account relationship before CPI, and reject unsupported Token-2022 extension behavior where the protocol cannot support it.

### Verification

- Add a regression test that supplies a malicious or wrong reward mint through `remaining_accounts[0]` and expects rejection before the rewards CPI.
- Add a regression test for a wrong token program variant or unsupported Token-2022 extension and assert the instruction rejects it before state mutation.

### False-Positive Conditions

This is not a valid finding if a later validation helper, typed account constraint, CPI adapter, or rewards program precondition proves the mint identity, token program variant, and relationship to vault state before the CPI can affect rewards.

## Why This Example Matters

It shows how the skill turns a common Solana review signal into an actionable hypothesis with evidence, impact, fix, verification, severity, and false-positive conditions rather than stopping at "add an owner check."
