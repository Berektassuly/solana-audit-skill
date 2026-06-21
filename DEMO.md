# Demo

## User Prompt

Audit this Anchor vault claim path. It accepts Token-2022 mints, uses a PDA vault authority, and passes a reward mint through `ctx.remaining_accounts[0]` before a rewards CPI. Produce one audit finding only if the issue is supported.

## References Loaded

- `skill/SKILL.md`
- `skill/references/workflows/finding-writeup-workflow.md`
- `skill/references/taxonomy/account-validation.md`
- `skill/references/taxonomy/token-integration.md`
- `skill/references/taxonomy/cpi-trust-boundaries.md`

## Finding Output

Status: Hypothesis

Taxonomy mapping: `account-validation`, `token-integration`, `cpi-trust-boundaries`

Evidence:
The claim path forwards `ctx.remaining_accounts[0]` as the reward mint into the rewards CPI. The reviewed prompt does not show a check that binds this mint to vault state, an allowlist, the expected token program variant, or supported Token-2022 extension behavior before CPI construction.

Impact:
If reachable, an attacker may route reward accounting through an unintended mint or token-program variant. This is not a confirmed drain until the review proves the CPI can credit value, mint rewards, or mutate vault accounting with the attacker-selected mint.

Exploit Path:
1. Attacker supplies an unexpected reward mint through `remaining_accounts`.
2. The vault claim path builds a rewards CPI with that mint.
3. The vault does not reject the mint before forwarding accounts or signer seeds.
4. Rewards accounting may execute against attacker-selected mint semantics.

Fix:
Bind the reward mint to vault state or an allowlist, validate the mint owner and token program variant, reject unsupported Token-2022 extensions, and complete these checks before CPI construction or signer-seed forwarding.

Verification:
Add regression tests for a wrong reward mint, wrong token program variant, and unsupported Token-2022 extension mix. Each case should fail before CPI and before vault state mutation.

False-positive or uncertainty notes:
Downgrade or close this hypothesis if a validation helper, typed account constraint, or rewards program precondition proves the mint identity, token program variant, and vault-state relationship before value or accounting effects occur.

## Verification

Expected local review step:

```text
cargo test claim_rejects_wrong_reward_mint
cargo test claim_rejects_wrong_token_program_variant
cargo test claim_rejects_unsupported_token2022_extension
```

The finding should remain `Hypothesis` until code review or tests show the path is reachable. It becomes `Confirmed Finding` only when reviewed evidence proves the unchecked mint can affect rewards or state.

## Final Report Excerpt

```markdown
### A-01: Reward mint identity is not bound before rewards CPI

Status: Hypothesis
Severity: Medium provisional
Taxonomy: account-validation, token-integration, cpi-trust-boundaries

Evidence:
`ctx.remaining_accounts[0]` reaches the rewards CPI as the reward mint without reviewed evidence of owner, mint identity, token program, extension-policy, or vault-state relationship checks.

Impact:
An attacker may be able to redirect reward accounting through an unintended mint if the CPI accepts the supplied account and mutates reward state.

Fix:
Validate mint identity, owner, token program variant, supported Token-2022 extensions, and vault-state relationship before CPI.

Verification:
Add negative tests for wrong mint, wrong token program variant, and unsupported Token-2022 extensions; verify rejection before CPI or state mutation.
```

## Why This Matters

The demo shows the intended path in under a minute: user prompt -> minimal references loaded -> taxonomy-mapped finding -> verification target -> report-ready excerpt, while preserving uncertainty until local evidence confirms exploitability.
