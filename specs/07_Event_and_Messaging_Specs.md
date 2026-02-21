# SEC-EVT

## Topic Naming Convention

| Rule ID | Rule |
|---|---|
| EVT-NAME-001 | Topic format SHALL be `rasid.<domain>.<entity>.<version>`. |
| EVT-NAME-002 | Domain SHALL be one of `auth,leaks,privacy,ai,ops,audit`. |

## Canonical Event Envelope Schema

```json
{"type":"object","required":["eventId","eventType","eventVersion","occurredAt","producer","traceId","payload"],"properties":{"eventId":{"type":"string"},"eventType":{"type":"string"},"eventVersion":{"type":"string"},"occurredAt":{"type":"string","format":"date-time"},"producer":{"type":"string"},"traceId":{"type":"string"},"idempotencyKey":{"type":"string"},"payload":{"type":"object"}}}
```

## Event Type Schemas

| Event Type | Topic | Payload Required Fields |
|---|---|---|
| auth.session.created | rasid.auth.session.v1 | userId,sessionId,workspace,expiresAt |
| incident.created | rasid.leaks.incident.v1 | incidentId,severity,state |
| incident.state.changed | rasid.leaks.incident.v1 | incidentId,fromState,toState,actorId |
| privacy.assessment.saved | rasid.privacy.assessment.v1 | assessmentId,framework,overallScore |
| privacy.dsar.created | rasid.privacy.dsar.v1 | dsarId,requestType,dueAt |
| ai.query.executed | rasid.ai.query.v1 | queryId,workspace,confidence |
| audit.event.logged | rasid.audit.event.v1 | auditEventId,category,actor |

## Ordering Guarantees

| Topic | Guarantee |
|---|---|
| rasid.leaks.incident.v1 | order guaranteed per incidentId partition key |
| rasid.privacy.dsar.v1 | order guaranteed per dsarId partition key |
| rasid.ai.query.v1 | no cross-key ordering guarantee |

## Delivery Semantics

| Topic | Semantics |
|---|---|
| rasid.auth.session.v1 | at-least-once |
| rasid.leaks.incident.v1 | at-least-once |
| rasid.privacy.assessment.v1 | at-least-once |
| rasid.privacy.dsar.v1 | at-least-once |
| rasid.ai.query.v1 | at-most-once |
| rasid.audit.event.v1 | exactly-once via transactional outbox |

## Retry and DLQ Rules

| Rule ID | Rule |
|---|---|
| EVT-RET-001 | Consumer retry SHALL be 5 attempts exponential (1s..32s). |
| EVT-DLQ-001 | Message SHALL move to DLQ after retry exhaustion. |
| EVT-DLQ-002 | DLQ replay SHALL require ROLE-OPS approval ticket reference. |

## Replay and Reprocessing Safeguards

| Safeguard ID | Rule |
|---|---|
| EVT-RPL-001 | Replay SHALL include `replayBatchId`. |
| EVT-RPL-002 | Consumers SHALL reject duplicate `eventId`. |
| EVT-RPL-003 | Replay window SHALL NOT exceed 30 days without Security Lead approval. |

## Consumer Idempotency Requirements

| Consumer | Idempotency Key |
|---|---|
| notification-worker | eventId |
| incident-projection-worker | incidentId+eventVersion+toState |
| dsar-collection-worker | dsarId+taskType |

## Event Versioning Rules

| Rule ID | Rule |
|---|---|
| EVT-VER-001 | Breaking payload change SHALL increment major event version. |
| EVT-VER-002 | Additive payload fields SHALL increment minor event version. |
| EVT-VER-003 | Producer SHALL support prior minor version for 90 days. |
