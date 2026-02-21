# SEC-TEST

## Coverage Thresholds

| Test Layer | Threshold |
|---|---|
| unit | >= 85% line coverage |
| integration | >= 75% critical path coverage |
| e2e | 100% for P0 journeys |

## Required Test Types

| Type | Scope |
|---|---|
| unit | pure business rules and validators |
| integration | service + DB + event broker interactions |
| contract | API schema compatibility and event schema compatibility |
| e2e | JRN-001 and JRN-002 flows |
| chaos | dependency timeout, broker lag, DB failover |

## Contract Testing Policy

| Rule ID | Rule |
|---|---|
| CT-001 | API consumers SHALL run provider contract tests on each CI run. |
| CT-002 | Event producers SHALL validate schema registry compatibility before release. |

## Regression Suite Definition

| Suite ID | Trigger | Contents |
|---|---|---|
| REG-FAST | pull request | unit + contract |
| REG-FULL | pre-release | integration + e2e + chaos smoke |

## Validation Matrix

| Requirement ID | Test ID | Evidence Artifact |
|---|---|---|
| FEAT-001 | T-AUTH-001 | ci/artifacts/auth_login_report.xml |
| FEAT-002 | T-INC-001 | ci/artifacts/incident_ingest_report.xml |
| FEAT-003 | T-PRV-001 | ci/artifacts/privacy_assessment_report.xml |
| FEAT-004 | T-DSAR-001 | ci/artifacts/dsar_flow_report.xml |
| FEAT-005 | T-AI-001 | ci/artifacts/ai_query_report.xml |

## Test Data Management Rules

| Rule ID | Rule |
|---|---|
| TDM-001 | Synthetic data SHALL be used in non-production environments. |
| TDM-002 | Production snapshots SHALL be masked before test use. |

## Executable Examples

### Gherkin
```gherkin
Feature: Incident triage
  Scenario: Analyst triages incident
    Given authenticated analyst in leaks workspace
    When analyst sets incident priority to high
    Then incident state SHALL become TRIAGED
```

### Sample Unit Test
```ts
it('shall reject unauthorized workspace access', () => {
  expect(canAccess('ROLE-SEC-ANALYST','privacy')).toBe(false);
});
```

### Sample Integration Test
```ts
it('shall persist incident and emit event', async () => {
  const res = await api.post('/incidents/ingest', payload);
  expect(res.status).toBe(200);
  expect(await eventSeen('incident.created')).toBe(true);
});
```

### Sample Contract Test
```ts
it('response SHALL match error schema', async () => {
  const res = await api.post('/auth/login', badPayload);
  expect(validateErrorSchema(res.body)).toBe(true);
});
```
