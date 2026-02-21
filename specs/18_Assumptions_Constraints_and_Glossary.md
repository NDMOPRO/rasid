# SEC-ASC

## Assumptions

| assumption-id | statement | impact | verification method |
|---|---|---|---|
| ASM-001 | Platform primary domains are leaks monitoring and privacy compliance. | scope definitions and role matrix | stakeholder sign-off |
| ASM-002 | PostgreSQL and Redis SHALL be canonical data stores. | architecture and IaC constraints | deployment manifest review |
| ASM-003 | OIDC federation SHALL be available for enterprise SSO. | auth flow and token claims | integration test evidence |
| ASM-004 | Event broker SHALL support durable topics and DLQ. | messaging semantics | broker config audit |
| ASM-005 | AI assistant SHALL operate in tool-augmented deterministic mode. | AI spec and fallback behavior | AI test suite |

## Constraints

| constraint-id | statement | affected areas |
|---|---|---|
| CON-001 | No undocumented assumptions SHALL exist outside this file. | all sections |
| CON-002 | All normative requirements SHALL use RFC2119 keywords. | all sections |
| CON-003 | All feature/API/event contracts SHALL define schemas. | SEC-FEAT, SEC-API, SEC-EVT |
| CON-004 | All retention and deletion requirements SHALL be auditable. | SEC-DATA, SEC-GOV |

## Glossary

| term-id | term | canonical definition | owner | references |
|---|---|---|---|---|
| TERM-PLATFORM | RASID Platform | Dual-workspace SaaS system for leak monitoring and privacy compliance operations. | Product Owner | SEC-SCOPE |
| TERM-WORKSPACE | Workspace | Logical operational domain selected at session start: `leaks` or `privacy`. | Platform Architect | FEAT-001 |
| TERM-INCIDENT | Incident | Leak-monitoring record with lifecycle NEW->TRIAGED->CONTAINED->CLOSED. | Security Lead | FEAT-002 |
| TERM-DSAR | DSAR | Data Subject Access Request lifecycle object for privacy rights handling. | Privacy Officer | FEAT-004 |
| TERM-AUDIT-EVENT | Audit Event | Immutable security/compliance event record with actor, action, resource, result. | Compliance Officer | SEC-SEC |
| TERM-IDEMPOTENCY | Idempotency | Property where repeated request with same key SHALL return equivalent effect. | Platform Architect | SEC-API |
