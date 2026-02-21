# SEC-GOV

## Data Classification Matrix

| Class | Description | Examples | Required Controls |
|---|---|---|---|
| PUBLIC | non-sensitive | documentation metadata | integrity checks |
| INTERNAL | business operational | incident summary | RBAC + audit |
| CONFIDENTIAL | personal or security data | DSAR identity data, raw leak payload | encryption + least privilege + DLP |
| RESTRICTED | cryptographic and secrets | signing keys, secret values | HSM/KMS + break-glass approval |

## Risk Register

| risk-id | description | likelihood | impact | mitigation | owner |
|---|---|---|---|---|---|
| RSK-001 | unauthorized data access | medium | high | RBAC + MFA + audit alerts | Security Lead |
| RSK-002 | delayed DSAR fulfillment | medium | high | SLA timers + escalation runbook | Privacy Officer |
| RSK-003 | event loss in broker outage | low | high | durable topics + replay + DLQ | Platform Architect |
| RSK-004 | key compromise | low | critical | rotation + key isolation + incident playbook | Security Lead |

## Control Mapping Table

| control-id | requirement mapping | evidence required |
|---|---|---|
| CTRL-001 | PDPL lawful processing | DSAR logs + consent records |
| CTRL-002 | GDPR Art.32 security | encryption configs + pentest reports |
| CTRL-003 | ISO27001 A.12 logging | audit_event retention evidence |
| CTRL-004 | SOC2 CC7 monitoring | alert history + incident records |

## Audit Evidence Artifacts and Retention

| Artifact | Retention |
|---|---|
| audit_events export | 7 years |
| access review reports | 3 years |
| vulnerability scan reports | 2 years |
| incident postmortems | 5 years |

## Policy Enforcement Mechanisms

| Mechanism | Technical Control |
|---|---|
| access policy | centralized RBAC middleware |
| encryption policy | KMS-enforced storage encryption and TLS policy |
| retention policy | scheduled archival and deletion jobs with audit proofs |
| change policy | CI/CD gated approvals and signed artifacts |
