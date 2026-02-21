# SEC-FSM

## User Journey Tables

### JRN-001 Analyst triages incident
| step | actor | action | input | output |
|---|---|---|---|---|
| 1 | Analyst | Authenticate in leaks workspace | username/password | access token |
| 2 | Analyst | Open incident queue | filter params | paged incident list |
| 3 | Analyst | Select incident | incidentId | incident detail |
| 4 | Analyst | Set triage decision | priority/owner | state `TRIAGED` |
| 5 | System | Emit notifications | incident event | notification delivery status |

### JRN-002 Privacy officer fulfills DSAR
| step | actor | action | input | output |
|---|---|---|---|---|
| 1 | Privacy Officer | Create DSAR | subject proof + request type | DSAR `RECEIVED` |
| 2 | System | Run collection tasks | dsarId | data package draft |
| 3 | Privacy Officer | Review package | evidence set | approved package |
| 4 | System | Deliver package | channel config | DSAR `FULFILLED` |

## FSM Definitions

### FSM-INCIDENT
| State | Invariant |
|---|---|
| NEW | incident record exists, owner MAY be null |
| TRIAGED | owner SHALL NOT be null |
| CONTAINED | containment evidence SHALL exist |
| CLOSED | closure approver and timestamp SHALL exist |

| event | guard | action | target |
|---|---|---|---|
| TRIAGE_APPROVED | role=ROLE-SEC-ANALYST | assign owner | TRIAGED |
| CONTAINMENT_CONFIRMED | evidence>=1 | set containedAt | CONTAINED |
| CLOSURE_APPROVED | role in {ROLE-SEC-ANALYST,ROLE-SUPERADMIN} | set closedAt | CLOSED |

### FSM-DSAR
| State | Invariant |
|---|---|
| RECEIVED | identity verification reference SHALL exist |
| IN_PROGRESS | collection job count >0 |
| FULFILLED | delivery proof SHALL exist |
| DENIED | legal basis code SHALL exist |

| event | guard | action | target |
|---|---|---|---|
| START_COLLECTION | worker capacity available | lock dsar | IN_PROGRESS |
| PACKAGE_DELIVERED | package signed | store proof | FULFILLED |
| LEGAL_DENIAL | legal basis valid | persist reason | DENIED |

## Timeout Rules

| Rule ID | Condition | Timeout | Action |
|---|---|---|---|
| TMO-INC-001 | incident remains NEW | 24h | escalate to ROLE-SUPERADMIN |
| TMO-DSAR-001 | dsar remains IN_PROGRESS | 72h | priority override + page ROLE-PRIVACY-OFFICER |

## Failure States and Recovery

| FSM | failure-state | trigger | recovery-transition |
|---|---|---|---|
| FSM-INCIDENT | FAILED_NOTIFICATION | notification provider error | RETRY_NOTIFICATION -> prior business state |
| FSM-DSAR | FAILED_COLLECTION | source timeout | RETRY_COLLECTION -> IN_PROGRESS |

## Parallel State Constraints

| Constraint ID | Rule |
|---|---|
| PAR-001 | Single incident SHALL NOT be in TRIAGED and CLOSED simultaneously. |
| PAR-002 | Single DSAR SHALL have at most one active collection lock. |

## Conflict Resolution Precedence

| Priority | Rule |
|---|---|
| CR-001 | Security authorization denial SHALL override business transition request. |
| CR-002 | Legal hold flag SHALL override deletion or closure transitions. |
| CR-003 | Higher severity incident transition SHALL preempt lower severity queue operations. |

## Retry and Rollback Decision Table

| condition | retry | rollback |
|---|---|---|
| transient network failure | 3 attempts exponential (1s,2s,4s) | none |
| persistent upstream timeout | 1 additional delayed retry at 60s | revert state to prior stable state |
| optimistic lock conflict | immediate one retry with fresh version | none |
| validation failure | none | none |
