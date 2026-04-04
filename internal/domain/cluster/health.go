package cluster

import "time"

type HealthStatus string

const (
	HealthStatusHealthy   HealthStatus = "healthy"
	HealthStatusDegraded  HealthStatus = "degraded"
	HealthStatusUnhealthy HealthStatus = "unhealthy"
	HealthStatusUnknown   HealthStatus = "unknown"
)

type Health struct {
	Status      HealthStatus
	CheckedAt   time.Time
	Components  []ComponentHealth
	NodeSummary NodeSummary
	PodSummary  PodSummary
}

type ComponentHealth struct {
	Name    string
	Status  HealthStatus
	Message string
}

type NodeSummary struct {
	Total    int
	Ready    int
	NotReady int
}

type PodSummary struct {
	Total     int
	Running   int
	Pending   int
	Failed    int
	Succeeded int
}

func NewHealth() *Health {
	return &Health{
		Status:     HealthStatusUnknown,
		CheckedAt:  time.Now(),
		Components: make([]ComponentHealth, 0),
	}
}

func (h *Health) CalculateStatus() {
	if h.NodeSummary.NotReady > 0 {
		h.Status = HealthStatusDegraded
		if h.NodeSummary.NotReady >= h.NodeSummary.Total/2 {
			h.Status = HealthStatusUnhealthy
		}
		return
	}

	hasUnhealthy := false
	hasDegraded := false
	for _, c := range h.Components {
		if c.Status == HealthStatusUnhealthy {
			hasUnhealthy = true
		}
		if c.Status == HealthStatusDegraded {
			hasDegraded = true
		}
	}

	if hasUnhealthy {
		h.Status = HealthStatusUnhealthy
		return
	}

	if hasDegraded {
		h.Status = HealthStatusDegraded
		return
	}

	h.Status = HealthStatusHealthy
}

func (h *Health) AddComponent(name string, status HealthStatus, message string) {
	h.Components = append(h.Components, ComponentHealth{
		Name:    name,
		Status:  status,
		Message: message,
	})
}
