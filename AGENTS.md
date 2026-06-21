# AGENTS.md

Guidance for AI coding agents working in this repository.

## Repository Rules

- Keep `skill/SKILL.md` as the canonical skill entry point.
- Keep detailed taxonomy material under `skill/references/`; do not copy large reference sections into commands or root docs.
- Commands should route to `skill/SKILL.md` and specific references instead of duplicating the skill body.
- Keep frontmatter broadly compatible: `name`, `description`, and optional `user-invocable`.
- Do not add telemetry, opaque binaries, curl-pipe-shell installers, or paid API requirements to default validation.
- Never request or store private keys, seed phrases, wallet exports, or keypair file contents in examples or tests.

## Validation

Run default validation without external credentials:

```bash
cd tests
npm test
```

Run the optional model-backed evaluator only when an Anthropic credential is available:

```bash
cd tests
npm run test:anthropic
```

## Packaging Notes

- `install.sh` copies `skill/` into a target skill directory named `solana-audit`.
- The Solana AI Kit submodule route is `.claude/skills/ext/solana-audit/skill/SKILL.md`.
- The Skills CLI discovers `skill/SKILL.md`; do not add a root shim unless that compatibility changes.
