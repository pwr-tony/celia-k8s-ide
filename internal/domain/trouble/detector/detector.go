package detector

import (
	"time"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type Detector interface {
	Name() string
	Enabled() bool
	Detect(input DetectorInput) []trouble.Problem
}

type DetectorInput struct {
	Pods        []resource.Pod
	Deployments []resource.Deployment
	Nodes       []resource.Node
	Events      []resource.Event
	Timestamp   time.Time
}

type BaseDetector struct {
	name    string
	enabled bool
}

func (d *BaseDetector) Name() string {
	return d.name
}

func (d *BaseDetector) Enabled() bool {
	return d.enabled
}

func (d *BaseDetector) SetEnabled(enabled bool) {
	d.enabled = enabled
}

type Registry struct {
	detectors map[string]Detector
}

func NewRegistry() *Registry {
	return &Registry{
		detectors: make(map[string]Detector),
	}
}

func (r *Registry) Register(detector Detector) {
	r.detectors[detector.Name()] = detector
}

func (r *Registry) Get(name string) (Detector, bool) {
	d, ok := r.detectors[name]
	return d, ok
}

func (r *Registry) List() []Detector {
	detectors := make([]Detector, 0, len(r.detectors))
	for _, d := range r.detectors {
		detectors = append(detectors, d)
	}
	return detectors
}

func (r *Registry) EnabledDetectors() []Detector {
	var enabled []Detector
	for _, d := range r.detectors {
		if d.Enabled() {
			enabled = append(enabled, d)
		}
	}
	return enabled
}

func (r *Registry) DetectAll(input DetectorInput) []trouble.Problem {
	var allProblems []trouble.Problem

	for _, detector := range r.EnabledDetectors() {
		problems := detector.Detect(input)
		allProblems = append(allProblems, problems...)
	}

	return allProblems
}

func DefaultRegistry() *Registry {
	registry := NewRegistry()

	registry.Register(NewCrashLoopDetector())
	registry.Register(NewImagePullDetector())
	registry.Register(NewOOMKilledDetector())
	registry.Register(NewPendingDetector())
	registry.Register(NewProbeFailingDetector())
	registry.Register(NewNodeNotReadyDetector())
	registry.Register(NewNodePressureDetector())
	registry.Register(NewHighRestartDetector())

	return registry
}
