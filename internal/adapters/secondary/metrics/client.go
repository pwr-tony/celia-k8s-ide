package metrics

import (
	"context"
	"fmt"
	"time"

	"github.com/tonymora/celia/internal/domain/observability"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
	metricsv1beta1 "k8s.io/metrics/pkg/apis/metrics/v1beta1"
	metricsclient "k8s.io/metrics/pkg/client/clientset/versioned"
)

type Adapter struct {
	metricsClient metricsclient.Interface
	available     bool
}

func NewAdapter(restConfig *rest.Config) (*Adapter, error) {
	if restConfig == nil {
		return &Adapter{available: false}, nil
	}

	metricsClient, err := metricsclient.NewForConfig(restConfig)
	if err != nil {
		return &Adapter{available: false}, nil
	}

	return &Adapter{
		metricsClient: metricsClient,
		available:     true,
	}, nil
}

func (a *Adapter) IsAvailable(ctx context.Context) bool {
	if !a.available || a.metricsClient == nil {
		return false
	}

	_, err := a.metricsClient.MetricsV1beta1().NodeMetricses().List(ctx, metav1.ListOptions{Limit: 1})
	return err == nil
}

func (a *Adapter) GetNodeMetrics(ctx context.Context) ([]observability.NodeMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	nodeMetrics, err := a.metricsClient.MetricsV1beta1().NodeMetricses().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get node metrics: %w", err)
	}

	result := make([]observability.NodeMetrics, len(nodeMetrics.Items))
	for i, nm := range nodeMetrics.Items {
		result[i] = mapNodeMetrics(&nm)
	}

	return result, nil
}

func (a *Adapter) GetNodeMetric(ctx context.Context, nodeName string) (*observability.NodeMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	nodeMetrics, err := a.metricsClient.MetricsV1beta1().NodeMetricses().Get(ctx, nodeName, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get node metrics: %w", err)
	}

	result := mapNodeMetrics(nodeMetrics)
	return &result, nil
}

func (a *Adapter) GetPodMetrics(ctx context.Context, namespace string) ([]observability.PodMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	podMetrics, err := a.metricsClient.MetricsV1beta1().PodMetricses(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get pod metrics: %w", err)
	}

	result := make([]observability.PodMetrics, len(podMetrics.Items))
	for i, pm := range podMetrics.Items {
		result[i] = mapPodMetrics(&pm)
	}

	return result, nil
}

func (a *Adapter) GetPodMetric(ctx context.Context, namespace, podName string) (*observability.PodMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	podMetrics, err := a.metricsClient.MetricsV1beta1().PodMetricses(namespace).Get(ctx, podName, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get pod metrics: %w", err)
	}

	result := mapPodMetrics(podMetrics)
	return &result, nil
}

func (a *Adapter) GetNamespaceMetrics(ctx context.Context, namespace string) (*observability.NamespaceMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	podMetrics, err := a.GetPodMetrics(ctx, namespace)
	if err != nil {
		return nil, err
	}

	result := &observability.NamespaceMetrics{
		Namespace: namespace,
		PodCount:  len(podMetrics),
		Timestamp: time.Now(),
	}

	for _, pm := range podMetrics {
		result.CPUCores += pm.TotalCPU()
		result.MemoryBytes += pm.TotalMemory()
	}

	return result, nil
}

func (a *Adapter) GetClusterMetrics(ctx context.Context) (*observability.ClusterMetrics, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	nodeMetrics, err := a.GetNodeMetrics(ctx)
	if err != nil {
		return nil, err
	}

	result := &observability.ClusterMetrics{
		NodeCount: len(nodeMetrics),
		Timestamp: time.Now(),
	}

	for _, nm := range nodeMetrics {
		result.CPUCores += nm.CPUCores
		result.CPUCapacity += nm.CPUCapacity
		result.MemoryBytes += nm.MemoryBytes
		result.MemoryCapacity += nm.MemoryCapacity
	}

	podMetrics, err := a.metricsClient.MetricsV1beta1().PodMetricses("").List(ctx, metav1.ListOptions{})
	if err == nil {
		result.PodCount = len(podMetrics.Items)
	}

	return result, nil
}

func (a *Adapter) GetMetricSnapshot(ctx context.Context) (*observability.MetricSnapshot, error) {
	if !a.available {
		return nil, fmt.Errorf("metrics not available")
	}

	snapshot := observability.NewMetricSnapshot()

	nodeMetrics, err := a.GetNodeMetrics(ctx)
	if err != nil {
		return nil, err
	}
	snapshot.Nodes = nodeMetrics

	clusterMetrics, err := a.GetClusterMetrics(ctx)
	if err != nil {
		return nil, err
	}
	snapshot.Cluster = *clusterMetrics

	return snapshot, nil
}

func mapNodeMetrics(nm *metricsv1beta1.NodeMetrics) observability.NodeMetrics {
	return observability.NodeMetrics{
		Name:        nm.Name,
		CPUCores:    float64(nm.Usage.Cpu().MilliValue()) / 1000.0,
		MemoryBytes: nm.Usage.Memory().Value(),
		Timestamp:   nm.Timestamp.Time,
	}
}

func mapPodMetrics(pm *metricsv1beta1.PodMetrics) observability.PodMetrics {
	result := observability.PodMetrics{
		Namespace: pm.Namespace,
		Name:      pm.Name,
		Timestamp: pm.Timestamp.Time,
	}

	for _, cm := range pm.Containers {
		result.Containers = append(result.Containers, observability.ContainerMetrics{
			Name:        cm.Name,
			CPUCores:    float64(cm.Usage.Cpu().MilliValue()) / 1000.0,
			MemoryBytes: cm.Usage.Memory().Value(),
		})
	}

	return result
}
