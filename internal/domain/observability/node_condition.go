package observability

import "time"

type NodeStatus struct {
	Name             string
	Ready            bool
	MemoryPressure   bool
	DiskPressure     bool
	PIDPressure      bool
	NetworkReady     bool
	ContainerRuntime string
	KubeletVersion   string
	LastHeartbeat    time.Time
	Conditions       []NodeConditionDetail
	Capacity         NodeCapacity
	Allocatable      NodeCapacity
	Usage            NodeUsage
}

type NodeConditionDetail struct {
	Type               string
	Status             string
	LastTransitionTime time.Time
	LastHeartbeatTime  time.Time
	Reason             string
	Message            string
}

type NodeCapacity struct {
	CPU              int64
	Memory           int64
	Pods             int64
	EphemeralStorage int64
}

type NodeUsage struct {
	CPU    int64
	Memory int64
	Pods   int64
}

func (n *NodeStatus) IsHealthy() bool {
	return n.Ready && !n.MemoryPressure && !n.DiskPressure && !n.PIDPressure
}

func (n *NodeStatus) HealthScore() int {
	score := 100

	if !n.Ready {
		score -= 50
	}
	if n.MemoryPressure {
		score -= 20
	}
	if n.DiskPressure {
		score -= 20
	}
	if n.PIDPressure {
		score -= 10
	}

	if score < 0 {
		score = 0
	}

	return score
}

func (n *NodeStatus) CPUUsagePercent() float64 {
	if n.Allocatable.CPU == 0 {
		return 0
	}
	return float64(n.Usage.CPU) / float64(n.Allocatable.CPU) * 100
}

func (n *NodeStatus) MemoryUsagePercent() float64 {
	if n.Allocatable.Memory == 0 {
		return 0
	}
	return float64(n.Usage.Memory) / float64(n.Allocatable.Memory) * 100
}

func (n *NodeStatus) PodUsagePercent() float64 {
	if n.Allocatable.Pods == 0 {
		return 0
	}
	return float64(n.Usage.Pods) / float64(n.Allocatable.Pods) * 100
}

func (n *NodeStatus) GetCondition(condType string) *NodeConditionDetail {
	for i := range n.Conditions {
		if n.Conditions[i].Type == condType {
			return &n.Conditions[i]
		}
	}
	return nil
}
