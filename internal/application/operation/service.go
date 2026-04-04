package operation

import (
	"context"
	"fmt"
	"sync"

	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/domain/audit"
	"github.com/tonymora/celia/internal/domain/operation"
	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/ports/outbound"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	k8sAdapter *kubernetes.Adapter
	auditStore outbound.AuditStorePort
	log        *logger.Logger
	actions    map[string]*operation.Action
	history    []operation.Action
	mu         sync.RWMutex
}

func NewService(k8sAdapter *kubernetes.Adapter, log *logger.Logger) *Service {
	return &Service{
		k8sAdapter: k8sAdapter,
		log:        log.WithComponent("operation-service"),
		actions:    make(map[string]*operation.Action),
		history:    make([]operation.Action, 0),
	}
}

func (s *Service) SetAuditStore(auditStore outbound.AuditStorePort) {
	s.auditStore = auditStore
}

func (s *Service) ScaleDeployment(ctx context.Context, namespace, name string, replicas int32) (*operation.ActionResult, error) {
	s.log.Info("Scaling deployment", "namespace", namespace, "name", name, "replicas", replicas)

	action := operation.NewAction(operation.ActionTypeScale, "Deployment", namespace, name)
	action.SetParameter("replicas", replicas)

	beforeYAML, _ := s.k8sAdapter.GetResourceYAML(ctx, resource.KindDeployment, namespace, name)

	action.Start()
	err := s.k8sAdapter.ScaleDeployment(ctx, namespace, name, replicas)

	var result *operation.ActionResult
	if err != nil {
		action.Fail(err.Error())
		result = operation.NewFailureResult(action.ID, err)
	} else {
		action.Complete(fmt.Sprintf("Scaled deployment %s to %d replicas", name, replicas))
		result = operation.NewSuccessResult(action.ID, action.Message)
	}

	result.WithBeforeState(beforeYAML)

	if err == nil {
		afterYAML, _ := s.k8sAdapter.GetResourceYAML(ctx, resource.KindDeployment, namespace, name)
		result.WithAfterState(afterYAML)
	}

	s.recordAction(*action)

	s.auditAction(ctx, action, result)

	return result, err
}

func (s *Service) RolloutRestart(ctx context.Context, kind, namespace, name string) (*operation.ActionResult, error) {
	s.log.Info("Rolling out restart", "kind", kind, "namespace", namespace, "name", name)

	resourceKind, ok := resource.ParseKind(kind)
	if !ok {
		return nil, fmt.Errorf("unsupported resource kind: %s", kind)
	}

	action := operation.NewAction(operation.ActionTypeRolloutRestart, kind, namespace, name)

	action.Start()
	err := s.k8sAdapter.RolloutRestart(ctx, resourceKind, namespace, name)

	var result *operation.ActionResult
	if err != nil {
		action.Fail(err.Error())
		result = operation.NewFailureResult(action.ID, err)
	} else {
		action.Complete(fmt.Sprintf("Rollout restart initiated for %s/%s", kind, name))
		result = operation.NewSuccessResult(action.ID, action.Message)
	}

	s.recordAction(*action)

	s.auditAction(ctx, action, result)

	return result, err
}

func (s *Service) DeletePod(ctx context.Context, namespace, name string, gracePeriod *int64) (*operation.ActionResult, error) {
	s.log.Info("Deleting pod", "namespace", namespace, "name", name)

	action := operation.NewAction(operation.ActionTypeDelete, "Pod", namespace, name)
	if gracePeriod != nil {
		action.SetParameter("gracePeriod", *gracePeriod)
	}

	beforeYAML, _ := s.k8sAdapter.GetResourceYAML(ctx, resource.KindPod, namespace, name)

	action.Start()
	err := s.k8sAdapter.DeletePod(ctx, namespace, name, gracePeriod)

	var result *operation.ActionResult
	if err != nil {
		action.Fail(err.Error())
		result = operation.NewFailureResult(action.ID, err)
	} else {
		action.Complete(fmt.Sprintf("Deleted pod %s/%s", namespace, name))
		result = operation.NewSuccessResult(action.ID, action.Message)
	}

	result.WithBeforeState(beforeYAML)

	s.recordAction(*action)

	s.auditAction(ctx, action, result)

	return result, err
}

