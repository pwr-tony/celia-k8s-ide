package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/tonymora/celia/internal/application/operation"
	"github.com/tonymora/celia/pkg/logger"
)

type OperationHandler struct {
	service *operation.Service
	log     *logger.Logger
}

func NewOperationHandler(service *operation.Service, log *logger.Logger) *OperationHandler {
	return &OperationHandler{
		service: service,
		log:     log.WithComponent("operation-handler"),
	}
}

func (h *OperationHandler) ScaleDeployment(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	var req struct {
		Replicas int32 `json:"replicas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Replicas < 0 {
		writeError(w, http.StatusBadRequest, "Replicas must be >= 0")
		return
	}

	result, err := h.service.ScaleDeployment(r.Context(), namespace, name, req.Replicas)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"action_id": result.ActionID,
		"success":   result.Success,
		"message":   result.Message,
	})
}

func (h *OperationHandler) RolloutRestart(w http.ResponseWriter, r *http.Request) {
	kind := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	result, err := h.service.RolloutRestart(r.Context(), kind, namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"action_id": result.ActionID,
		"success":   result.Success,
		"message":   result.Message,
	})
}

func (h *OperationHandler) DeletePod(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	var gracePeriod *int64
	if gp := r.URL.Query().Get("grace_period"); gp != "" {
		var val int64
		if err := json.Unmarshal([]byte(gp), &val); err == nil {
			gracePeriod = &val
		}
	}

	result, err := h.service.DeletePod(r.Context(), namespace, name, gracePeriod)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"action_id": result.ActionID,
		"success":   result.Success,
		"message":   result.Message,
	})
}

func (h *OperationHandler) PurgePods(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Namespace string   `json:"namespace"`
		States    []string `json:"states"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	result, err := h.service.PurgePods(r.Context(), req.Namespace, req.States)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

type actionResponse struct {
	ID           string                 `json:"id"`
	Type         string                 `json:"type"`
	Status       string                 `json:"status"`
	ResourceKind string                 `json:"resource_kind"`
	Namespace    string                 `json:"namespace"`
	ResourceName string                 `json:"resource_name"`
	Parameters   map[string]interface{} `json:"parameters"`
	CreatedAt    string                 `json:"created_at"`
	StartedAt    string                 `json:"started_at"`
	CompletedAt  string                 `json:"completed_at"`
	Message      string                 `json:"message"`
	Error        string                 `json:"error,omitempty"`
	UndoneBy     string                 `json:"undone_by,omitempty"`
	CanUndo      bool                   `json:"can_undo"`
}

func (h *OperationHandler) GetActionHistory(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		var val int
		if err := json.Unmarshal([]byte(l), &val); err == nil && val > 0 {
			limit = val
		}
	}

	actions, err := h.service.GetActionHistory(r.Context(), limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := make([]actionResponse, len(actions))
	for i, a := range actions {
		startedAt := ""
		if a.StartedAt != nil {
			startedAt = a.StartedAt.Format("2006-01-02T15:04:05Z07:00")
		}
		completedAt := ""
		if a.CompletedAt != nil {
			completedAt = a.CompletedAt.Format("2006-01-02T15:04:05Z07:00")
		}
		response[i] = actionResponse{
			ID:           a.ID,
			Type:         string(a.Type),
			Status:       string(a.Status),
			ResourceKind: a.ResourceKind,
			Namespace:    a.Namespace,
			ResourceName: a.ResourceName,
			Parameters:   a.Parameters,
			CreatedAt:    a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			StartedAt:    startedAt,
			CompletedAt:  completedAt,
			Message:      a.Message,
			Error:        a.Error,
			UndoneBy:     a.UndoneBy,
			CanUndo:      a.CanUndo(),
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"count":   len(response),
		"actions": response,
	})
}

func (h *OperationHandler) GetAction(w http.ResponseWriter, r *http.Request) {
	actionID := r.PathValue("id")

	action, err := h.service.GetAction(r.Context(), actionID)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, action)
}

func (h *OperationHandler) UndoAction(w http.ResponseWriter, r *http.Request) {
	actionID := r.PathValue("id")

	action, err := h.service.GetAction(r.Context(), actionID)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	if !action.CanUndo() {
		writeError(w, http.StatusBadRequest, "Action cannot be undone")
		return
	}

	result, err := h.service.UndoAction(r.Context(), actionID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"action_id":      result.ActionID,
		"success":        result.Success,
		"message":        result.Message,
		"undo_action_id": actionID,
	})
}
