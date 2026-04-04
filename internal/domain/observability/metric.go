package observability

import "time"

type PodMetrics struct {
	Namespace  string
	Name       string
	Containers []ContainerMetrics
	Timestamp  time.Time
}

type ContainerMetrics struct {
	Name        string
	CPUCores    float64 
	MemoryBytes int64 
}

func (p *PodMetrics) TotalCPU() float64 {
	var total float64
	for _, c := range p.Containers {
		total += c.CPUCores
	}
	return total
}

func (p *PodMetrics) TotalMemory() int64 {
	var total int64
	for _, c := range p.Containers {
		total += c.MemoryBytes
	}
	return total
}

type NodeMetrics struct {
	Name           string
	CPUCores       float64
	CPUCapacity    float64
	MemoryBytes    int64
	MemoryCapacity int64
	Timestamp      time.Time
}

func (n *NodeMetrics) CPUPercent() float64 {
	if n.CPUCapacity == 0 {
		return 0
	}
	return (n.CPUCores / n.CPUCapacity) * 100
}

func (n *NodeMetrics) MemoryPercent() float64 {
	if n.MemoryCapacity == 0 {
		return 0
	}
	return (float64(n.MemoryBytes) / float64(n.MemoryCapacity)) * 100
}

type NamespaceMetrics struct {
	Namespace   string
	PodCount    int
	CPUCores    float64
	MemoryBytes int64
	Timestamp   time.Time
}

type ClusterMetrics struct {
	NodeCount      int
	PodCount       int
	CPUCores       float64
	CPUCapacity    float64
	MemoryBytes    int64
	MemoryCapacity int64
	Timestamp      time.Time
}

func (c *ClusterMetrics) CPUPercent() float64 {
	if c.CPUCapacity == 0 {
		return 0
	}
	return (c.CPUCores / c.CPUCapacity) * 100
}

func (c *ClusterMetrics) MemoryPercent() float64 {
	if c.MemoryCapacity == 0 {
		return 0
	}
	return (float64(c.MemoryBytes) / float64(c.MemoryCapacity)) * 100
}
