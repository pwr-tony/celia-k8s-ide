package handlers

import (
	"io"
	"net/http"
	"strconv"

	"github.com/tonymora/celia/internal/application/observability"
	"github.com/tonymora/celia/pkg/logger"
)

type ObservabilityHandler struct {
	service *observability.Service
	log     *logger.Logger
}

func NewObservabilityHandler(service *observability.Service, log *logger.Logger) *ObservabilityHandler {
	return &ObservabilityHandler{
		service: service,
		log:     log.WithComponent("observability-handler"),
	}
}

func (h *ObservabilityHandler) GetLogs(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	pod := r.PathValue("pod")
	container := getQueryParam(r, "container", "")
	follow := getBoolQueryParam(r, "follow", false)
	timestamps := getBoolQueryParam(r, "timestamps", true)
	previous := getBoolQueryParam(r, "previous", false)
	since := getQueryParam(r, "since", "")

	tailLines := int64(100)
	if tail := r.URL.Query().Get("tail"); tail != "" {
		if n, err := strconv.ParseInt(tail, 10, 64); err == nil {
			tailLines = n
		}
	}

	opts := observability.LogOptions{
		Follow:     follow,
		TailLines:  tailLines,
		Since:      since,
		Timestamps: timestamps,
		Previous:   previous,
	}

	reader, err := h.service.GetLogs(r.Context(), namespace, pod, container, opts)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer reader.Close()

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)

	if follow {
		flusher, ok := w.(http.Flusher)
		if !ok {
			writeError(w, http.StatusInternalServerError, "streaming not supported")
			return
		}

		buf := make([]byte, 1024)
		for {
			n, err := reader.Read(buf)
			if n > 0 {
				w.Write(buf[:n])
				flusher.Flush()
			}
			if err != nil {
				if err != io.EOF {
					h.log.Error("Error reading logs", "error", err)
				}
				break
			}
		}
	} else {
		io.Copy(w, reader)
	}
}

func (h *ObservabilityHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	events, err := h.service.ListEvents(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": events, "count": len(events)})
}

func (h *ObservabilityHandler) ListEventsForResource(w http.ResponseWriter, r *http.Request) {
	kind := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	events, err := h.service.ListEventsForResource(r.Context(), kind, namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": events, "count": len(events)})
}

func (h *ObservabilityHandler) GetNodeMetrics(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsMetricsAvailable(r.Context()) {
		writeError(w, http.StatusServiceUnavailable, "metrics not available")
		return
	}

	metrics, err := h.service.GetNodeMetrics(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": metrics, "count": len(metrics)})
}

func (h *ObservabilityHandler) GetPodMetrics(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsMetricsAvailable(r.Context()) {
		writeError(w, http.StatusServiceUnavailable, "metrics not available")
		return
	}

	namespace := getQueryParam(r, "namespace", "")

	metrics, err := h.service.GetPodMetrics(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": metrics, "count": len(metrics)})
}

func (h *ObservabilityHandler) GetClusterMetrics(w http.ResponseWriter, r *http.Request) {
	if !h.service.IsMetricsAvailable(r.Context()) {
		writeError(w, http.StatusServiceUnavailable, "metrics not available")
		return
	}

	metrics, err := h.service.GetClusterMetrics(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, metrics)
}
