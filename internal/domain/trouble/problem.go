package trouble

import (
	"crypto/sha256"
	"fmt"
	"time"
)

type Problem struct {
	ID          string
	Type        ProblemType
	Severity    Severity
	Title       string
	Description string

	ResourceKind string
	Namespace    string
	ResourceName string

	DetectedAt time.Time
	LastSeenAt time.Time
	Count      int

	RelatedEvents []string
	RelatedPods   []string
	AffectedNode  string

	PossibleCauses []string
	Suggestions    []string
}

func NewProblem(problemType ProblemType, resourceKind, namespace, resourceName string) *Problem {
	now := time.Now()
	return &Problem{
		ID:             generateProblemID(problemType, resourceKind, namespace, resourceName),
		Type:           problemType,
		Severity:       problemType.DefaultSeverity(),
		Title:          fmt.Sprintf("%s: %s", problemType.String(), resourceName),
		Description:    problemType.Description(),
		ResourceKind:   resourceKind,
		Namespace:      namespace,
		ResourceName:   resourceName,
		DetectedAt:     now,
		LastSeenAt:     now,
		Count:          1,
		RelatedEvents:  make([]string, 0),
		RelatedPods:    make([]string, 0),
		PossibleCauses: make([]string, 0),
		Suggestions:    make([]string, 0),
	}
}

func generateProblemID(problemType ProblemType, resourceKind, namespace, resourceName string) string {
	input := fmt.Sprintf("%s:%s:%s:%s", problemType, resourceKind, namespace, resourceName)
	hash := sha256.Sum256([]byte(input))
	return fmt.Sprintf("%x", hash[:8])
}

func (p *Problem) Update() {
	p.LastSeenAt = time.Now()
	p.Count++
}

func (p *Problem) AddRelatedEvent(eventUID string) {
	for _, uid := range p.RelatedEvents {
		if uid == eventUID {
			return
		}
	}
	p.RelatedEvents = append(p.RelatedEvents, eventUID)
}

func (p *Problem) AddRelatedPod(podName string) {
	for _, name := range p.RelatedPods {
		if name == podName {
			return
		}
	}
	p.RelatedPods = append(p.RelatedPods, podName)
}

func (p *Problem) AddCause(cause string) {
	p.PossibleCauses = append(p.PossibleCauses, cause)
}

func (p *Problem) AddSuggestion(suggestion string) {
	p.Suggestions = append(p.Suggestions, suggestion)
}

func (p *Problem) SetSeverity(severity Severity) {
	p.Severity = severity
}

func (p *Problem) SetTitle(title string) {
	p.Title = title
}

func (p *Problem) SetDescription(description string) {
	p.Description = description
}

func (p *Problem) Age() time.Duration {
	return time.Since(p.DetectedAt)
}

func (p *Problem) TimeSinceLastSeen() time.Duration {
	return time.Since(p.LastSeenAt)
}

func (p *Problem) IsRecent(threshold time.Duration) bool {
	return p.TimeSinceLastSeen() < threshold
}

func (p *Problem) ResourceKey() string {
	if p.Namespace != "" {
		return fmt.Sprintf("%s/%s/%s", p.Namespace, p.ResourceKind, p.ResourceName)
	}
	return fmt.Sprintf("%s/%s", p.ResourceKind, p.ResourceName)
}

func (p *Problem) Score() float64 {
	score := float64(p.Severity) * 100

	if p.IsRecent(5 * time.Minute) {
		score += 50
	}

	if p.Count > 10 {
		score += 30
	} else if p.Count > 5 {
		score += 20
	} else if p.Count > 1 {
		score += 10
	}

	return score
}

type ProblemUpdate struct {
	Type    ProblemUpdateType
	Problem Problem
}

type ProblemUpdateType string

const (
	ProblemUpdateTypeAdded    ProblemUpdateType = "ADDED"
	ProblemUpdateTypeModified ProblemUpdateType = "MODIFIED"
	ProblemUpdateTypeResolved ProblemUpdateType = "RESOLVED"
)
