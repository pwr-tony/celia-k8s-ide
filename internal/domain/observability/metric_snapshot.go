package observability

import "time"

type MetricSnapshot struct {
	Timestamp    time.Time
	Cluster      ClusterMetrics
	Nodes        []NodeMetrics
	Namespaces   []NamespaceMetrics
	TopPodsByCPU []PodMetrics
	TopPodsByMem []PodMetrics
}

func NewMetricSnapshot() *MetricSnapshot {
	return &MetricSnapshot{
		Timestamp:    time.Now(),
		Nodes:        make([]NodeMetrics, 0),
		Namespaces:   make([]NamespaceMetrics, 0),
		TopPodsByCPU: make([]PodMetrics, 0),
		TopPodsByMem: make([]PodMetrics, 0),
	}
}

func (s *MetricSnapshot) GetNodeMetrics(nodeName string) *NodeMetrics {
	for i := range s.Nodes {
		if s.Nodes[i].Name == nodeName {
			return &s.Nodes[i]
		}
	}
	return nil
}

func (s *MetricSnapshot) GetNamespaceMetrics(namespace string) *NamespaceMetrics {
	for i := range s.Namespaces {
		if s.Namespaces[i].Namespace == namespace {
			return &s.Namespaces[i]
		}
	}
	return nil
}

func (s *MetricSnapshot) HealthyNodeCount() int {
	count := 0
	for _, node := range s.Nodes {
		if node.CPUPercent() < 80 && node.MemoryPercent() < 85 {
			count++
		}
	}
	return count
}

func (s *MetricSnapshot) OverloadedNodeCount() int {
	count := 0
	for _, node := range s.Nodes {
		if node.CPUPercent() > 90 || node.MemoryPercent() > 95 {
			count++
		}
	}
	return count
}
