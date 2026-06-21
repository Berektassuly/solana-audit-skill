# Anchor Token-2022 Behavioral Golden Fixture

## Fixture Prompt

```text
Audit this Anchor vault claim path. It accepts Token-2022 mints, uses a PDA vault authority, and passes a reward mint through ctx.remaining_accounts[0] before a rewards CPI. Produce one finding only if the issue is supported.
```

## Expected References Loaded

- `skill/SKILL.md`
- `skill/references/workflows/finding-writeup-workflow.md`
- `skill/references/workflows/token-2022-policy-workflow.md`
- `skill/references/taxonomy/account-validation.md`
- `skill/references/taxonomy/token-integration.md`
- `skill/references/taxonomy/cpi-trust-boundaries.md`

## Sample Output Artifact

### Finding

Status: Hypothesis

Taxonomy: `account-validation`, `token-integration`, `cpi-trust-boundaries`

Evidence:
The claim path accepts a reward mint from `ctx.remaining_accounts[0]` before constructing a rewards CPI. The prompt does not show local evidence that this account is bound to vault state, checked against an allowlist, verified as the expected Token-2022 mint, or screened for unsupported extension behavior before the PDA vault authority signs the downstream CPI.

Impact:
If the CPI trusts the forwarded mint, an attacker-selected mint could redirect reward accounting, bypass mint policy assumptions, or make the vault authority participate in an unintended Token-2022 reward path. This remains a hypothesis until code or tests show the CPI can credit value, mutate vault accounting, or accept unsupported mint extensions.

Fix:
Bind the reward mint to vault state or an explicit allowlist, verify the account owner and token program variant, reject unsupported Token-2022 extensions before CPI construction, and avoid forwarding signer seeds until all reward-mint invariants pass.

Verification:
Add local regression tests for a wrong reward mint, wrong token program variant, unsupported Token-2022 extension mix, and missing remaining account. Each test should fail before the rewards CPI and before any vault or rewards accounting mutation.

False-positive conditions:
Do not report this as a confirmed finding if the unseen instruction already derives the reward mint from vault state, validates the Token-2022 program and supported extensions before the CPI, or the downstream rewards program independently rejects attacker-selected mints before changing value or state.
