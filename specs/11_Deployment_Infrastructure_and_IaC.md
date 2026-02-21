# SEC-DEP

## Deterministic Pseudo-IaC

```hcl
module "network" { cidr = "10.40.0.0/16" private_subnets = ["10.40.1.0/24","10.40.2.0/24"] }
module "k8s" { node_pools = { app = 3, worker = 3 } multi_az = true }
module "postgres" { engine = "postgres15" multi_az = true storage_gb = 500 encrypted = true }
module "redis" { engine = "redis7" replica_count = 1 encrypted = true }
module "observability" { prometheus = true loki = true tempo = true }
```

## Environment Topology

| Env | Purpose | Regions |
|---|---|---|
| dev | developer validation | 1 |
| staging | pre-prod verification | 1 |
| prod | customer traffic | 2 active-passive |

## Network Segmentation Rules

| Rule ID | Rule |
|---|---|
| NET-001 | Public subnet SHALL contain load balancer only. |
| NET-002 | Application and data tiers SHALL remain private. |
| NET-003 | DB security group SHALL allow ingress from app SG only. |

## Container and Image Build Rules

| Rule ID | Rule |
|---|---|
| IMG-001 | Images SHALL be built from pinned digest base images. |
| IMG-002 | Images SHALL be scanned and signed before deploy. |
| IMG-003 | Runtime containers SHALL run as non-root UID. |

## Artifact Versioning and Signing

| Artifact | Version Rule | Signing Rule |
|---|---|---|
| container image | SemVer + git sha | cosign keyless REQUIRED |
| helm chart | SemVer | provenance signature REQUIRED |
| DB migration bundle | sequential migration ID | checksum REQUIRED |

## Deployment Strategy and Gates

| Stage | Gate |
|---|---|
| canary 5% | SLO and error budget pass for 15 min |
| canary 25% | no Sev1 incidents for 30 min |
| full 100% | stakeholder approval and automated checks pass |

## Rollback Decision Tree

| Condition | Action |
|---|---|
| error_rate > 2% for 5 min | immediate traffic shift to previous version |
| p95_latency > 2x baseline for 10 min | rollback and freeze release |
| migration failure | restore DB snapshot and rollback app |

## Disaster Recovery

| Metric | Requirement |
|---|---|
| RTO | <= 60 minutes |
| RPO | <= 15 minutes |

| Procedure | Deterministic Steps |
|---|---|
| backup | hourly WAL + daily full snapshot |
| restore | provision standby, restore snapshot, replay WAL, run checksum verification |
| validation | execute smoke tests and data consistency query suite |
