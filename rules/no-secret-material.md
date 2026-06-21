# No Secret Material

Use this rule with `../skill/SKILL.md` for all Solana audit, transaction safety, release gate, and incident-adjacent work.

- Never request, paste, store, log, or preserve seed phrases, private keys, wallet exports, keypair file contents, or signing access.
- Use public keys, program IDs, transaction signatures, sanitized logs, read-only account data, reviewed source, simulations, and localnet/devnet fixtures instead.
- Default examples and tests to localnet, devnet, mocked signers, or read-only analysis.
- Do not ask an agent to sign or send transactions as part of default validation.
- If a user offers secret material, decline to process it and ask for sanitized read-only evidence instead.
