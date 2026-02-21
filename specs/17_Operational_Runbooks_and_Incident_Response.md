# SEC-OPS

## Critical Service Runbooks

### RBK-API Gateway
| symptom | checks | diagnosis | mitigation | recovery | verification |
|---|---|---|---|---|---|
| elevated 5xx | check pod health, error logs, upstream latency | upstream outage or config regression | enable circuit breaker, reduce traffic, rollback recent deploy | restore healthy pods and config | 5xx < 0.5% 15m |

### RBK-Event Broker
| symptom | checks | diagnosis | mitigation | recovery | verification |
|---|---|---|---|---|---|
| consumer lag spike | inspect broker partitions and consumer status | consumer failure or broker saturation | scale consumers, pause non-critical topics | replay from checkpoint after stabilization | lag < 100 for 10m |

### RBK-Database
| symptom | checks | diagnosis | mitigation | recovery | verification |
|---|---|---|---|---|---|
| high query latency | slow query log, CPU, lock waits | missing index or hot lock | apply throttling, kill blocking sessions | apply index/migration patch | p95 latency baseline restored |

## Incident Severity Model

| Severity | Criteria |
|---|---|
| Sev1 | data breach risk, full outage, compliance deadline breach |
| Sev2 | partial outage impacting critical journey |
| Sev3 | degraded non-critical functionality |
| Sev4 | minor defect with workaround |

## Escalation Policy

| Severity | Initial Responder | Escalation |
|---|---|---|
| Sev1 | oncall-sre | Security Lead + CTO within 5 minutes |
| Sev2 | service oncall | Engineering Manager within 15 minutes |
| Sev3 | service owner | daily ops review |
| Sev4 | backlog owner | weekly triage |

## Incident Timeline Template

| Field | Required |
|---|---|
| incident_id | REQUIRED |
| detection_time | REQUIRED |
| declared_time | REQUIRED |
| mitigated_time | REQUIRED |
| resolved_time | REQUIRED |
| impacted_services | REQUIRED |
| customer_impact | REQUIRED |

## Post-Incident RCA Template

| Field | Required |
|---|---|
| root_cause | REQUIRED |
| contributing_factors | REQUIRED |
| detection_gap | REQUIRED |
| corrective_actions | REQUIRED |
| preventive_actions | REQUIRED |
| owner | REQUIRED |
| due_date | REQUIRED |

## Common Failure Modes

| failure mode | handling rule |
|---|---|
| SMTP outage | queue emails, retry policy, fallback to in-app notification |
| SMS provider outage | disable SMS channel, page ops, continue email channel |
| DB failover event | enable read-only mode until primary restored |
| token signing key invalid | rotate key, revoke active sessions, force re-authentication |
