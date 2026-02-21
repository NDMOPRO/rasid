# SEC-API

## OpenAPI 3.1 Canonical Spec

```yaml
openapi: 3.1.0
info: {title: RASID API, version: 1.0.0}
paths:
  /auth/login:
    post:
      operationId: login
      responses: {'200': {description: OK}, '401': {description: Unauthorized}}
  /incidents/ingest:
    post:
      operationId: ingestIncident
      responses: {'200': {description: Accepted}, '409': {description: Duplicate}}
  /privacy/assessments:
    post:
      operationId: createAssessment
      responses: {'201': {description: Created}, '422': {description: ValidationError}}
  /privacy/dsar:
    post:
      operationId: createDsar
      responses: {'201': {description: Created}}
  /ai/query:
    post:
      operationId: queryAi
      responses: {'200': {description: OK}, '502': {description: Degraded}}
```

## Endpoint Contract Table

| method | path | auth | headers | request schema | response schema | status codes |
|---|---|---|---|---|---|---|
| POST | /auth/login | none | Idempotency-Key | FEAT-001 input | FEAT-001 output | 200,401,403,429 |
| POST | /incidents/ingest | bearer + source signature | Idempotency-Key,X-Signature | FEAT-002 input | FEAT-002 output | 200,409,422,500 |
| POST | /privacy/assessments | bearer | Idempotency-Key | FEAT-003 input | FEAT-003 output | 201,403,409,422 |
| POST | /privacy/dsar | bearer | Idempotency-Key | FEAT-004 input | FEAT-004 output | 201,401,409,504 |
| POST | /ai/query | bearer | Idempotency-Key | FEAT-005 input | FEAT-005 output | 200,403,409,429,502 |

## Global Error Model

```json
{"type":"object","required":["code","message","retryable","traceId"],"properties":{"code":{"type":"string"},"message":{"type":"string"},"retryable":{"type":"boolean"},"traceId":{"type":"string"}}}
```

| Taxonomy | Codes |
|---|---|
| Authentication | AUTH-* |
| Authorization | AUTHZ-* |
| Validation | VAL-* |
| Domain Incident | INC-* |
| Domain Privacy | PRV-* |
| DSAR | DSAR-* |
| AI | AI-* |
| Platform | SYS-* |

## Idempotency Rules

| Endpoint | Rule |
|---|---|
| POST /auth/login | key scoped to `username+deviceId` 60s TTL |
| POST /incidents/ingest | key scoped to source composite unique key 24h TTL |
| POST /privacy/assessments | key scoped to `title+framework+creator` 10m TTL |
| POST /privacy/dsar | key scoped to `requestReference` 30d TTL |
| POST /ai/query | key scoped to `messageId+userId` 24h TTL |

## Pagination/Filtering/Sorting

| Rule ID | Rule |
|---|---|
| API-PAG-001 | cursor pagination SHALL use opaque base64 cursor token. |
| API-PAG-002 | max page size SHALL be 100. |
| API-FLT-001 | filter operators SHALL be eq,ne,lt,lte,gt,gte,in. |
| API-SRT-001 | sort format SHALL be `field:asc|desc`. |

## Backward Compatibility Rules

| Rule ID | Rule |
|---|---|
| API-BC-001 | Removing response fields SHALL NOT occur in same major version. |
| API-BC-002 | New required request fields SHALL require major version increment. |

## External Integration Contracts

| integration | payload schema | retries | timeout | idempotency | signature verification |
|---|---|---|---|---|---|
| SMTP | email_v1 JSON | 5 attempts exponential | 5s | message-id key | no |
| SMS | sms_v1 JSON | 5 attempts exponential | 4s | provider-message-id | no |
| Threat Feed | threat_event_v1 JSON | 3 attempts | 3s | source+externalId | HMAC-SHA256 REQUIRED |
| OIDC | OIDC standard claims | per provider | 10s | nonce+state | JWT signature REQUIRED |
