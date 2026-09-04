# Celia Roadmap

## Phase 0: Foundation ✅ COMPLETE

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

## Phase 1: Resource Explorer MVP ✅ COMPLETE

- [x] React 19 + TypeScript (strict) frontend with Vite
- [x] TanStack Query for server state, Zustand for UI state
- [x] Zod schema validation for all API responses
- [x] Resource detail views with tabs (Overview, Events, YAML)
- [x] Namespace selector dropdown in sidebar
- [x] Context switcher with connection status
- [x] Sortable/filterable resource tables (TanStack Table)
- [x] Virtualized lists for large datasets (TanStack Virtual)
- [x] Secret masking with reveal toggle per key
- [x] YAML syntax highlighting (Monaco Editor)
- [x] Copy YAML to clipboard
- [x] Resource search/filter in tables
- [x] Tauri shell for desktop packaging (RPM/DEB)

## Phase 2: Observability Core ✅ COMPLETE

- [x] WebSocket infrastructure with auto-reconnect
- [x] Log viewer with container selector
- [x] Tail lines selector (50, 100, 500, 1000)
- [x] Download logs as file
- [x] Auto-refresh logs (5s interval)
- [x] Event list per resource
- [x] Log text search/filtering
- [x] Log highlighting by level (error, warning, info)
- [x] Event timeline visualization
- [x] Metrics-server integration
- [x] Node metrics dashboard (CPU, memory)
- [x] Pod metrics in detail view
- [ ] Namespace resource usage (deferred to Phase 6)

## Phase 3: Troubleshooting Engine ✅ COMPLETE

- [x] "Top Problems" dashboard panel (top 10)
- [x] Problem severity color coding (critical/high/medium/low)
- [x] Problem type badges
- [x] Related events in problem schema
- [x] Auto-refresh problems (10s interval)
- [x] Dedicated problem detail view (modal with causes & suggestions)
- [x] Problem → Resource navigation (click to resource)
- [x] Real-time problem updates via WebSocket
- [x] Pod → Deployment → ReplicaSet correlation view
- [x] Problem history and resolution tracking
- [x] Custom severity thresholds configuration
- [x] Problem notifications (in-app)

## Phase 4: Operations ✅ COMPLETE

- [x] Scale deployment (API hook ready)
- [x] Rollout restart (API hook ready)
- [x] Delete pod (API hook ready)
- [x] Purge failed pods (API hook ready)
- [x] Action history hook
- [x] Operation confirmation dialogs with details
- [x] Grace period option for delete
- [x] Edit YAML and apply (kubectl edit style)
- [x] Audit log viewer in UI
- [x] Export audit log
- [x] Undo recent operations (where possible)

## Phase 5: Polish & UX (80% Complete)

- [x] Dark/light/system theme (persisted)
- [x] Sidebar collapse state (persisted)
- [x] Virtualized lists for 1000+ items
- [x] Keyboard shortcuts (vim-style navigation)
- [x] Global search (Cmd+K)
- [x] Loading states and skeletons
- [x] Empty states with helpful messages
- [x] Error boundaries and recovery
- [ ] Responsive layout
- [ ] Fedora RPM packaging

## Phase 6: Advanced Features

- [ ] Custom problem detectors (YAML-based rules)
- [ ] Prometheus metrics integration
- [ ] Terminal/exec to pods (xterm.js)
- [ ] PVC/PV explorer
- [ ] Ingress explorer
- [ ] Multi-container log comparison (side-by-side)
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
