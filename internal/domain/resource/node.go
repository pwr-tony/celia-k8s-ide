package resource

import "time"

type Node struct {
	Resource

	PodCIDR       string
	PodCIDRs      []string
	Unschedulable bool
	Taints        []Taint

	Phase      NodePhase
	Conditions []NodeCondition
	Addresses  []NodeAddress
	Capacity   NodeResources
	Allocatable NodeResources

	KubeletVersion          string
	ContainerRuntimeVersion string
	OSImage                 string
	Architecture            string
	KernelVersion           string
}

type NodePhase string

const (
	NodePhasePending    NodePhase = "Pending"
	NodePhaseRunning    NodePhase = "Running"
	NodePhaseTerminated NodePhase = "Terminated"
)

type NodeCondition struct {
	Type               string
	Status             string
	LastHeartbeatTime  time.Time
	LastTransitionTime time.Time
	Reason             string
	Message            string
}

type NodeAddress struct {
	Type    string
	Address string
}

type NodeResources struct {
	CPU              string
	Memory           string
	Pods             string
	EphemeralStorage string
}

type Taint struct {
	Key    string
	Value  string
	Effect string
}

func (n *Node) IsReady() bool {
	for _, cond := range n.Conditions {
		if cond.Type == "Ready" {
			return cond.Status == "True"
		}
	}
	return false
}

func (n *Node) HasCondition(condType string) bool {
	for _, cond := range n.Conditions {
		if cond.Type == condType && cond.Status == "True" {
			return true
		}
	}
	return false
}

func (n *Node) HasMemoryPressure() bool {
	return n.HasCondition("MemoryPressure")
}

func (n *Node) HasDiskPressure() bool {
	return n.HasCondition("DiskPressure")
}

func (n *Node) HasPIDPressure() bool {
	return n.HasCondition("PIDPressure")
}

func (n *Node) GetCondition(condType string) *NodeCondition {
	for i := range n.Conditions {
		if n.Conditions[i].Type == condType {
			return &n.Conditions[i]
		}
	}
	return nil
}

func (n *Node) GetInternalIP() string {
	for _, addr := range n.Addresses {
		if addr.Type == "InternalIP" {
			return addr.Address
		}
	}
	return ""
}

func (n *Node) GetExternalIP() string {
	for _, addr := range n.Addresses {
		if addr.Type == "ExternalIP" {
			return addr.Address
		}
	}
	return ""
}

func (n *Node) GetHostname() string {
	for _, addr := range n.Addresses {
		if addr.Type == "Hostname" {
			return addr.Address
		}
	}
	return n.Name
}

func (n *Node) IsSchedulable() bool {
	return !n.Unschedulable && n.IsReady()
}

func (n *Node) GetTaintEffect(key string) string {
	for _, t := range n.Taints {
		if t.Key == key {
			return t.Effect
		}
	}
	return ""
}
