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

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"count":   len(actions),
		"actions": actions,
	})
}