func (s *Service) UpdateResource(ctx context.Context, kind, namespace, name string, yaml string) (*operation.ActionResult, error) {
	s.log.Info("Updating resource", "kind", kind, "namespace", namespace, "name", name)

	resourceKind, ok := resource.ParseKind(kind)
	if !ok {
		return nil, fmt.Errorf("unsupported resource kind: %s", kind)
	}

	action := operation.NewAction(operation.ActionTypeUpdate, kind, namespace, name)

	beforeYAML, _ := s.k8sAdapter.GetResourceYAML(ctx, resourceKind, namespace, name)

	action.Start()
	err := s.k8sAdapter.UpdateResource(ctx, resourceKind, namespace, name, yaml)

	var result *operation.ActionResult
	if err != nil {
		action.Fail(err.Error())
		result = operation.NewFailureResult(action.ID, err)
	} else {
		action.Complete(fmt.Sprintf("Updated %s/%s", kind, name))
		result = operation.NewSuccessResult(action.ID, action.Message)
	}

	result.WithBeforeState(beforeYAML)
	result.WithAfterState(yaml)

	s.recordAction(*action)

	s.auditAction(ctx, action, result)

	return result, err
}

func (s *Service) GetPendingActions(ctx context.Context) ([]operation.Action, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var pending []operation.Action
	for _, a := range s.actions {
		if a.IsPending() || a.IsRunning() {
			pending = append(pending, *a)
		}
	}

	return pending, nil
}

func (s *Service) GetActionHistory(ctx context.Context, limit int) ([]operation.Action, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.history) {
		limit = len(s.history)
	}

	result := make([]operation.Action, limit)
	start := len(s.history) - limit
	for i := 0; i < limit; i++ {
		result[i] = s.history[start+limit-1-i]
	}

	return result, nil
}

func (s *Service) CancelAction(ctx context.Context, actionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	action, ok := s.actions[actionID]
	if !ok {
		return fmt.Errorf("action not found: %s", actionID)
	}

	if !action.IsPending() {
		return fmt.Errorf("action cannot be cancelled: %s", action.Status)
	}

	action.Cancel()
	return nil
}

func (s *Service) recordAction(action operation.Action) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.history = append(s.history, action)

	if len(s.history) > 100 {
		s.history = s.history[len(s.history)-100:]
	}
}

func (s *Service) PurgePods(ctx context.Context, namespace string, states []string) (*PurgePodsResult, error) {
	s.log.Info("Purging pods", "namespace", namespace, "states", states)

	if len(states) == 0 {
		states = []string{"Evicted", "Error", "Completed", "OOMKilled", "ContainerStatusUnknown", "Terminating"}
	}

	ns := namespace
	if ns == "" {
		ns = "all namespaces"
	}

	action := operation.NewAction(operation.ActionTypeDelete, "Pod", namespace, "purge")
	action.SetParameter("states", states)
	action.Start()

	results, err := s.k8sAdapter.PurgePods(ctx, namespace, states)

	purgeResult := &PurgePodsResult{
		ActionID:     action.ID,
		Namespace:    ns,
		States:       states,
		DeletedPods:  make([]PurgedPod, 0),
		FailedPods:   make([]PurgedPod, 0),
		TotalDeleted: 0,
		TotalFailed:  0,
	}

	if err != nil {
		action.Fail(err.Error())
		return nil, err
	}

	for _, r := range results {
		pod := PurgedPod{
			Namespace: r.Namespace,
			Name:      r.Name,
			Reason:    r.Reason,
		}
		if r.Deleted {
			purgeResult.DeletedPods = append(purgeResult.DeletedPods, pod)
			purgeResult.TotalDeleted++
		} else {
			pod.Error = r.Error
			purgeResult.FailedPods = append(purgeResult.FailedPods, pod)
			purgeResult.TotalFailed++
		}
	}

	action.Complete(fmt.Sprintf("Purged %d pods (%d failed)", purgeResult.TotalDeleted, purgeResult.TotalFailed))
	s.recordAction(*action)

	return purgeResult, nil
}

type PurgePodsResult struct {
	ActionID     string
	Namespace    string
	States       []string
	DeletedPods  []PurgedPod
	FailedPods   []PurgedPod
	TotalDeleted int
	TotalFailed  int
}

type PurgedPod struct {
	Namespace string
	Name      string
	Reason    string
	Error     string
}

func (s *Service) auditAction(ctx context.Context, action *operation.Action, result *operation.ActionResult) {
	if s.auditStore == nil {
		return
	}
	
	currentContext, _ := s.k8sAdapter.GetCurrentContext()
	clusterName := ""
	if currentContext != nil {
		clusterName = currentContext.Name
	}

	entry := audit.NewEntry(clusterName, action.Type, action.Namespace, action.ResourceKind, action.ResourceName)
	entry.SetBefore(result.BeforeState)
	entry.SetAfter(result.AfterState)

	if result.Success {
		entry.SetSuccess()
	} else {
		entry.SetError(result.Error)
	}

	if err := s.auditStore.Append(ctx, *entry); err != nil {
		s.log.Error("Failed to write audit entry", "error", err)
	}
}
