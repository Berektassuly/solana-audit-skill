---
title: Incident Response Output Templates
description: Compact templates for Solana incident updates, timelines, and post-mortems.
---

# Incident Response Output Templates

## Triage update

```markdown
# Incident Triage Update

Status: active | contained | monitoring | closed
Prepared: YYYY-MM-DD HH:MM UTC
Scope: cluster, programs, mints, vaults, wallets, or clients

## Confirmed Facts
- Fact with signature, slot, account, source URL, or log reference.

## Current Hypotheses
- Hypothesis, confidence, evidence supporting it, evidence against it.

## Timeline
| Time UTC | Slot | Signature or Artifact | Event | Confidence |
| --- | --- | --- | --- | --- |

## Blast Radius
- Assets affected:
- Authorities affected:
- Users or positions affected:
- Replay or pending-action risk:
- Unknowns:

## Containment Options
| Option | Authority Needed | Risk Reduced | User Impact | Verification |
| --- | --- | --- | --- | --- |

## Next Evidence To Collect
- Read-only collection step and owner.
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
Current status:
Most likely root cause:
Confirmed impact:
Containment completed:
Decisions needed:
Next update time:
```

## Wording discipline

Use "confirmed" only for evidence-backed statements. Use "appears", "likely", or "hypothesis" for incomplete reconstruction. Avoid naming attackers or attributing intent unless there is strong public evidence and the user asks for attribution analysis.
