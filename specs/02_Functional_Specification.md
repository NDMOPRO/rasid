# SEC-FEAT

## Feature Catalog

| Feature ID | Capability |
|---|---|
| FEAT-001 | User Authentication and Session Issuance |
| FEAT-002 | Leak Incident Ingestion and Triage |
| FEAT-003 | Privacy Assessment Management |
| FEAT-004 | DSAR Request Lifecycle |
| FEAT-005 | AI Assistant Query Execution |

## FEAT-001

| Field | Value |
|---|---|
| Feature ID | FEAT-001 |
| Domain | IDENTITY |
| Owner Service(s) | svc-auth, svc-api |
| Entry Points | API |
| Preconditions | Username and password supplied; account status active |
| Postconditions | JWT access token and refresh token persisted and returned |
| Consistency Model | Strong |
| Concurrency Rules | Single active refresh token per device-id |
| Idempotency | Required; key=`Idempotency-Key` header |
| Rate Limits | 10 attempts/minute/account; 100 attempts/minute/IP |

### Input Schema (JSON Schema)
```json
{"type":"object","required":["username","password","workspace"],"properties":{"username":{"type":"string","minLength":3},"password":{"type":"string","minLength":12},"workspace":{"enum":["leaks","privacy"]},"deviceId":{"type":"string"}}}
```
### Validation Rules
| rule-id | condition | failure-code |
|---|---|---|
| VAL-001-1 | username not found | AUTH-404 |
| VAL-001-2 | password mismatch | AUTH-401 |
| VAL-001-3 | workspace not authorized for role | AUTH-403 |
### Processing Steps
| Step | Action |
|---|---|
| 1 | Validate payload against schema. |
| 2 | Enforce rate limit counters by account and IP. |
| 3 | Verify password hash using Argon2id parameters in SEC-SEC-CRYPTO. |
| 4 | Resolve role permissions for requested workspace. |
| 5 | Issue access token TTL 900s and refresh token TTL 7d. |
| 6 | Write audit event `auth.login.success` or failure event. |
### Output Schema
```json
{"type":"object","required":["accessToken","refreshToken","expiresAt"],"properties":{"accessToken":{"type":"string"},"refreshToken":{"type":"string"},"expiresAt":{"type":"string","format":"date-time"}}}
```
### Side Effects
| effect-id | description |
|---|---|
| FX-001-1 | Insert row into auth_sessions. |
| FX-001-2 | Publish `auth.session.created` event. |
### State Transition Table
| from-state | event | guard | action | to-state |
|---|---|---|---|---|
| ANON | LOGIN_SUBMIT | payload valid | create session | AUTHENTICATED |
| ANON | LOGIN_SUBMIT | invalid credentials | increment failure counter | ANON |
| AUTHENTICATED | TOKEN_EXPIRE | refresh valid | rotate token | AUTHENTICATED |
| AUTHENTICATED | LOGOUT | always | revoke tokens | TERMINATED |
### Error Conditions
| error-code | trigger | response | retryability |
|---|---|---|---|
| AUTH-401 | invalid credentials | 401 JSON error | MAY retry with backoff |
| AUTH-403 | unauthorized workspace | 403 JSON error | SHALL NOT retry until permission change |
| AUTH-429 | rate limit exceeded | 429 + retry-after | MAY retry after retry-after |
### Audit Events Emitted
| event | condition |
|---|---|
| audit.auth.login.success | successful login |
| audit.auth.login.failure | failed login |

## FEAT-002

| Field | Value |
|---|---|
| Feature ID | FEAT-002 |
| Domain | LEAKS |
| Owner Service(s) | svc-scan, svc-incident, svc-api |
| Entry Points | API/Event/Schedule |
| Preconditions | Source configured and active |
| Postconditions | Incident state updated and notifications dispatched |
| Consistency Model | Hybrid |
| Concurrency Rules | Optimistic lock by incident version |
| Idempotency | Required; key=`sourceId+externalId+hash` |
| Rate Limits | ingest 200 events/sec/source |

