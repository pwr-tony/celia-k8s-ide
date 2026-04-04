package trouble

import (
	"context"
	"sort"
	"sync"
	"time"

	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
	"github.com/tonymora/celia/internal/domain/trouble/detector"
	"github.com/tonymora/celia/internal/ports/inbound"
	"github.com/tonymora/celia/pkg/config"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	k8sAdapter  *kubernetes.Adapter
	log         *logger.Logger
	config      config.TroubleConfig
	registry    *detector.Registry
	problems    map[string]*trouble.Problem
	subscribers []chan trouble.ProblemUpdate
	mu          sync.RWMutex
}

func NewService(k8sAdapter *kubernetes.Adapter, log *logger.Logger, cfg config.TroubleConfig) *Service {
	s := &Service{
		k8sAdapter:  k8sAdapter,
		log:         log.WithComponent("trouble-service"),
		config:      cfg,
		registry:    detector.DefaultRegistry(),
		problems:    make(map[string]*trouble.Problem),
		subscribers: make([]chan trouble.ProblemUpdate, 0),
	}

	return s
}

func (s *Service) StartDetection(ctx context.Context) {
	s.log.Info("Starting trouble detection", "interval", s.config.DetectionInterval)

	ticker := time.NewTicker(s.config.DetectionInterval)
	defer ticker.Stop()

	s.runDetection(ctx)

	for {
		select {
		case <-ctx.Done():
			s.log.Info("Stopping trouble detection")
			return
		case <-ticker.C:
			s.runDetection(ctx)
		}
	}
}

func (s *Service) runDetection(ctx context.Context) {
	if !s.k8sAdapter.IsConnected() {
		return
	}

	s.log.Debug("Running trouble detection")

	input, err := s.gatherInput(ctx)
	if err != nil {
		s.log.Error("Failed to gather detection input", "error", err)
		return
	}

	detectedProblems := s.registry.DetectAll(*input)

	s.updateProblems(detectedProblems)
}

func (s *Service) gatherInput(ctx context.Context) (*detector.DetectorInput, error) {
	input := &detector.DetectorInput{
		Timestamp: time.Now(),
	}

	pods, err := s.k8sAdapter.ListPods(ctx, "")
	if err != nil {
		return nil, err
	}
	input.Pods = pods

	deployments, err := s.k8sAdapter.ListDeployments(ctx, "")
	if err != nil {
		s.log.Warn("Failed to list deployments", "error", err)
	} else {
		input.Deployments = deployments
	}

	nodes, err := s.k8sAdapter.ListNodes(ctx)
	if err != nil {
		s.log.Warn("Failed to list nodes", "error", err)
	} else {
		input.Nodes = nodes
	}

	events, err := s.k8sAdapter.ListEvents(ctx, "")
	if err != nil {
		s.log.Warn("Failed to list events", "error", err)
	} else {
		input.Events = events
	}

	return input, nil
}

func (s *Service) updateProblems(detected []trouble.Problem) {
	s.mu.Lock()
	defer s.mu.Unlock()

	seen := make(map[string]bool)

	for i := range detected {
		p := &detected[i]
		seen[p.ID] = true

		if existing, ok := s.problems[p.ID]; ok {
			existing.Update()
			s.notifySubscribers(trouble.ProblemUpdate{
				Type:    trouble.ProblemUpdateTypeModified,
				Problem: *existing,
			})
		} else {
			s.problems[p.ID] = p
			s.notifySubscribers(trouble.ProblemUpdate{
				Type:    trouble.ProblemUpdateTypeAdded,
				Problem: *p,
			})
		}
	}

	staleThreshold := s.config.DetectionInterval * 3
	for id, p := range s.problems {
		if !seen[id] && p.TimeSinceLastSeen() > staleThreshold {
			s.notifySubscribers(trouble.ProblemUpdate{
				Type:    trouble.ProblemUpdateTypeResolved,
				Problem: *p,
			})
			delete(s.problems, id)
		}
	}
}

func (s *Service) notifySubscribers(update trouble.ProblemUpdate) {
	for _, ch := range s.subscribers {
		select {
		case ch <- update:
		default:
		}
	}
}

func (s *Service) GetProblems(ctx context.Context) ([]trouble.Problem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	problems := make([]trouble.Problem, 0, len(s.problems))
	for _, p := range s.problems {
		problems = append(problems, *p)
	}

	sort.Slice(problems, func(i, j int) bool {
		return problems[i].Score() > problems[j].Score()
	})

	return problems, nil
}

func (s *Service) GetProblemsByNamespace(ctx context.Context, namespace string) ([]trouble.Problem, error) {
	all, err := s.GetProblems(ctx)
	if err != nil {
		return nil, err
	}

	var filtered []trouble.Problem
	for _, p := range all {
		if p.Namespace == namespace {
			filtered = append(filtered, p)
		}
	}

	return filtered, nil
}

