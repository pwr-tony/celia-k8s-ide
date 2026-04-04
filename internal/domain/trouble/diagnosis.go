package trouble

import "time"

type Diagnosis struct {
	ResourceKind string
	Namespace    string
	ResourceName string

	Status      DiagnosisStatus
	Summary     string
	DiagnosedAt time.Time

	Problems []Problem

	RelatedResources []RelatedResource
	Timeline         []TimelineEntry

	Recommendations []Recommendation
}

type DiagnosisStatus string

const (
	DiagnosisStatusHealthy  DiagnosisStatus = "Healthy"
	DiagnosisStatusWarning  DiagnosisStatus = "Warning"
	DiagnosisStatusCritical DiagnosisStatus = "Critical"
	DiagnosisStatusUnknown  DiagnosisStatus = "Unknown"
)

type RelatedResource struct {
	Kind       string
	Namespace  string
	Name       string
	Relation   string 
	Status     string
	HasProblem bool
}

type TimelineEntry struct {
	Timestamp   time.Time
	Type        string
	Title       string
	Description string
	Severity    Severity
}

type Recommendation struct {
	Title       string
	Description string
	Action      string 
	Priority    int
	Automated   bool 
}

func NewDiagnosis(kind, namespace, name string) *Diagnosis {
	return &Diagnosis{
		ResourceKind:     kind,
		Namespace:        namespace,
		ResourceName:     name,
		Status:           DiagnosisStatusUnknown,
		DiagnosedAt:      time.Now(),
		Problems:         make([]Problem, 0),
		RelatedResources: make([]RelatedResource, 0),
		Timeline:         make([]TimelineEntry, 0),
		Recommendations:  make([]Recommendation, 0),
	}
}

func (d *Diagnosis) AddProblem(problem Problem) {
	d.Problems = append(d.Problems, problem)
	d.updateStatus()
}

func (d *Diagnosis) AddRelatedResource(resource RelatedResource) {
	d.RelatedResources = append(d.RelatedResources, resource)
}

func (d *Diagnosis) AddTimelineEntry(entry TimelineEntry) {
	d.Timeline = append(d.Timeline, entry)
}

func (d *Diagnosis) AddRecommendation(rec Recommendation) {
	d.Recommendations = append(d.Recommendations, rec)
}

func (d *Diagnosis) updateStatus() {
	if len(d.Problems) == 0 {
		d.Status = DiagnosisStatusHealthy
		d.Summary = "No problems detected"
		return
	}

	maxSeverity := SeverityLow
	for _, p := range d.Problems {
		if p.Severity > maxSeverity {
			maxSeverity = p.Severity
		}
	}

	switch {
	case maxSeverity >= SeverityCritical:
		d.Status = DiagnosisStatusCritical
		d.Summary = "Critical issues require immediate attention"
	case maxSeverity >= SeverityHigh:
		d.Status = DiagnosisStatusCritical
		d.Summary = "High severity issues detected"
	case maxSeverity >= SeverityMedium:
		d.Status = DiagnosisStatusWarning
		d.Summary = "Issues detected that may need attention"
	default:
		d.Status = DiagnosisStatusWarning
		d.Summary = "Minor issues detected"
	}
}

func (d *Diagnosis) HasProblems() bool {
	return len(d.Problems) > 0
}

func (d *Diagnosis) HighestSeverity() Severity {
	maxSeverity := SeverityLow
	for _, p := range d.Problems {
		if p.Severity > maxSeverity {
			maxSeverity = p.Severity
		}
	}
	return maxSeverity
}
