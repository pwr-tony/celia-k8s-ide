package operation

import (
	"time"
)

type ActionStatus string

const (
	ActionStatusPending   ActionStatus = "pending"
	ActionStatusRunning   ActionStatus = "running"
	ActionStatusCompleted ActionStatus = "completed"
	ActionStatusFailed    ActionStatus = "failed"
	ActionStatusCancelled ActionStatus = "cancelled"
)

type Action struct {
	ID           string
	Type         ActionType
	Status       ActionStatus
	ResourceKind string
	Namespace    string
	ResourceName string

	Parameters    map[string]interface{}
	PreviousState map[string]interface{}

	CreatedAt   time.Time
	StartedAt   *time.Time
	CompletedAt *time.Time

	Message string
	Error   string

	RequestedBy string
	UndoneBy    string
}

func NewAction(actionType ActionType, resourceKind, namespace, resourceName string) *Action {
	return &Action{
		ID:            generateActionID(),
		Type:          actionType,
		Status:        ActionStatusPending,
		ResourceKind:  resourceKind,
		Namespace:     namespace,
		ResourceName:  resourceName,
		Parameters:    make(map[string]interface{}),
		PreviousState: make(map[string]interface{}),
		CreatedAt:     time.Now(),
	}
}

func generateActionID() string {
	return time.Now().Format("20060102150405.000")
}

func (a *Action) Start() {
	now := time.Now()
	a.StartedAt = &now
	a.Status = ActionStatusRunning
}

func (a *Action) Complete(message string) {
	now := time.Now()
	a.CompletedAt = &now
	a.Status = ActionStatusCompleted
	a.Message = message
}

func (a *Action) Fail(err string) {
	now := time.Now()
	a.CompletedAt = &now
	a.Status = ActionStatusFailed
	a.Error = err
}

func (a *Action) Cancel() {
	now := time.Now()
	a.CompletedAt = &now
	a.Status = ActionStatusCancelled
}

func (a *Action) Duration() time.Duration {
	if a.StartedAt == nil {
		return 0
	}
	if a.CompletedAt == nil {
		return time.Since(*a.StartedAt)
	}
	return a.CompletedAt.Sub(*a.StartedAt)
}

func (a *Action) IsPending() bool {
	return a.Status == ActionStatusPending
}

func (a *Action) IsRunning() bool {
	return a.Status == ActionStatusRunning
}

func (a *Action) IsCompleted() bool {
	return a.Status == ActionStatusCompleted
}

func (a *Action) IsFailed() bool {
	return a.Status == ActionStatusFailed
}

func (a *Action) IsFinished() bool {
	return a.Status == ActionStatusCompleted ||
		a.Status == ActionStatusFailed ||
		a.Status == ActionStatusCancelled
}

func (a *Action) SetParameter(key string, value interface{}) {
	a.Parameters[key] = value
}

func (a *Action) GetParameter(key string) (interface{}, bool) {
	val, ok := a.Parameters[key]
	return val, ok
}

func (a *Action) SetPreviousState(key string, value interface{}) {
	a.PreviousState[key] = value
}

func (a *Action) GetPreviousState(key string) (interface{}, bool) {
	val, ok := a.PreviousState[key]
	return val, ok
}

func (a *Action) CanUndo() bool {
	if a.UndoneBy != "" {
		return false
	}
	if !a.IsCompleted() {
		return false
	}
	switch a.Type {
	case ActionTypeScale, ActionTypeUpdate:
		return len(a.PreviousState) > 0
	default:
		return false
	}
}

func (a *Action) MarkUndone(undoActionID string) {
	a.UndoneBy = undoActionID
}

func (a *Action) ResourceKey() string {
	if a.Namespace != "" {
		return a.Namespace + "/" + a.ResourceKind + "/" + a.ResourceName
	}
	return a.ResourceKind + "/" + a.ResourceName
}
