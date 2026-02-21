# SPEC-MASTER-INDEX

## File Responsibility Matrix

| File | Responsibility ID | Unique Responsibility |
|---|---|---|
| 00_Master_Index.md | RESP-000 | Specification registry, precedence, change control, glossary map |
| 01_Core_Vision_and_Scope.md | RESP-001 | Scope boundaries, role IDs, measurable objectives |
| 02_Functional_Specification.md | RESP-002 | Feature-level deterministic behavior contracts |
| 03_User_Journeys_and_State_Machines.md | RESP-003 | Journey steps and finite state machines |
| 04_System_Architecture.md | RESP-004 | Logical/deployment architecture and resilience contracts |
| 05_Data_Models_and_Schemas.md | RESP-005 | Canonical entities, schemas, DDL, lifecycle |
| 06_API_and_Integration_Specs.md | RESP-006 | HTTP API contracts and external integration rules |
| 07_Event_and_Messaging_Specs.md | RESP-007 | Event envelope, topics, semantics, replay, DLQ |
| 08_AI_and_Algorithm_Specs.md | RESP-008 | AI workflow, thresholds, fallback, drift monitoring |
| 09_Security_and_Access_Control.md | RESP-009 | Authentication, authorization, crypto, STRIDE |
| 10_Configuration_and_Feature_Flags.md | RESP-010 | Configuration precedence and flag lifecycle |
| 11_Deployment_Infrastructure_and_IaC.md | RESP-011 | IaC topology, deployment gates, DR rules |
| 12_Observability_and_SLO_Definitions.md | RESP-012 | Logs/metrics/traces, SLI/SLO, alert policies |
| 13_Performance_Capacity_and_Scalability.md | RESP-013 | Performance limits, scaling triggers, capacity formulas |
| 14_Testing_Strategy_and_Validation_Matrix.md | RESP-014 | Test policy and requirement-to-evidence traceability |
| 15_Release_Versioning_and_Change_Management.md | RESP-015 | Versioning, deprecation, release approvals, rollback |
| 16_Compliance_Risk_and_Governance.md | RESP-016 | Controls, risk register, evidence governance |
| 17_Operational_Runbooks_and_Incident_Response.md | RESP-017 | Operations procedures and incident handling |
| 18_Assumptions_Constraints_and_Glossary.md | RESP-018 | Assumptions, constraints, canonical glossary |

## Section Cross-Reference Table

| Section ID | Canonical File |
|---|---|
| SEC-SCOPE-* | 01_Core_Vision_and_Scope.md |
| SEC-FEAT-* | 02_Functional_Specification.md |
| SEC-FSM-* | 03_User_Journeys_and_State_Machines.md |
| SEC-ARCH-* | 04_System_Architecture.md |
| SEC-DATA-* | 05_Data_Models_and_Schemas.md |
| SEC-API-* | 06_API_and_Integration_Specs.md |
| SEC-EVT-* | 07_Event_and_Messaging_Specs.md |
| SEC-AI-* | 08_AI_and_Algorithm_Specs.md |
| SEC-SEC-* | 09_Security_and_Access_Control.md |
| SEC-CONF-* | 10_Configuration_and_Feature_Flags.md |
| SEC-DEP-* | 11_Deployment_Infrastructure_and_IaC.md |
| SEC-OBS-* | 12_Observability_and_SLO_Definitions.md |
| SEC-PERF-* | 13_Performance_Capacity_and_Scalability.md |
| SEC-TEST-* | 14_Testing_Strategy_and_Validation_Matrix.md |
| SEC-REL-* | 15_Release_Versioning_and_Change_Management.md |
| SEC-GOV-* | 16_Compliance_Risk_and_Governance.md |
| SEC-OPS-* | 17_Operational_Runbooks_and_Incident_Response.md |
| SEC-ASC-* | 18_Assumptions_Constraints_and_Glossary.md |

## Specification Versioning Rules

| Rule ID | Rule |
|---|---|
| VER-001 | Spec set SHALL use SemVer `MAJOR.MINOR.PATCH`. |
| VER-002 | MAJOR MUST increment when any requirement backward incompatibility is introduced. |
| VER-003 | MINOR MUST increment when additive deterministic requirements are introduced. |
| VER-004 | PATCH MUST increment when typo or non-behavioral clarification is introduced. |
| VER-005 | All files MUST share identical version string in metadata header `Spec-Version`. |

## Change Control Rules

| Rule ID | Actor | Change Scope | Approval Gate |
|---|---|---|---|
| CHG-001 | Product Owner | 01,02,03 | Security Lead + Platform Architect |
| CHG-002 | Platform Architect | 04,05,06,07,11,13 | Product Owner + SRE Lead |
| CHG-003 | Security Lead | 09,16 | Product Owner + Compliance Officer |
| CHG-004 | SRE Lead | 12,17 | Platform Architect + Security Lead |
| CHG-005 | QA Lead | 14,15 | Product Owner + Platform Architect |
| CHG-006 | Compliance Officer | 16,18 | Security Lead + Product Owner |

## Precedence Rules

| Priority | Rule |
|---|---|
| P1 | 00_Master_Index.md SHALL define canonical precedence. |
| P2 | 18_Assumptions_Constraints_and_Glossary.md SHALL define canonical term meanings. |
| P3 | In conflict, security requirements in 09 SHALL override lower-layer behavior rules. |
| P4 | In conflict, data retention rules in 05 SHALL override feature-local persistence in 02. |
| P5 | In conflict, release gates in 15 SHALL block deployment rules in 11. |

## Glossary Canonical Link Map

| Term ID | Canonical Definition |
|---|---|
| TERM-PLATFORM | 18_Assumptions_Constraints_and_Glossary.md#glossary |
| TERM-WORKSPACE | 18_Assumptions_Constraints_and_Glossary.md#glossary |
| TERM-INCIDENT | 18_Assumptions_Constraints_and_Glossary.md#glossary |
| TERM-DSAR | 18_Assumptions_Constraints_and_Glossary.md#glossary |
| TERM-AUDIT-EVENT | 18_Assumptions_Constraints_and_Glossary.md#glossary |

## Determinism Validation Gate Matrix

| Gate ID | Requirement | Canonical Section |
|---|---|---|
| GATE-001 | Every input has a schema | SEC-FEAT, SEC-API, SEC-EVT |
| GATE-002 | Every output has a schema | SEC-FEAT, SEC-API |
| GATE-003 | Every feature has processing steps | SEC-FEAT |
| GATE-004 | Every state has transition guards/actions | SEC-FSM |
| GATE-005 | Every error has code and retry policy | SEC-FEAT, SEC-API |
| GATE-006 | Every endpoint has contract and idempotency | SEC-API |
| GATE-007 | Every role has permissions and constraints | SEC-SEC |
| GATE-008 | Every config/flag has precedence and lifecycle | SEC-CONF |
| GATE-009 | Every data entity has lifecycle and retention | SEC-DATA |
| GATE-010 | Every failure mode has deterministic handling | SEC-OPS |
| GATE-011 | Every scaling decision has measurable triggers | SEC-PERF |
| GATE-012 | Every change has versioning and rollback rules | SEC-REL |
| GATE-013 | Every requirement maps to tests and evidence | SEC-TEST |
