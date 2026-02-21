# SEC-SCOPE

## In-Scope

| Scope ID | Item |
|---|---|
| IN-001 | Dual workspace platform: `leaks` monitoring workspace and `privacy` compliance workspace. |
| IN-002 | User authentication, session lifecycle, role-based authorization. |
| IN-003 | Incident lifecycle management, alerting, and evidence export workflows. |
| IN-004 | Privacy assessment lifecycle, DSAR handling, and compliance control tracking. |
| IN-005 | AI assistant tooling for retrieval and summarization across both workspaces. |
| IN-006 | API, event bus, data persistence, observability, deployment automation. |

## Out-of-Scope

| Scope ID | Item |
|---|---|
| OUT-001 | Payment processing and billing workflows. |
| OUT-002 | Native mobile applications. |
| OUT-003 | Third-party identity provider administration outside OIDC federation configuration. |
| OUT-004 | Unmanaged custom plugins not registered through configuration schema in SEC-CONF-001. |

## System Boundaries

| Boundary ID | Internal System |
|---|---|
| BND-001 | Web client, API gateway, domain services, worker services, event broker, relational database, object storage, cache, observability stack. |

| Boundary ID | External System |
|---|---|
| BND-EXT-001 | SMTP provider, SMS provider, threat intelligence providers, OIDC IdP, KMS provider, object storage KMS keys. |

## Target User Roles

| Role ID | Role Name | Workspace Access |
|---|---|---|
| ROLE-SUPERADMIN | Super Administrator | leaks + privacy |
| ROLE-SEC-ANALYST | Security Analyst | leaks |
| ROLE-PRIVACY-OFFICER | Privacy Officer | privacy |
| ROLE-AUDITOR | Auditor | read-only both |
| ROLE-OPS | Operations Engineer | operational endpoints only |

## Constraints

| Constraint ID | Type | Statement |
|---|---|---|
| CST-001 | Technical | Platform MUST operate as stateless services behind load balancer; session SHALL be token-based. |
| CST-002 | Legal | Personal data processing MUST comply with PDPL/GDPR mapping controls in SEC-GOV-CTRL. |
| CST-003 | Operational | RTO SHALL be 60 minutes and RPO SHALL be 15 minutes. |
| CST-004 | Security | All data in transit MUST use TLS 1.2+ and at rest MUST use AES-256 encryption. |

## Success Criteria

| Success ID | Metric | Threshold |
|---|---|---|
| SUC-001 | API availability SLO | >= 99.9% monthly |
| SUC-002 | P95 read latency | <= 300 ms |
| SUC-003 | P95 write latency | <= 500 ms |
| SUC-004 | Critical incident MTTR | <= 45 minutes |
| SUC-005 | Failed authorization bypass rate | = 0 |
