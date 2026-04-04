package inbound

import (
	"context"
	"io"

	"github.com/tonymora/celia/internal/domain/observability"
	"github.com/tonymora/celia/internal/domain/resource"
)

type ObservabilityPort interface {
	GetLogs(ctx context.Context, namespace, pod, container string, opts LogOptions) (io.ReadCloser, error)
	StreamLogs(ctx context.Context, namespace, pod, container string, opts LogOptions) (<-chan observability.LogEntry, error)

	ListEvents(ctx context.Context, namespace string) ([]resource.Event, error)
	ListEventsForResource(ctx context.Context, kind, namespace, name string) ([]resource.Event, error)
	WatchEvents(ctx context.Context, namespace string) (<-chan resource.Event, error)

	IsMetricsAvailable(ctx context.Context) bool
	GetNodeMetrics(ctx context.Context) ([]observability.NodeMetrics, error)
	GetPodMetrics(ctx context.Context, namespace string) ([]observability.PodMetrics, error)
	GetClusterMetrics(ctx context.Context) (*observability.ClusterMetrics, error)
	GetMetricSnapshot(ctx context.Context) (*observability.MetricSnapshot, error)

	GetNodeStatus(ctx context.Context, nodeName string) (*observability.NodeStatus, error)
	ListNodeStatuses(ctx context.Context) ([]observability.NodeStatus, error)
}

type LogOptions struct {
	Follow     bool
	TailLines  int64
	Since      string
	Timestamps bool
	Previous   bool
}

func DefaultLogOptions() LogOptions {
	return LogOptions{
		TailLines:  100,
		Timestamps: true,
	}
}
