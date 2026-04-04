package middleware

import (
	"net/http"
	"time"

	"github.com/tonymora/celia/pkg/logger"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func Logging(log *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			wrapped := &responseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}

			next.ServeHTTP(wrapped, r)

			duration := time.Since(start)
			log.Info("HTTP request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", wrapped.statusCode,
				"duration", duration.String(),
				"remote_addr", r.RemoteAddr,
			)
		})
	}
}
