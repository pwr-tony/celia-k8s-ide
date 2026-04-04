package operation

import "time"

type ActionResult struct {
	ActionID    string
	Success     bool
	Message     string
	Error       string
	CompletedAt time.Time

	BeforeState string
	AfterState  string

	Details map[string]interface{}
}

func NewSuccessResult(actionID, message string) *ActionResult {
	return &ActionResult{
		ActionID:    actionID,
		Success:     true,
		Message:     message,
		CompletedAt: time.Now(),
		Details:     make(map[string]interface{}),
	}
}

func NewFailureResult(actionID string, err error) *ActionResult {
	return &ActionResult{
		ActionID:    actionID,
		Success:     false,
		Error:       err.Error(),
		CompletedAt: time.Now(),
		Details:     make(map[string]interface{}),
	}
}

func (r *ActionResult) WithBeforeState(state string) *ActionResult {
	r.BeforeState = state
	return r
}

func (r *ActionResult) WithAfterState(state string) *ActionResult {
	r.AfterState = state
	return r
}

func (r *ActionResult) AddDetail(key string, value interface{}) {
	r.Details[key] = value
}

type ScaleResult struct {
	ActionResult
	PreviousReplicas int32
	NewReplicas      int32
}

type RolloutResult struct {
	ActionResult
	RolloutType string
}

type DeleteResult struct {
	ActionResult
	ResourceKind string
	ResourceName string
	Namespace    string
}