func (s *Service) GetProblemsByNode(ctx context.Context, nodeName string) ([]trouble.Problem, error) {
	all, err := s.GetProblems(ctx)
	if err != nil {
		return nil, err
	}

	var filtered []trouble.Problem
	for _, p := range all {
		if p.AffectedNode == nodeName || p.ResourceName == nodeName {
			filtered = append(filtered, p)
		}
	}

	return filtered, nil
}

func (s *Service) GetProblemsByType(ctx context.Context, problemType trouble.ProblemType) ([]trouble.Problem, error) {
	all, err := s.GetProblems(ctx)
	if err != nil {
		return nil, err
	}

	var filtered []trouble.Problem
	for _, p := range all {
		if p.Type == problemType {
			filtered = append(filtered, p)
		}
	}

	return filtered, nil
}

func (s *Service) GetDiagnosis(ctx context.Context, kind, namespace, name string) (*trouble.Diagnosis, error) {
	diagnosis := trouble.NewDiagnosis(kind, namespace, name)

	all, err := s.GetProblems(ctx)
	if err != nil {
		return nil, err
	}

	for _, p := range all {
		if p.ResourceKind == kind && p.Namespace == namespace && p.ResourceName == name {
			diagnosis.AddProblem(p)
		}
	}

	events, err := s.k8sAdapter.ListEventsForResource(ctx, kind, namespace, name)
	if err == nil {
		for _, event := range events {
			severity := trouble.SeverityLow
			if event.IsWarning() {
				severity = trouble.SeverityMedium
			}
			diagnosis.AddTimelineEntry(trouble.TimelineEntry{
				Timestamp:   event.LastTimestamp,
				Type:        "event",
				Title:       event.Reason,
				Description: event.Message,
				Severity:    severity,
			})
		}
	}

	for _, p := range diagnosis.Problems {
		for _, suggestion := range p.Suggestions {
			diagnosis.AddRecommendation(trouble.Recommendation{
				Title:       suggestion,
				Description: suggestion,
				Priority:    int(p.Severity),
			})
		}
	}

	return diagnosis, nil
}

func (s *Service) GetCorrelations(ctx context.Context, problemID string) ([]trouble.Correlation, error) {
	s.mu.RLock()
	problem, ok := s.problems[problemID]
	s.mu.RUnlock()

	if !ok {
		return nil, nil
	}

	var correlations []trouble.Correlation

	if problem.AffectedNode != "" {
		nodeProblems, _ := s.GetProblemsByNode(ctx, problem.AffectedNode)
		for _, p := range nodeProblems {
			if p.ID != problemID {
				correlations = append(correlations, trouble.Correlation{
					SourceProblemID: problemID,
					TargetProblemID: p.ID,
					Relation:        trouble.CorrelationRelationSameNode,
					Confidence:      0.7,
					Description:     "Both problems affect the same node",
				})
			}
		}
	}

	if problem.Namespace != "" {
		nsProblems, _ := s.GetProblemsByNamespace(ctx, problem.Namespace)
		for _, p := range nsProblems {
			if p.ID != problemID {
				correlations = append(correlations, trouble.Correlation{
					SourceProblemID: problemID,
					TargetProblemID: p.ID,
					Relation:        trouble.CorrelationRelationSameNamespace,
					Confidence:      0.5,
					Description:     "Both problems are in the same namespace",
				})
			}
		}
	}

	return correlations, nil
}

func (s *Service) Subscribe(ctx context.Context) (<-chan trouble.ProblemUpdate, error) {
	ch := make(chan trouble.ProblemUpdate, 100)

	s.mu.Lock()
	s.subscribers = append(s.subscribers, ch)
	s.mu.Unlock()

	go func() {
		<-ctx.Done()
		s.mu.Lock()
		for i, sub := range s.subscribers {
			if sub == ch {
				s.subscribers = append(s.subscribers[:i], s.subscribers[i+1:]...)
				break
			}
		}
		s.mu.Unlock()
		close(ch)
	}()

	return ch, nil
}

func (s *Service) GetProblemStats(ctx context.Context) (*inbound.ProblemStats, error) {
	problems, err := s.GetProblems(ctx)
	if err != nil {
		return nil, err
	}

	stats := &inbound.ProblemStats{
		Total:  len(problems),
		ByType: make(map[trouble.ProblemType]int),
	}

	for _, p := range problems {
		switch p.Severity {
		case trouble.SeverityCritical:
			stats.Critical++
		case trouble.SeverityHigh:
			stats.High++
		case trouble.SeverityMedium:
			stats.Medium++
		case trouble.SeverityLow:
			stats.Low++
		}
		stats.ByType[p.Type]++
	}

	return stats, nil
}

func (s *Service) ForceDetection(ctx context.Context) error {
	s.runDetection(ctx)
	return nil
}

var _ = []resource.Pod{}
