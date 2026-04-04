package handlers

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{Error: message})
}

func writeErrorWithCode(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{Error: message, Code: code})
}

func getQueryParam(r *http.Request, key, defaultValue string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getBoolQueryParam(r *http.Request, key string, defaultValue bool) bool {
	value := r.URL.Query().Get(key)
	if value == "" {
		return defaultValue
	}
	return value == "true" || value == "1"
}
