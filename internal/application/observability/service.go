package observability

import (
	"bufio"
	"context"
	"io"
	"strings"
	"time"

	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/domain/observability"
	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/ports/outbound"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	k8sAdapter    *kubernetes.Adapter
	metricsPort   outbound.MetricsPort
	log           *logger.Logger
	streamManager *observability.LogStreamManager
}

func NewService(k8sAdapter *kubernetes.Adapter, log *logger.Logger) *Service {
	return &Service{
		k8sAdapter:    k8sAdapter,
		log:           log.WithComponent("observability-service"),
		streamManager: observability.NewLogStreamManager(),
	}
}

func (s *Service) SetMetricsPort(metricsPort outbound.MetricsPort) {
	s.metricsPort = metricsPort
}

func (s *Service) GetLogs(ctx context.Context, namespace, pod, container string, opts LogOptions) (io.ReadCloser, error) {
	s.log.Debug("Getting logs", "namespace", namespace, "pod", pod, "container", container)

	logOpts := outbound.LogOptions{
		Follow:     opts.Follow,
		TailLines:  opts.TailLines,
		Timestamps: opts.Timestamps,
		Previous:   opts.Previous,
	}

	if opts.Since != "" {
		duration, err := time.ParseDuration(opts.Since)
		if err == nil {
			logOpts.Since = duration
		}
	}

	return s.k8sAdapter.GetPodLogs(ctx, namespace, pod, container, logOpts)
}

func (s *Service) StreamLogs(ctx context.Context, namespace, pod, container string, opts LogOptions) (<-chan observability.LogEntry, error) {
	s.log.Debug("Streaming logs", "namespace", namespace, "pod", pod, "container", container)

	logOpts := outbound.LogOptions{
		Follow:     true,
		TailLines:  opts.TailLines,
		Timestamps: opts.Timestamps,
	}

	if opts.Since != "" {
		duration, err := time.ParseDuration(opts.Since)
		if err == nil {
			logOpts.Since = duration
		}
	}

	reader, err := s.k8sAdapter.GetPodLogs(ctx, namespace, pod, container, logOpts)
	if err != nil {
		return nil, err
	}

	entryChan := make(chan observability.LogEntry, 100)

	go func() {
		defer close(entryChan)
		defer reader.Close()

		scanner := bufio.NewScanner(reader)
		for scanner.Scan() {
			select {
			case <-ctx.Done():
				return
			default:
				line := scanner.Text()
				entry := parseLogLine(namespace, pod, container, line, opts.Timestamps)
				entryChan <- entry
			}
		}
	}()

	return entryChan, nil
}

func parseLogLine(namespace, pod, container, line string, hasTimestamp bool) observability.LogEntry {
	entry := observability.LogEntry{
		Namespace: namespace,
		Pod:       pod,
		Container: container,
		Stream:    "stdout",
	}

	if hasTimestamp {
		parts := strings.SplitN(line, " ", 2)
		if len(parts) == 2 {
			if ts, err := time.Parse(time.RFC3339Nano, parts[0]); err == nil {
				entry.Timestamp = ts
				entry.Message = parts[1]
			} else {
				entry.Timestamp = time.Now()
				entry.Message = line
			}
		} else {
			entry.Timestamp = time.Now()
			entry.Message = line
		}
	} else {
		entry.Timestamp = time.Now()
		entry.Message = line
	}

	return entry
}

func (s *Service) ListEvents(ctx context.Context, namespace string) ([]resource.Event, error) {
	return s.k8sAdapter.ListEvents(ctx, namespace)
}

func (s *Service) ListEventsForResource(ctx context.Context, kind, namespace, name string) ([]resource.Event, error) {
	return s.k8sAdapter.ListEventsForResource(ctx, kind, namespace, name)
}

func (s *Service) WatchEvents(ctx context.Context, namespace string) (<-chan resource.Event, error) {
	return s.k8sAdapter.WatchEvents(ctx, namespace)
}

func (s *Service) IsMetricsAvailable(ctx context.Context) bool {
	if s.metricsPort == nil {
		return false
	}
	return s.metricsPort.IsAvailable(ctx)
}

func (s *Service) GetNodeMetrics(ctx context.Context) ([]observability.NodeMetrics, error) {
	if s.metricsPort == nil {
		return nil, ErrMetricsUnavailable
	}
	return s.metricsPort.GetNodeMetrics(ctx)
}

func (s *Service) GetPodMetrics(ctx context.Context, namespace string) ([]observability.PodMetrics, error) {
	if s.metricsPort == nil {
		return nil, ErrMetricsUnavailable
	}
	return s.metricsPort.GetPodMetrics(ctx, namespace)
}

func (s *Service) GetClusterMetrics(ctx context.Context) (*observability.ClusterMetrics, error) {
	if s.metricsPort == nil {
		return nil, ErrMetricsUnavailable
	}
	return s.metricsPort.GetClusterMetrics(ctx)
}

func (s *Service) GetMetricSnapshot(ctx context.Context) (*observability.MetricSnapshot, error) {
	if s.metricsPort == nil {
		return nil, ErrMetricsUnavailable
	}
	return s.metricsPort.GetMetricSnapshot(ctx)
}

func (s *Service) GetNodeStatus(ctx context.Context, nodeName string) (*observability.NodeStatus, error) {
	node, err := s.k8sAdapter.GetNode(ctx, nodeName)
	if err != nil {
		return nil, err
	}

	status := &observability.NodeStatus{
		Name:             node.Name,
		Ready:            node.IsReady(),
		MemoryPressure:   node.HasMemoryPressure(),
		DiskPressure:     node.HasDiskPressure(),
		PIDPressure:      node.HasPIDPressure(),
		ContainerRuntime: node.ContainerRuntimeVersion,
		KubeletVersion:   node.KubeletVersion,
	}

	for _, cond := range node.Conditions {
		status.Conditions = append(status.Conditions, observability.NodeConditionDetail{
			Type:               cond.Type,
			Status:             cond.Status,
			LastTransitionTime: cond.LastTransitionTime,
			LastHeartbeatTime:  cond.LastHeartbeatTime,
			Reason:             cond.Reason,
			Message:            cond.Message,
		})

		if cond.Type == "Ready" {
			status.LastHeartbeat = cond.LastHeartbeatTime
		}
	}

	return status, nil
}

func (s *Service) ListNodeStatuses(ctx context.Context) ([]observability.NodeStatus, error) {
	nodes, err := s.k8sAdapter.ListNodes(ctx)
	if err != nil {
		return nil, err
	}

	statuses := make([]observability.NodeStatus, len(nodes))
	for i, node := range nodes {
		statuses[i] = observability.NodeStatus{
			Name:             node.Name,
			Ready:            node.IsReady(),
			MemoryPressure:   node.HasMemoryPressure(),
			DiskPressure:     node.HasDiskPressure(),
			PIDPressure:      node.HasPIDPressure(),
			ContainerRuntime: node.ContainerRuntimeVersion,
			KubeletVersion:   node.KubeletVersion,
		}
	}

	return statuses, nil
}

type LogOptions struct {
	Follow     bool
	TailLines  int64
	Since      string
	Timestamps bool
	Previous   bool
}

var (
	ErrMetricsUnavailable = &ObservabilityError{Message: "metrics not available"}
)

type ObservabilityError struct {
	Message string
}

func (e *ObservabilityError) Error() string {
	return e.Message
}
