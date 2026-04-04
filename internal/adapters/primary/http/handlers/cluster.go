package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/tonymora/celia/internal/application/cluster"
	"github.com/tonymora/celia/pkg/logger"
)

type ClusterHandler struct {
	service *cluster.Service
	log     *logger.Logger
}

func NewClusterHandler(service *cluster.Service, log *logger.Logger) *ClusterHandler {
	return &ClusterHandler{
		service: service,
		log:     log.WithComponent("cluster-handler"),
	}
}

func (h *ClusterHandler) ListContexts(w http.ResponseWriter, r *http.Request) {
	contexts, err := h.service.ListContexts(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, contexts)
}

type ConnectRequest struct {
	ContextName string `json:"context_name"`
}

func (h *ClusterHandler) Connect(w http.ResponseWriter, r *http.Request) {
	var req ConnectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ContextName == "" {
		writeError(w, http.StatusBadRequest, "context_name is required")
		return
	}

	if err := h.service.Connect(r.Context(), req.ContextName); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "connected", "context": req.ContextName})
}

func (h *ClusterHandler) Disconnect(w http.ResponseWriter, r *http.Request) {
	if err := h.service.Disconnect(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "disconnected"})
}

func (h *ClusterHandler) GetCurrentContext(w http.ResponseWriter, r *http.Request) {
	ctx, err := h.service.GetCurrentContext(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if ctx == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{"connected": false})
		return
	}

	writeJSON(w, http.StatusOK, ctx)
}

func (h *ClusterHandler) GetConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := h.service.GetConnection(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, conn)
}

func (h *ClusterHandler) ListNamespaces(w http.ResponseWriter, r *http.Request) {
	namespaces, err := h.service.ListNamespaces(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"namespaces": namespaces})
}

func (h *ClusterHandler) GetHealth(w http.ResponseWriter, r *http.Request) {
	health, err := h.service.GetHealth(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, health)
}
