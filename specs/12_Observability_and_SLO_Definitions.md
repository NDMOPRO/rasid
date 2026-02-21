# SEC-OBS

## Structured Log Schema

```json
{"type":"object","required":["timestamp","level","service","message","traceId"],"properties":{"timestamp":{"type":"string","format":"date-time"},"level":{"enum":["DEBUG","INFO","WARN","ERROR"]},"service":{"type":"string"},"message":{"type":"string"},"traceId":{"type":"string"},"spanId":{"type":"string"},"actorId":{"type":"string"},"workspace":{"type":"string"}}}
```

## Metric Schema

| metric_name | type | labels |
|---|---|---|
| http_request_duration_ms | histogram | service,route,method,status |
| http_requests_total | counter | service,route,status |
| event_consumer_lag | gauge | topic,consumer_group |
| db_connection_usage_ratio | gauge | service,cluster |
| queue_depth | gauge | queue_name |

## Trace Correlation Rules

| Rule ID | Rule |
|---|---|
| TRC-001 | gateway SHALL generate traceId for missing inbound traces. |
| TRC-002 | all service calls SHALL propagate traceparent header. |
| TRC-003 | event envelope SHALL include traceId from originating request. |

## SLI/SLO Table

| SLI | Definition | SLO |
|---|---|---|
| availability | successful requests / total requests | 99.9% monthly |
| latency | p95 request latency | <=300ms reads, <=500ms writes |
| error rate | 5xx / total | <=0.5% |
| saturation | cpu or queue utilization | <=80% p95 |

## Error Budget Policy

| Rule ID | Rule |
|---|---|
| EB-001 | Monthly error budget = 0.1% unavailable minutes. |
| EB-002 | Budget burn >50% mid-cycle SHALL freeze feature releases. |

## Alert Rules

| alert | threshold | routing | escalation |
|---|---|---|---|
| HighErrorRate | 5xx >1% for 5m | oncall-sre | page after 5m, manager after 15m |
| LatencySLOBreach | p95 >500ms for 10m | oncall-service | page after 10m |
| EventLag | lag >1000 for 5m | oncall-data | ticket + page |
| AuthFailuresSpike | AUTH-401 > baseline x3 | sec-oncall | immediate page |
