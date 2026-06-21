# Audit Claim Discipline

Use this rule with `../skill/SKILL.md` for Solana audit, release gate, remediation, and final report work.

- No finding without evidence from reviewed code, tests, simulations, transactions, harnesses, deployment artifacts, or a clearly named missing required release artifact.
- No exploit claim without an exploit path and either reproduced behavior or locally supported code evidence.
- Public analogs can support taxonomy mapping, but they do not prove local exploitability.
- Every finding needs Evidence, Exploit Path, Impact, Fix, and Verification.
- Separate confirmed findings, hypotheses, residual risks, hardening notes, and out-of-scope risks.
- Missing release evidence for a required gate can be a blocker and should not be softened into `SKIP`.
