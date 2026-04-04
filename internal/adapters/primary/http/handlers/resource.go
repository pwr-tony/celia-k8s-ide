package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/tonymora/celia/internal/application/resource"
	domainResource "github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/pkg/logger"
)

type ResourceHandler struct {
	service *resource.Service
	log     *logger.Logger
}

func NewResourceHandler(service *resource.Service, log *logger.Logger) *ResourceHandler {
	return &ResourceHandler{
		service: service,
		log:     log.WithComponent("resource-handler"),
	}
}

func (h *ResourceHandler) List(w http.ResponseWriter, r *http.Request) {
	kindStr := r.PathValue("kind")
	namespace := getQueryParam(r, "namespace", "")

	kind, ok := domainResource.ParseKind(kindStr)
	if !ok {
		writeError(w, http.StatusBadRequest, "unsupported resource kind: "+kindStr)
		return
	}

	resources, err := h.service.List(r.Context(), kind, namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": resources, "count": len(resources)})
}

func (h *ResourceHandler) Get(w http.ResponseWriter, r *http.Request) {
	kindStr := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	kind, ok := domainResource.ParseKind(kindStr)
	if !ok {
		writeError(w, http.StatusBadRequest, "unsupported resource kind: "+kindStr)
		return
	}

	res, err := h.service.Get(r.Context(), kind, namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, res)
}

func (h *ResourceHandler) GetYAML(w http.ResponseWriter, r *http.Request) {
	kindStr := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	kind, ok := domainResource.ParseKind(kindStr)
	if !ok {
		writeError(w, http.StatusBadRequest, "unsupported resource kind: "+kindStr)
		return
	}

	yaml, err := h.service.GetYAML(r.Context(), kind, namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/x-yaml")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(yaml))
}

func (h *ResourceHandler) Update(w http.ResponseWriter, r *http.Request) {
	kindStr := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	kind, ok := domainResource.ParseKind(kindStr)
	if !ok {
		writeError(w, http.StatusBadRequest, "unsupported resource kind: "+kindStr)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		writeError(w, http.StatusBadRequest, "failed to read request body")
		return
	}

	if err := h.service.Update(r.Context(), kind, namespace, name, string(body)); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "updated"})
}

func (h *ResourceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	kindStr := r.PathValue("kind")
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	kind, ok := domainResource.ParseKind(kindStr)
	if !ok {
		writeError(w, http.StatusBadRequest, "unsupported resource kind: "+kindStr)
		return
	}

	if err := h.service.Delete(r.Context(), kind, namespace, name); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *ResourceHandler) ListPods(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	pods, err := h.service.ListPods(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": pods, "count": len(pods)})
}

func (h *ResourceHandler) GetPod(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	pod, err := h.service.GetPod(r.Context(), namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, pod)
}

func (h *ResourceHandler) ListDeployments(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	deployments, err := h.service.ListDeployments(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": deployments, "count": len(deployments)})
}

func (h *ResourceHandler) GetDeployment(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	deployment, err := h.service.GetDeployment(r.Context(), namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, deployment)
}

func (h *ResourceHandler) ListServices(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	services, err := h.service.ListServices(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": services, "count": len(services)})
}

func (h *ResourceHandler) GetService(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	svc, err := h.service.GetService(r.Context(), namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, svc)
}

func (h *ResourceHandler) ListConfigMaps(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	configMaps, err := h.service.ListConfigMaps(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": configMaps, "count": len(configMaps)})
}

func (h *ResourceHandler) GetConfigMap(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")

	cm, err := h.service.GetConfigMap(r.Context(), namespace, name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, cm)
}

func (h *ResourceHandler) ListSecrets(w http.ResponseWriter, r *http.Request) {
	namespace := getQueryParam(r, "namespace", "")

	secrets, err := h.service.ListSecrets(r.Context(), namespace)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": secrets, "count": len(secrets)})
}

func (h *ResourceHandler) GetSecret(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	name := r.PathValue("name")
	reveal := getBoolQueryParam(r, "reveal", false)

	secret, err := h.service.GetSecret(r.Context(), namespace, name, reveal)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, secret)
}

func (h *ResourceHandler) ListNodes(w http.ResponseWriter, r *http.Request) {
	nodes, err := h.service.ListNodes(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"items": nodes, "count": len(nodes)})
}


func (h *ResourceHandler) GetNode(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")

	node, err := h.service.GetNode(r.Context(), name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, node)
}

var _ = json.Marshal
