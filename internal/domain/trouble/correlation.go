package trouble

type Correlation struct {
	SourceProblemID string
	TargetProblemID string
	Relation        CorrelationRelation
	Confidence      float64 
	Description     string
}

type CorrelationRelation string

const (
	CorrelationRelationSameOwner    CorrelationRelation = "same-owner"  
	CorrelationRelationOwns         CorrelationRelation = "owns"  
	CorrelationRelationOwnedBy      CorrelationRelation = "owned-by" 

	CorrelationRelationCauses       CorrelationRelation = "causes" 
	CorrelationRelationCausedBy     CorrelationRelation = "caused-by"  

	CorrelationRelationSameNode     CorrelationRelation = "same-node"
	CorrelationRelationSameNamespace CorrelationRelation = "same-namespace"

	CorrelationRelationDependsOn    CorrelationRelation = "depends-on" 
	CorrelationRelationDependedBy   CorrelationRelation = "depended-by" 
)

func (r CorrelationRelation) String() string {
	return string(r)
}

func (c *Correlation) IsHighConfidence() bool {
	return c.Confidence >= 0.8
}

func (c *Correlation) IsMediumConfidence() bool {
	return c.Confidence >= 0.5 && c.Confidence < 0.8
}

type CorrelationGraph struct {
	Problems     map[string]*Problem 
	Correlations map[string][]Correlation
}

func NewCorrelationGraph() *CorrelationGraph {
	return &CorrelationGraph{
		Problems:     make(map[string]*Problem),
		Correlations: make(map[string][]Correlation),
	}
}

func (g *CorrelationGraph) AddProblem(problem *Problem) {
	g.Problems[problem.ID] = problem
}

func (g *CorrelationGraph) AddCorrelation(correlation Correlation) {
	g.Correlations[correlation.SourceProblemID] = append(
		g.Correlations[correlation.SourceProblemID],
		correlation,
	)
}

func (g *CorrelationGraph) GetCorrelations(problemID string) []Correlation {
	return g.Correlations[problemID]
}

func (g *CorrelationGraph) GetRelatedProblems(problemID string) []*Problem {
	var related []*Problem
	seen := make(map[string]bool)
	seen[problemID] = true

	for _, corr := range g.Correlations[problemID] {
		if !seen[corr.TargetProblemID] {
			if p, ok := g.Problems[corr.TargetProblemID]; ok {
				related = append(related, p)
				seen[corr.TargetProblemID] = true
			}
		}
	}

	return related
}

func (g *CorrelationGraph) FindRootCauses() []*Problem {
	causedBy := make(map[string]bool)

	for _, correlations := range g.Correlations {
		for _, corr := range correlations {
			if corr.Relation == CorrelationRelationCauses {
				causedBy[corr.TargetProblemID] = true
			}
		}
	}

	var roots []*Problem
	for id, problem := range g.Problems {
		if !causedBy[id] {
			for _, corr := range g.Correlations[id] {
				if corr.Relation == CorrelationRelationCauses {
					roots = append(roots, problem)
					break
				}
			}
		}
	}

	return roots
}
