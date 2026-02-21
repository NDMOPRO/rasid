# SEC-AI

## Algorithm Registry

| Algorithm ID | Type | Purpose |
|---|---|---|
| ALG-001 | Retrieval + rule-based tool orchestration | Workspace-aware answer generation |
| ALG-002 | Severity scoring rules engine | Incident severity normalization |

## Input and Output Schemas

| Algorithm | Input Schema Ref | Output Schema Ref |
|---|---|---|
| ALG-001 | FEAT-005 input | FEAT-005 output |
| ALG-002 | incident payload schema | normalized severity schema |

## Deterministic Inference Workflow

| Step | ALG-001 Action |
|---|---|
| 1 | Validate workspace claim and query schema. |
| 2 | Resolve allowed tool list from role and workspace matrix. |
| 3 | Execute tools sequentially by priority table with timeout controls. |
| 4 | Assemble response template and citations. |
| 5 | Assign confidence score formula: `matched_sources/required_sources`. |

## Threshold Decision Table

| Condition | Decision |
|---|---|
| confidence >= 0.8 | response quality=`high` |
| 0.5 <= confidence < 0.8 | response quality=`medium` |
| confidence < 0.5 | response quality=`low` and degraded flag=true |

## Fallback Behavior

| Trigger | Fallback |
|---|---|
| tool timeout | return deterministic degraded response with missing-tools list |
| upstream unavailable | return cached response if cache age <= 15m |
| no sources | return denial response `AI-204-NOSOURCE` |

## Monitoring Metrics

| Metric | Type | Threshold |
|---|---|---|
| ai_query_success_ratio | gauge | >= 0.97 |
| ai_degraded_ratio | gauge | <= 0.05 |
| citation_coverage_ratio | gauge | >= 0.90 |
| workspace_misroute_count | counter | = 0 |

## Versioning and Rollback

| Rule ID | Rule |
|---|---|
| AI-VER-001 | model/workflow version SHALL be explicit in response metadata. |
| AI-VER-002 | rollout SHALL be canary 5%,25%,100% with automated quality gates. |
| AI-VER-003 | rollback SHALL trigger if degraded ratio > 0.1 for 10 minutes. |
