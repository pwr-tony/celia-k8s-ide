package handlers

import (
	"bufio"
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/tonymora/celia/internal/application/observability"
	"github.com/tonymora/celia/internal/application/trouble"
	"github.com/tonymora/celia/pkg/logger"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSHandler struct {
	observabilityService *observability.Service
	troubleService       *trouble.Service
	log                  *logger.Logger
}

func NewWSHandler(observabilityService *observability.Service, troubleService *trouble.Service, log *logger.Logger) *WSHandler {
	return &WSHandler{
		observabilityService: observabilityService,
		troubleService:       troubleService,
		log:                  log.WithComponent("websocket-handler"),
	}
}

type WSMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type LogSubscribePayload struct {
	Namespace  string `json:"namespace"`
	Pod        string `json:"pod"`
	Container  string `json:"container"`
	Follow     bool   `json:"follow"`
	TailLines  int64  `json:"tailLines"`
	Timestamps bool   `json:"timestamps"`
}

type LogMessage struct {
	Type      string `json:"type"`
	Namespace string `json:"namespace"`
	Pod       string `json:"pod"`
	Container string `json:"container"`
	Line      string `json:"line"`
	Timestamp string `json:"timestamp,omitempty"`
}

type ErrorMessage struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

func (h *WSHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.log.Error("Failed to upgrade connection", "error", err)
		return
	}
	defer conn.Close()

	h.log.Info("WebSocket connection established", "remote_addr", r.RemoteAddr)

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	var wg sync.WaitGroup
	var mu sync.Mutex

	writeJSON := func(v interface{}) error {
		mu.Lock()
		defer mu.Unlock()
		return conn.WriteJSON(v)
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				h.log.Error("WebSocket read error", "error", err)
			}
			cancel()
			break
		}

		var msg WSMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			writeJSON(ErrorMessage{Type: "error", Message: "Invalid message format"})
			continue
		}

		switch msg.Type {
		case "logs.subscribe":
			var payload LogSubscribePayload
			if err := json.Unmarshal(msg.Payload, &payload); err != nil {
				writeJSON(ErrorMessage{Type: "error", Message: "Invalid payload for logs.subscribe"})
				continue
			}

			wg.Add(1)
			go func() {
				defer wg.Done()
				h.streamLogs(ctx, conn, &mu, payload)
			}()

		case "logs.unsubscribe":
			cancel()
			ctx, cancel = context.WithCancel(r.Context())

		case "problems.subscribe":
			wg.Add(1)
			go func() {
				defer wg.Done()
				h.streamProblems(ctx, conn, &mu)
			}()

		case "problems.unsubscribe":
			cancel()
			ctx, cancel = context.WithCancel(r.Context())

		case "ping":
			writeJSON(map[string]string{"type": "pong"})

		default:
			writeJSON(ErrorMessage{Type: "error", Message: "Unknown message type: " + msg.Type})
		}
	}

	wg.Wait()
	h.log.Info("WebSocket connection closed", "remote_addr", r.RemoteAddr)
}

func (h *WSHandler) streamLogs(ctx context.Context, conn *websocket.Conn, mu *sync.Mutex, payload LogSubscribePayload) {
	h.log.Info("Starting log stream",
		"namespace", payload.Namespace,
		"pod", payload.Pod,
		"container", payload.Container,
		"follow", payload.Follow,
	)

	writeJSON := func(v interface{}) error {
		mu.Lock()
		defer mu.Unlock()
		return conn.WriteJSON(v)
	}

	reader, err := h.observabilityService.GetLogs(ctx, payload.Namespace, payload.Pod, payload.Container, observability.LogOptions{
		Follow:     payload.Follow,
		TailLines:  payload.TailLines,
		Timestamps: payload.Timestamps,
	})
	if err != nil {
		writeJSON(ErrorMessage{Type: "error", Message: "Failed to start log stream: " + err.Error()})
		return
	}
	defer reader.Close()

	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	for scanner.Scan() {
		select {
		case <-ctx.Done():
			return
		default:
			line := scanner.Text()
			msg := LogMessage{
				Type:      "log",
				Namespace: payload.Namespace,
				Pod:       payload.Pod,
				Container: payload.Container,
				Line:      line,
				Timestamp: time.Now().Format(time.RFC3339),
			}
			if err := writeJSON(msg); err != nil {
				h.log.Error("Failed to write log message", "error", err)
				return
			}
		}
	}

	if err := scanner.Err(); err != nil {
		h.log.Error("Log scanner error", "error", err)
		writeJSON(ErrorMessage{Type: "error", Message: "Log stream error: " + err.Error()})
	}

	writeJSON(map[string]string{"type": "logs.end", "pod": payload.Pod})
}

func (h *WSHandler) streamProblems(ctx context.Context, conn *websocket.Conn, mu *sync.Mutex) {
	h.log.Info("Starting problems stream")

	writeJSON := func(v interface{}) error {
		mu.Lock()
		defer mu.Unlock()
		return conn.WriteJSON(v)
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	var lastProblemsHash string

	sendProblems := func() {
		problems, err := h.troubleService.GetProblems(ctx)
		if err != nil {
			writeJSON(ErrorMessage{Type: "error", Message: "Failed to get problems: " + err.Error()})
			return
		}

		data, _ := json.Marshal(problems)
		currentHash := string(data)

		if currentHash != lastProblemsHash {
			lastProblemsHash = currentHash
			writeJSON(map[string]interface{}{
				"type":    "problems.update",
				"payload": problems,
			})
		}
	}

	sendProblems()

	for {
		select {
		case <-ctx.Done():
			h.log.Info("Stopping problems stream")
			return
		case <-ticker.C:
			sendProblems()
		}
	}
}
