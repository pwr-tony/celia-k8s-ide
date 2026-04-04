package resource

import "time"

type PodPhase string

const (
	PodPhasePending   PodPhase = "Pending"
	PodPhaseRunning   PodPhase = "Running"
	PodPhaseSucceeded PodPhase = "Succeeded"
	PodPhaseFailed    PodPhase = "Failed"
	PodPhaseUnknown   PodPhase = "Unknown"
)

type Pod struct {
	Resource

	Phase         PodPhase
	PodIP         string
	NodeName      string
	HostIP        string
	QOSClass      string
	RestartPolicy string

	Containers     []Container
	InitContainers []Container

	Conditions []PodCondition

	RestartCount int32

	StartTime *time.Time
}

type Container struct {
	Name         string
	Image        string
	Ready        bool
	Started      bool
	RestartCount int32
	State        ContainerState
	LastState    ContainerState
	Resources    ContainerResources
}

type ContainerState struct {
	Type       ContainerStateType
	Reason     string
	Message    string
	StartedAt  *time.Time
	FinishedAt *time.Time
	ExitCode   int32
}

type ContainerStateType string

const (
	ContainerStateWaiting    ContainerStateType = "Waiting"
	ContainerStateRunning    ContainerStateType = "Running"
	ContainerStateTerminated ContainerStateType = "Terminated"
)

type ContainerResources struct {
	CPURequest    string
	CPULimit      string
	MemoryRequest string
	MemoryLimit   string
}

type PodCondition struct {
	Type               string
	Status             string
	LastTransitionTime time.Time
	Reason             string
	Message            string
}

func (p *Pod) IsHealthy() bool {
	if p.Phase != PodPhaseRunning {
		return false
	}

	for _, c := range p.Containers {
		if !c.Ready {
			return false
		}
	}

	return true
}

func (p *Pod) IsPending() bool {
	return p.Phase == PodPhasePending
}

func (p *Pod) IsFailed() bool {
	return p.Phase == PodPhaseFailed
}

func (p *Pod) IsCompleted() bool {
	return p.Phase == PodPhaseSucceeded
}

func (p *Pod) HasCrashLoopBackOff() bool {
	for _, c := range p.Containers {
		if c.State.Type == ContainerStateWaiting && c.State.Reason == "CrashLoopBackOff" {
			return true
		}
	}
	return false
}

func (p *Pod) HasImagePullBackOff() bool {
	for _, c := range p.Containers {
		if c.State.Type == ContainerStateWaiting {
			if c.State.Reason == "ImagePullBackOff" || c.State.Reason == "ErrImagePull" {
				return true
			}
		}
	}
	return false
}

func (p *Pod) HasOOMKilled() bool {
	for _, c := range p.Containers {
		if c.LastState.Type == ContainerStateTerminated && c.LastState.Reason == "OOMKilled" {
			return true
		}
		if c.State.Type == ContainerStateTerminated && c.State.Reason == "OOMKilled" {
			return true
		}
	}
	return false
}

func (p *Pod) GetContainerByName(name string) *Container {
	for i := range p.Containers {
		if p.Containers[i].Name == name {
			return &p.Containers[i]
		}
	}
	return nil
}

func (p *Pod) GetContainerNames() []string {
	names := make([]string, len(p.Containers))
	for i, c := range p.Containers {
		names[i] = c.Name
	}
	return names
}

func (p *Pod) GetCondition(condType string) *PodCondition {
	for i := range p.Conditions {
		if p.Conditions[i].Type == condType {
			return &p.Conditions[i]
		}
	}
	return nil
}

func (p *Pod) IsScheduled() bool {
	cond := p.GetCondition("PodScheduled")
	return cond != nil && cond.Status == "True"
}

func (p *Pod) RunningTime() time.Duration {
	if p.StartTime == nil {
		return 0
	}
	return time.Since(*p.StartTime)
}
