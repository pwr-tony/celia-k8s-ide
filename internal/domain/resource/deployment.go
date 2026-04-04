package resource

import "time"

type Deployment struct {
	Resource

	Replicas        int32
	Selector        map[string]string
	Strategy        DeploymentStrategy
	MinReadySeconds int32

	ReadyReplicas     int32
	AvailableReplicas int32
	UpdatedReplicas   int32
	UnavailableReplicas int32
	ObservedGeneration int64

	Conditions []DeploymentCondition
}

type DeploymentStrategy struct {
	Type          string
	MaxUnavailable string
	MaxSurge      string
}

type DeploymentCondition struct {
	Type               string
	Status             string
	LastTransitionTime time.Time
	LastUpdateTime     time.Time
	Reason             string
	Message            string
}

func (d *Deployment) IsHealthy() bool {
	return d.ReadyReplicas == d.Replicas && d.AvailableReplicas == d.Replicas
}

func (d *Deployment) IsProgressing() bool {
	cond := d.GetCondition("Progressing")
	return cond != nil && cond.Status == "True"
}

func (d *Deployment) IsAvailable() bool {
	cond := d.GetCondition("Available")
	return cond != nil && cond.Status == "True"
}

func (d *Deployment) GetCondition(condType string) *DeploymentCondition {
	for i := range d.Conditions {
		if d.Conditions[i].Type == condType {
			return &d.Conditions[i]
		}
	}
	return nil
}

func (d *Deployment) AvailabilityRatio() float64 {
	if d.Replicas == 0 {
		return 1.0
	}
	return float64(d.AvailableReplicas) / float64(d.Replicas)
}

func (d *Deployment) ReadinessRatio() float64 {
	if d.Replicas == 0 {
		return 1.0
	}
	return float64(d.ReadyReplicas) / float64(d.Replicas)
}

func (d *Deployment) HasUnavailableReplicas() bool {
	return d.UnavailableReplicas > 0
}
