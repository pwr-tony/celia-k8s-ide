# Celia

Kubernetes Operations IDE for SREs and Platform Engineers.

## Overview

Celia is a desktop application that provides visual troubleshooting and operational capabilities for Kubernetes clusters. It automatically detects common problems and provides actionable diagnosis.

## Features

### Current (Phase 0)

- Connect to any kubeconfig context
- List and switch namespaces
- Cluster health overview
- Browse resources: Pods, Deployments, Services, ConfigMaps, Secrets, Nodes
- View resource YAML
- Stream pod logs
- List and filter events
- Automatic problem detection:
  - CrashLoopBackOff
  - ImagePullBackOff
  - OOMKilled
  - Pending pods
  - Failing probes
  - Node NotReady
  - Node pressure (memory, disk, PID)
  - High restart count
- Problem ranking by severity
- Resource diagnosis

### Planned

See [ROADMAP.md](./ROADMAP.md) for detailed feature plans.

## Requirements

- Go 1.21+
- Access to a Kubernetes cluster via kubeconfig

## Quick Start

```bash
# Build
make build

# Run
./build/celia-server

# Or build and run
make run
```

The server starts on `http://127.0.0.1:9119`

## API

### Cluster Management

```bash
# List available contexts
curl http://localhost:9119/api/v1/contexts

# Connect to a context
curl -X POST http://localhost:9119/api/v1/clusters/connect \
  -H "Content-Type: application/json" \
  -d '{"context_name": "my-cluster"}'

# List namespaces
curl http://localhost:9119/api/v1/clusters/namespaces

# Get cluster health
curl http://localhost:9119/api/v1/clusters/health
```

### Resources

```bash
# List pods
curl http://localhost:9119/api/v1/pods?namespace=default

# Get pod details
curl http://localhost:9119/api/v1/pods/default/my-pod

# List deployments
curl http://localhost:9119/api/v1/deployments

# Get resource YAML
curl http://localhost:9119/api/v1/resources/Deployment/default/nginx/yaml
```

### Observability

```bash
# Get pod logs
curl http://localhost:9119/api/v1/logs/default/my-pod?tail=100

# List events
curl http://localhost:9119/api/v1/events?namespace=default
```

### Troubleshooting

```bash
# Get all detected problems
curl http://localhost:9119/api/v1/problems

# Get problem statistics
curl http://localhost:9119/api/v1/problems/stats

# Get diagnosis for a resource
curl http://localhost:9119/api/v1/diagnosis/Pod/default/my-pod
```

## Configuration

Configuration file: `~/.celia/config.yaml` or `./configs/default.yaml`

```yaml
server:
  host: "127.0.0.1"
  port: 9119

kubernetes:
  kubeconfig: ""  # Uses default ~/.kube/config
  default_namespace: "default"

trouble:
  enabled: true
  detection_interval: 10s
  detectors:
    - crashloop
    - imagepull
    - oomkilled
    - pending
    - probe_failing
    - node_notready
    - node_pressure
    - high_restart

audit:
  enabled: true
  directory: "~/.celia/audit"
```

## Architecture

Celia follows Hexagonal Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP REST API                           │
│                    (Primary Adapter)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Application Services                        │
│         (Cluster, Resource, Observability, Trouble)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Domain Layer                             │
│    (Entities, Value Objects, Problem Detectors)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Secondary Adapters                          │
│         (Kubernetes client-go, Metrics, Audit)              │
└─────────────────────────────────────────────────────────────┘
```

## Development

```bash
# Build
make build

# Run tests
make test

# Run linter
make lint

# Format code
make fmt
```

## License

MIT
