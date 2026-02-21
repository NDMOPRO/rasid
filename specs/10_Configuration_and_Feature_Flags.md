# SEC-CONF

## Config Hierarchy

| Precedence | Source |
|---|---|
| 1 (highest) | runtime emergency override store |
| 2 | environment variables |
| 3 | versioned config files |
| 4 | built-in defaults |

## Environment Overrides

| Environment | Rule |
|---|---|
| dev | debug logging MAY be enabled |
| staging | production-like security SHALL be enabled |
| prod | debug logging SHALL NOT be enabled |

## Immutable vs Mutable Config

| Config Key Pattern | Mutability |
|---|---|
| security.* | immutable at runtime |
| database.* | immutable at runtime |
| feature.* | mutable via flag service |
| rate_limit.* | mutable via approved change |

## Feature Flag Schema

```json
{"type":"object","required":["flagKey","state","rollout","owner"],"properties":{"flagKey":{"type":"string"},"state":{"enum":["DRAFT","ENABLED","DISABLED","REMOVED"]},"rollout":{"type":"object","required":["strategy","percentage"],"properties":{"strategy":{"enum":["all","percentage","segment"]},"percentage":{"type":"integer","minimum":0,"maximum":100}}},"owner":{"type":"string"}}}
```

## Rollout and Kill-Switch Rules

| Rule ID | Rule |
|---|---|
| FF-001 | Percentage rollout SHALL use deterministic hash on userId. |
| FF-002 | Kill-switch SHALL force-disable within 60 seconds globally. |
| FF-003 | Flag transition SHALL emit audit event. |

## Feature Flag Lifecycle FSM

| from | event | guard | to |
|---|---|---|---|
| DRAFT | APPROVE | owner+reviewer approvals | ENABLED |
| ENABLED | DISABLE | incident or policy trigger | DISABLED |
| DISABLED | CLEANUP | no dependency references | REMOVED |

## Secrets Separation Rules

| Rule ID | Rule |
|---|---|
| SECSEP-001 | Secrets SHALL NOT exist in feature flag payloads. |
| SECSEP-002 | Secrets SHALL be referenced by secret URI only. |
