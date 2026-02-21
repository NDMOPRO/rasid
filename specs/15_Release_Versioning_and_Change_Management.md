# SEC-REL

## SemVer Rules

| Rule ID | Rule |
|---|---|
| REL-SEM-001 | Platform SHALL use SemVer `MAJOR.MINOR.PATCH`. |
| REL-SEM-002 | Breaking API or event changes SHALL increment MAJOR. |
| REL-SEM-003 | Additive backward-compatible changes SHALL increment MINOR. |
| REL-SEM-004 | Fix-only releases SHALL increment PATCH. |

## Deprecation Policy

| Rule ID | Rule |
|---|---|
| REL-DEP-001 | Deprecated endpoints SHALL emit warning header for 90 days minimum. |
| REL-DEP-002 | Deprecation notice SHALL include migration path and removal date. |

## API Versioning Policy

| Rule ID | Rule |
|---|---|
| REL-API-001 | URI major versioning SHALL use `/v{major}`. |
| REL-API-002 | Minor changes SHALL remain within same major URI. |

## Data Migration Compatibility

| Rule ID | Rule |
|---|---|
| REL-DATA-001 | Expand-and-contract pattern SHALL be used for destructive schema changes. |
| REL-DATA-002 | Application SHALL support old and new schema during migration window. |

## Release Checklist Gates

| Gate | Required Evidence |
|---|---|
| G1 | all CI suites green |
| G2 | SAST/DAST pass |
| G3 | migration dry-run pass |
| G4 | observability dashboards updated |
| G5 | rollback rehearsal evidence |

## Approval Workflow (RACI)

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| feature release | Engineering Lead | Product Owner | Security Lead, QA Lead | Operations |
| security patch | Security Lead | CTO | Engineering Lead | Compliance Officer |
| infra change | SRE Lead | Platform Architect | Security Lead | Product Owner |

## Rollback Triggers and Procedures

| Trigger | Procedure |
|---|---|
| Sev1 incident post-release | execute blue/green traffic switch to previous stable |
| error budget burn spike | halt rollout and rollback canary |
| migration regression | stop writes, restore snapshot, redeploy prior app version |