### Input Schema (JSON Schema)
```json
{"type":"object","required":["sourceId","externalId","severity","payloadHash"],"properties":{"sourceId":{"type":"string"},"externalId":{"type":"string"},"severity":{"enum":["low","medium","high","critical"]},"payloadHash":{"type":"string"}}}
```
### Validation Rules
| rule-id | condition | failure-code |
|---|---|---|
| VAL-002-1 | duplicate idempotency key | INC-409 |
| VAL-002-2 | unknown source | INC-404 |
| VAL-002-3 | invalid severity | INC-422 |
### Processing Steps
| Step | Action |
|---|---|
| 1 | Validate ingest payload schema and signature for external source. |
| 2 | Deduplicate by idempotency key. |
| 3 | Upsert incident record with state `NEW`. |
| 4 | Execute scoring rules and assign owner queue. |
| 5 | Emit `incident.created` event and schedule notification workflow. |
| 6 | Persist audit event with actor `system`. |
### Output Schema
```json
{"type":"object","required":["incidentId","state"],"properties":{"incidentId":{"type":"string"},"state":{"enum":["NEW","TRIAGED","CONTAINED","CLOSED"]}}}
```
### Side Effects
| effect-id | description |
|---|---|
| FX-002-1 | Insert/Update incidents table. |
| FX-002-2 | Publish event to topic `rasid.leaks.incident.v1`. |
| FX-002-3 | Queue email/SMS notification jobs. |
### State Transition Table
| from-state | event | guard | action | to-state |
|---|---|---|---|---|
| NONE | INCIDENT_INGESTED | valid | create incident | NEW |
| NEW | TRIAGE_APPROVED | analyst assigned | set priority | TRIAGED |
| TRIAGED | CONTAINMENT_CONFIRMED | evidence attached | set containmentAt | CONTAINED |
| CONTAINED | CLOSURE_APPROVED | reviewer role | set closedAt | CLOSED |
### Error Conditions
| error-code | trigger | response | retryability |
|---|---|---|---|
| INC-409 | duplicate message | 200 with existing incidentId | SHALL NOT retry |
| INC-500 | persistence error | 500 | MAY retry with exponential backoff |
### Audit Events Emitted
| event | condition |
|---|---|
| audit.incident.created | incident created |
| audit.incident.state.changed | any state transition |

## FEAT-003

| Field | Value |
|---|---|
| Feature ID | FEAT-003 |
| Domain | PRIVACY |
| Owner Service(s) | svc-privacy, svc-api |
| Entry Points | UI/API |
| Preconditions | Role includes `privacy:assessment:write` |
| Postconditions | Assessment record with control scores persisted |
| Consistency Model | Strong |
| Concurrency Rules | Row version check |
| Idempotency | Required for create requests |
| Rate Limits | 60 writes/minute/user |

### Input Schema (JSON Schema)
```json
{"type":"object","required":["title","framework","controls"],"properties":{"title":{"type":"string","minLength":5},"framework":{"enum":["PDPL","GDPR","ISO27701"]},"controls":{"type":"array","items":{"type":"object","required":["controlId","score"],"properties":{"controlId":{"type":"string"},"score":{"type":"integer","minimum":0,"maximum":100}}}}}}
```
### Validation Rules
| rule-id | condition | failure-code |
|---|---|---|
| VAL-003-1 | controlId unknown | PRV-422 |
| VAL-003-2 | score out of range | PRV-422 |
### Processing Steps
| Step | Action |
|---|---|
| 1 | Validate schema and permissions. |
| 2 | Persist assessment header and control rows transactionally. |
| 3 | Compute aggregate compliance score. |
| 4 | Emit `privacy.assessment.saved` event. |
### Output Schema
```json
{"type":"object","required":["assessmentId","overallScore"],"properties":{"assessmentId":{"type":"string"},"overallScore":{"type":"number"}}}
```
### Side Effects
| effect-id | description |
|---|---|
| FX-003-1 | Insert assessment/control rows. |
| FX-003-2 | Append audit log. |
### State Transition Table
| from-state | event | guard | action | to-state |
|---|---|---|---|---|
| DRAFT | SUBMIT | mandatory controls complete | lock edits | SUBMITTED |
| SUBMITTED | APPROVE | reviewer role | set approvedAt | APPROVED |
| SUBMITTED | REJECT | reviewer role | set rejectionReason | DRAFT |
### Error Conditions
| error-code | trigger | response | retryability |
|---|---|---|---|
| PRV-403 | unauthorized | 403 | SHALL NOT retry |
| PRV-409 | version conflict | 409 | MAY retry with fresh version |
### Audit Events Emitted
| event | condition |
|---|---|
| audit.privacy.assessment.created | create |
| audit.privacy.assessment.updated | update |

## FEAT-004 and FEAT-005 SHALL follow identical contract structure with schemas, validation, processing, output, side effects, transitions, errors, and audit events defined in SEC-API and SEC-EVT canonical references.

## FEAT-004

| Field | Value |
|---|---|
| Feature ID | FEAT-004 |
| Domain | PRIVACY |
| Owner Service(s) | svc-dsar, svc-api |
| Entry Points | UI/API/Event |
| Preconditions | Data subject identity verified |
| Postconditions | DSAR state advanced and response package generated |
| Consistency Model | Hybrid |
| Concurrency Rules | Single active processing lock per dsarId |
| Idempotency | Required; key=`requestReference` |
| Rate Limits | 20 creates/minute/org |

