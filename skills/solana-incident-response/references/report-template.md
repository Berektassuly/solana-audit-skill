---
title: Incident Response Output Templates
description: Compact templates for Solana incident updates, timelines, and post-mortems.
---

# Incident Response Output Templates

## Triage update

```markdown
# Incident Triage Update

Status: Choose active, contained, monitoring, or closed.
Prepared: Use the current UTC timestamp.
Scope: Name the cluster and affected programs, mints, vaults, wallets, or clients.

## Confirmed Facts
- Add one bullet per confirmed fact, with a signature, slot, account, source URL, or log reference.

## Current Hypotheses
- Add one bullet per hypothesis, with confidence, supporting evidence, and contradicting evidence.

## Timeline
| Time UTC | Slot | Signature or Artifact | Event | Confidence |
| --- | --- | --- | --- | --- |

## Blast Radius
- Assets affected: state confirmed movement, exposure, or no confirmed loss.
- Authorities affected: name any compromised, rotated, or still-at-risk authorities.
- Users or positions affected: describe confirmed scope and uncertainty.
- Replay or pending-action risk: list durable nonces, queued proposals, outstanding signatures, or none observed.
- Unknowns: list the evidence needed to narrow the blast radius.

## Containment Options
| Option | Authority Needed | Risk Reduced | User Impact | Verification |
| --- | --- | --- | --- | --- |

## Next Evidence To Collect
- Add one bullet per read-only collection step and name the responsible owner.
```

## Public post-mortem skeleton

```markdown
# Incident Post-Mortem

## Summary
Briefly describe what happened, when it happened, who was affected, and current status.

## Impact
Quantify assets, users, services, and time windows. Separate confirmed loss from exposure.

## Root Cause
Explain the first security boundary crossed. Link to transaction evidence and comparable taxonomy only where useful.

## Timeline
Use UTC and include detection, escalation, containment, recovery, and disclosure milestones.

## Response
Explain containment and recovery actions without exposing sensitive operational details.

## Remediation
List completed fixes, in-progress fixes, monitoring, tests, signer/governance changes, and residual risks.

## User Guidance
State what users should do, what they should not do, and how official updates will be delivered.
```

## Executive update

```markdown
Current status: Give the shortest accurate incident state.
Most likely root cause: State confirmed root cause or label as a hypothesis.
Confirmed impact: Quantify confirmed loss, exposure, or service impact.
Containment completed: List completed containment actions and verification.
Decisions needed: Name decision owners and the specific choice required.
Next update time: Give the next UTC update time or trigger.
```

## Wording discipline

Use "confirmed" only for evidence-backed statements. Use "appears", "likely", or "hypothesis" for incomplete reconstruction. Avoid naming attackers or attributing intent unless there is strong public evidence and the user asks for attribution analysis.
