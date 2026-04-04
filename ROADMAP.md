# Celia Roadmap

## Phase 0: Foundation (Current)

- [x] Project structure with hexagonal architecture
- [x] Go backend with client-go integration
- [x] REST API server on port 9119
- [x] Kubeconfig context management
- [x] Namespace listing and switching
- [x] Cluster health check
- [x] Resource listing: Pods, Deployments, Services, ConfigMaps, Secrets, Nodes
- [x] Resource YAML viewer
- [x] Pod log streaming
- [x] Event listing
- [x] 8 problem detectors
- [x] Problem ranking by severity
- [x] Basic diagnosis for resources
- [x] File-based audit logging
- [x] Makefile with build targets

## Phase 1: Resource Explorer MVP

- [ ] React + TypeScript frontend setup
- [ ] Tauri shell for desktop packaging
- [ ] Resource detail views with all fields
- [ ] Namespace selector dropdown
- [ ] Context switcher in UI
- [ ] Sortable/filterable resource tables
- [ ] Secret masking with reveal toggle
- [ ] YAML syntax highlighting
- [ ] Copy YAML to clipboard
- [ ] Resource search/filter

## Phase 2: Observability Core

- [ ] WebSocket for real-time updates
- [ ] Log viewer with virtual scrolling
- [ ] Log filtering by text search
- [ ] Log highlighting (errors, warnings)
- [ ] Multi-container log tabs
- [ ] Event timeline visualization
- [ ] Metrics-server integration
- [ ] Node metrics dashboard (CPU, memory, pods)
- [ ] Pod metrics in detail view
- [ ] Namespace resource usage

## Phase 3: Troubleshooting Engine

- [ ] "Top Problems" dashboard panel
- [ ] Problem detail view with full context
- [ ] Problem → Resource navigation
- [ ] Event correlation with problems
- [ ] Pod → Deployment → ReplicaSet correlation
- [ ] Real-time problem detection via WebSocket
- [ ] Problem history and resolution tracking
- [ ] Custom severity thresholds
- [ ] Problem notifications

## Phase 4: Operations

- [ ] Scale deployment dialog
- [ ] Rollout restart with confirmation
- [ ] Delete pod with grace period option
- [ ] Edit YAML and apply (like kubectl edit)
- [ ] Confirmation dialogs for destructive actions
- [ ] Undo recent operations (where possible)
- [ ] Audit log viewer in UI
- [ ] Export audit log

## Phase 5: Polish & UX

- [ ] Keyboard shortcuts (vim-style navigation)
- [ ] Global search (Cmd+K)
- [ ] Dark/light theme
- [ ] Loading states and skeletons
- [ ] Empty states with helpful messages
- [ ] Error boundaries and recovery
- [ ] Virtualized lists for 1000+ items
- [ ] Responsive layout
- [ ] Fedora RPM packaging

## Phase 6: Advanced Features

- [ ] Custom problem detectors (YAML-based rules)
- [ ] Prometheus metrics integration
- [ ] Terminal/exec to pods (xterm.js)
- [ ] PVC/PV explorer
- [ ] Multi-container log comparison
- [ ] Export problems report (PDF/HTML)
- [ ] Desktop notifications for critical problems
- [ ] Multi-cluster aggregation
- [ ] Saved views and filters
- [ ] Resource diff viewer

## Future Ideas

- Helm release management
- ArgoCD integration
- GitOps workflow support
- AI-assisted diagnosis
- Runbook automation
- Incident timeline
- Team annotations on resources
- Slack/Teams notifications
- Custom dashboards
- Plugin system for extensions
