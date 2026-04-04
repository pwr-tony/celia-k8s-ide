package handlers

import (
	"net/http"

	"github.com/tonymora/celia/internal/application/trouble"
	"github.com/tonymora/celia/pkg/logger"
)

type TroubleHandler struct {
	service *trouble.Service
	log     *logger.Logger
}

func NewTroubleHandler(service *trouble.Service, log *logger.Logger) *TroubleHandler {
	return &TroubleHandler{
		service: service,
		log:     log.WithComponent("trouble-handler"),
	}
}

func (h *TroubleHandler) GetProblems(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")
	node := getQueryParam(r, "node", "")

	var problems interface{}
	var err error

	if namespace != "" {
		problems, err = h.service.GetProblemsByNamespace(r.Context(), namespace)
	} else if node != "" {
		problems, err = h.service.GetProblemsByNode(r.Context(), node)
	} else {
		problems, err = h.service.GetProblems(r.Context())
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"problems": problems})
}

func (h *TroubleHandler) GetProblemStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.service.GetProblemStats(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, stats)
}

func (h *TroubleHandler) GetDiagnosis(w http.ResponseWriter, r *http.Request) {
	kind := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	diagnosis, err := h.service.GetDiagnosis(r.Context(), kind, namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, diagnosis)
}
