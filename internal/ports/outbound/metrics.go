package outbound

import (
	"context"

	"github.com/tonymora/celia/internal/domain/observability"
)

type MetricsPort interface {
	IsAvailable(ctx context.Context) bool

	GetNodeMetrics(ctx context.Context) ([]observability.NodeMetrics, error)
	GetNodeMetric(ctx context.Context, nodeName string) (*observability.NodeMetrics, error)

	GetPodMetrics(ctx context.Context, namespace string) ([]observability.PodMetrics, error)
	GetPodMetric(ctx context.Context, namespace, podName string) (*observability.PodMetrics, error)

	GetNamespaceMetrics(ctx context.Context, namespace string) (*observability.NamespaceMetrics, error)
	GetClusterMetrics(ctx context.Context) (*observability.ClusterMetrics, error)

	GetMetricSnapshot(ctx context.Context) (*observability.MetricSnapshot, error)
}
