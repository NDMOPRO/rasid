# SEC-PERF

## Performance Limits

| API/Service | Limit |
|---|---|
| /auth/login | p95 <= 250ms, 500 RPS |
| /incidents/ingest | p95 <= 400ms, 1000 RPS |
| /privacy/assessments | p95 <= 500ms, 200 RPS |
| /privacy/dsar | p95 <= 600ms, 100 RPS |
| /ai/query | p95 <= 2000ms, 150 RPS |

## Concurrency Model

| Component | Model |
|---|---|
| api-gateway | async non-blocking IO |
| services | stateless request handlers with DB pool |
| workers | queue-driven fixed concurrency pools |

## Load Profiles

| Profile | RPS | Mix |
|---|---|---|
| normal | 400 | 50% read,30% write,20% AI |
| peak | 1200 | 45% read,35% write,20% AI |
| incident-spike | 2000 | 20% read,60% ingest,20% notify |

## Autoscaling Triggers and Cooldowns

| Resource | Scale-Out Trigger | Scale-In Trigger | Cooldown |
|---|---|---|---|
| api pods | cpu>65% 5m OR rps/pod>80 | cpu<40% 10m | 300s |
| worker pods | queue_depth>500 3m | queue_depth<100 10m | 600s |

## Backpressure Rules

| Rule ID | Rule |
|---|---|
| PERF-BP-001 | gateway SHALL return 429 when upstream queue depth > 2000. |
| PERF-BP-002 | worker SHALL pause lower-priority jobs when DSAR SLA jobs pending. |

## Capacity Planning Formula

| Formula ID | Inputs | Output |
|---|---|---|
| CAP-001 | peak_rps, avg_latency_ms, target_utilization | required_pods = ceil((peak_rps*avg_latency_ms/1000)/target_utilization) |
| CAP-002 | daily_events, retention_days, bytes_per_event | storage_bytes = daily_events*retention_days*bytes_per_event |

## Cache Policies

| Cache Key | TTL | Invalidation |
|---|---|---|
| permissions:userId | 5m | role change event |
| incident:list:filters | 1m | incident state change event |
| ai:query:hash | 15m | source data update event |

## Rate Limiting Strategies

| Scope | Algorithm | Threshold |
|---|---|---|
| user | token bucket | 60 req/min default |
| org | sliding window | 3000 req/min |
| source ingest | leaky bucket | 200 events/sec/source |