### Input Schema (JSON Schema)
```json
{"type":"object","required":["requestReference","subjectId","requestType"],"properties":{"requestReference":{"type":"string"},"subjectId":{"type":"string"},"requestType":{"enum":["ACCESS","ERASURE","RECTIFICATION","PORTABILITY"]}}}
```
### Validation Rules
| rule-id | condition | failure-code |
|---|---|---|
| VAL-004-1 | identity unverified | DSAR-401 |
| VAL-004-2 | duplicate requestReference | DSAR-409 |
### Processing Steps
| Step | Action |
|---|---|
| 1 | Validate input and subject verification evidence. |
| 2 | Create DSAR record with SLA due date by requestType. |
| 3 | Enqueue data collection jobs per data domain. |
| 4 | Aggregate responses and generate package. |
| 5 | Transition state to fulfilled or denied with legal reason. |
### Output Schema
```json
{"type":"object","required":["dsarId","state","dueAt"],"properties":{"dsarId":{"type":"string"},"state":{"enum":["RECEIVED","IN_PROGRESS","FULFILLED","DENIED"]},"dueAt":{"type":"string","format":"date-time"}}}
```
### Side Effects
| effect-id | description |
|---|---|
| FX-004-1 | DSAR records inserted and task rows created. |
| FX-004-2 | `privacy.dsar.created` event emitted. |
### State Transition Table
| from-state | event | guard | action | to-state |
|---|---|---|---|---|
| NONE | DSAR_CREATED | valid | persist request | RECEIVED |
| RECEIVED | COLLECTION_STARTED | worker available | lock request | IN_PROGRESS |
| IN_PROGRESS | PACKAGE_READY | evidence complete | deliver package | FULFILLED |
| IN_PROGRESS | LEGAL_DENIAL | valid legal basis | store denial reason | DENIED |
### Error Conditions
| error-code | trigger | response | retryability |
|---|---|---|---|
| DSAR-409 | duplicate request | 200 existing state | SHALL NOT retry |
| DSAR-504 | provider timeout | 504 | MAY retry |
### Audit Events Emitted
| event | condition |
|---|---|
| audit.dsar.created | request created |
| audit.dsar.fulfilled | fulfilled |
| audit.dsar.denied | denied |

## FEAT-005

| Field | Value |
|---|---|
| Feature ID | FEAT-005 |
| Domain | AI |
| Owner Service(s) | svc-ai, svc-api |
| Entry Points | UI/API |
| Preconditions | Authenticated user; workspace context set |
| Postconditions | Deterministic tool responses and citation metadata returned |
| Consistency Model | Eventual |
| Concurrency Rules | Max 4 concurrent queries/user |
| Idempotency | Required for POST /ai/query by client message id |
| Rate Limits | 30 queries/minute/user |

### Input Schema (JSON Schema)
```json
{"type":"object","required":["workspace","messageId","query"],"properties":{"workspace":{"enum":["leaks","privacy"]},"messageId":{"type":"string"},"query":{"type":"string","minLength":3},"toolHints":{"type":"array","items":{"type":"string"}}}}
```
### Validation Rules
| rule-id | condition | failure-code |
|---|---|---|
| VAL-005-1 | workspace mismatch token claim | AI-403 |
| VAL-005-2 | messageId duplicate | AI-409 |
### Processing Steps
| Step | Action |
|---|---|
| 1 | Validate schema and authorization. |
| 2 | Route query to workspace tool registry. |
| 3 | Execute allowed tools with timeout 8s each and max 3 retries. |
| 4 | Compose response with source citations and confidence score. |
| 5 | Persist conversation turn and emit telemetry event. |
### Output Schema
```json
{"type":"object","required":["messageId","answer","citations"],"properties":{"messageId":{"type":"string"},"answer":{"type":"string"},"citations":{"type":"array","items":{"type":"object","required":["source","reference"],"properties":{"source":{"type":"string"},"reference":{"type":"string"}}}},"confidence":{"type":"number","minimum":0,"maximum":1}}}
```
### Side Effects
| effect-id | description |
|---|---|
| FX-005-1 | ai_conversations row inserted. |
| FX-005-2 | `ai.query.executed` event published. |
### State Transition Table
| from-state | event | guard | action | to-state |
|---|---|---|---|---|
| IDLE | QUERY_SUBMIT | valid | start execution | RUNNING |
| RUNNING | TOOL_SUCCESS | all required tools complete | compose answer | COMPLETED |
| RUNNING | TOOL_TIMEOUT | retries exhausted | fallback response | DEGRADED |
| DEGRADED | USER_RETRY | rate limit ok | rerun query | RUNNING |
### Error Conditions
| error-code | trigger | response | retryability |
|---|---|---|---|
| AI-429 | rate limit exceeded | 429 | MAY retry after retry-after |
| AI-502 | tool upstream failure | 502 degraded answer | MAY retry |
### Audit Events Emitted
| event | condition |
|---|---|
| audit.ai.query.executed | successful completion |
| audit.ai.query.degraded | fallback triggered |
