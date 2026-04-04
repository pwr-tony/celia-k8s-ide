package logger

import (
	"io"
	"log/slog"
	"os"
	"strings"
)

type Logger struct {
	*slog.Logger
}

func New(level, format string) *Logger {
	var handler slog.Handler

	opts := &slog.HandlerOptions{
		Level: parseLevel(level),
	}

	var output io.Writer = os.Stdout

	switch strings.ToLower(format) {
	case "json":
		handler = slog.NewJSONHandler(output, opts)
	case "text":
		handler = slog.NewTextHandler(output, opts)
	default:
		handler = slog.NewJSONHandler(output, opts)
	}

	return &Logger{
		Logger: slog.New(handler),
	}
}

func parseLevel(level string) slog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func (l *Logger) With(args ...any) *Logger {
	return &Logger{
		Logger: l.Logger.With(args...),
	}
}

func (l *Logger) WithComponent(name string) *Logger {
	return l.With("component", name)
}

func (l *Logger) WithContext(requestID string) *Logger {
	return l.With("request_id", requestID)
}

func (l *Logger) WithCluster(clusterName string) *Logger {
	return l.With("cluster", clusterName)
}

func (l *Logger) WithNamespace(namespace string) *Logger {
	return l.With("namespace", namespace)
}

func (l *Logger) WithResource(kind, namespace, name string) *Logger {
	return l.With("resource_kind", kind, "resource_namespace", namespace, "resource_name", name)
}
