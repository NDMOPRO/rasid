# SEC-SEC

## Authentication Flow Tables

| step | flow | action |
|---|---|---|
| 1 | password login | submit credentials + workspace |
| 2 | password login | validate hash and account status |
| 3 | password login | issue JWT access token and refresh token |
| 4 | refresh | verify refresh token binding and rotate |
| 5 | logout | revoke session and emit audit event |

## Token Schema

```json
{"type":"object","required":["sub","role","workspace","iat","exp","jti"],"properties":{"sub":{"type":"string"},"role":{"type":"string"},"workspace":{"type":"string"},"scope":{"type":"array","items":{"type":"string"}},"iat":{"type":"integer"},"exp":{"type":"integer"},"jti":{"type":"string"}}}
```

## Key Rotation Policy

| Rule ID | Rule |
|---|---|
| SEC-KEY-001 | JWT signing keys SHALL rotate every 90 days. |
| SEC-KEY-002 | Emergency key rotation SHALL complete within 15 minutes. |
| SEC-KEY-003 | Previous key SHALL remain for verification 24 hours maximum. |

## Secret Storage and Retrieval

| Rule ID | Rule |
|---|---|
| SEC-SEC-001 | Secrets MUST be stored in managed secret manager with envelope encryption. |
| SEC-SEC-002 | Runtime retrieval SHALL use workload identity and short-lived tokens. |

## Role Permission Matrix

| Role | incidents.read | incidents.write | privacy.read | privacy.write | dsar.manage | admin.config |
|---|---|---|---|---|---|---|
| ROLE-SUPERADMIN | Y | Y | Y | Y | Y | Y |
| ROLE-SEC-ANALYST | Y | Y | N | N | N | N |
| ROLE-PRIVACY-OFFICER | N | N | Y | Y | Y | N |
| ROLE-AUDITOR | Y | N | Y | N | N | N |
| ROLE-OPS | N | N | N | N | N | Y |

## Resource-Action Mapping

| Resource | Actions |
|---|---|
| /incidents | read,write,close |
| /privacy/assessments | read,write,approve |
| /privacy/dsar | read,write,fulfill,deny |
| /config/flags | read,write,toggle |

## Field-Level Access Rules

| Field | Allowed Roles |
|---|---|
| users.password_hash | ROLE-SUPERADMIN only |
| dsar_requests.subject_identifier | ROLE-PRIVACY-OFFICER, ROLE-SUPERADMIN |
| incidents.raw_payload | ROLE-SEC-ANALYST, ROLE-SUPERADMIN |

## Encryption Rules

| Layer | Requirement |
|---|---|
| In transit | TLS 1.2+ REQUIRED, mTLS REQUIRED for internal service calls |
| At rest | AES-256 REQUIRED for DB, object storage, backups |
| KMS | customer-managed keys REQUIRED for production |

## Audit Logging

### Audit Event Schema
```json
{"type":"object","required":["eventId","eventType","actorId","resource","action","result","timestamp","traceId"],"properties":{"eventId":{"type":"string"},"eventType":{"type":"string"},"actorId":{"type":"string"},"resource":{"type":"string"},"action":{"type":"string"},"result":{"enum":["success","failure"]},"timestamp":{"type":"string","format":"date-time"},"traceId":{"type":"string"}}}
```

| Mandatory Audit Points |
|---|
| login success/failure, role changes, incident state changes, DSAR fulfillment/denial, config changes, key rotations |

## STRIDE Table

| asset | threat | control | residual risk |
|---|---|---|---|
| auth token | spoofing | signed JWT + jti revocation | low |
| incident data | tampering | row versioning + audit trail | low |
| DSAR package | information disclosure | field encryption + RBAC | medium |
| event broker | repudiation | immutable audit + eventId | low |
| API gateway | DoS | rate limiting + WAF | medium |
| config store | elevation of privilege | approval workflow + least privilege | low |
