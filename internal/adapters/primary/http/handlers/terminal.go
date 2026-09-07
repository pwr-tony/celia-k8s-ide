package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/pkg/logger"
	"k8s.io/client-go/tools/remotecommand"
)

type TerminalHandler struct {
	k8sAdapter *kubernetes.Adapter
	log        *logger.Logger
}

func NewTerminalHandler(k8sAdapter *kubernetes.Adapter, log *logger.Logger) *TerminalHandler {
	return &TerminalHandler{
		k8sAdapter: k8sAdapter,
		log:        log.WithComponent("terminal-handler"),
	}
}

type TerminalMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data,omitempty"`
}

type TerminalInput struct {
	Data string `json:"data"`
}

type TerminalResize struct {
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

type TerminalSession struct {
	conn       *websocket.Conn
	mu         sync.Mutex
	sizeQueue  *terminalSizeQueue
	stdinPipe  io.WriteCloser
	stdoutPipe io.ReadCloser
}

type terminalSizeQueue struct {
	resizeChan chan remotecommand.TerminalSize
	done       chan struct{}
}

func newTerminalSizeQueue() *terminalSizeQueue {
	return &terminalSizeQueue{
		resizeChan: make(chan remotecommand.TerminalSize, 1),
		done:       make(chan struct{}),
	}
}

func (t *terminalSizeQueue) Next() *remotecommand.TerminalSize {
	select {
	case size := <-t.resizeChan:
		return &size
	case <-t.done:
		return nil
	}
}

func (t *terminalSizeQueue) Resize(cols, rows uint16) {
	select {
	case t.resizeChan <- remotecommand.TerminalSize{Width: cols, Height: rows}:
	default:
		select {
		case <-t.resizeChan:
		default:
		}
		t.resizeChan <- remotecommand.TerminalSize{Width: cols, Height: rows}
	}
}

func (t *terminalSizeQueue) Close() {
	close(t.done)
}

func (h *TerminalHandler) HandleExec(w http.ResponseWriter, r *http.Request) {
	namespace := r.PathValue("namespace")
	pod := r.PathValue("pod")
	container := r.URL.Query().Get("container")

	if namespace == "" || pod == "" {
		http.Error(w, "namespace and pod are required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.log.Error("Failed to upgrade connection", "error", err)
		return
	}

	h.log.Info("Terminal connection established",
		"namespace", namespace,
		"pod", pod,
		"container", container,
	)

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	sizeQueue := newTerminalSizeQueue()
	defer sizeQueue.Close()

	stdinReader, stdinWriter := io.Pipe()
	stdoutReader, stdoutWriter := io.Pipe()

	session := &TerminalSession{
		conn:       conn,
		sizeQueue:  sizeQueue,
		stdinPipe:  stdinWriter,
		stdoutPipe: stdoutReader,
	}

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		h.readFromWebSocket(ctx, cancel, session)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		h.writeToWebSocket(ctx, session)
	}()

	command := []string{"/bin/sh", "-c", "TERM=xterm-256color; export TERM; [ -x /bin/bash ] && exec /bin/bash || exec /bin/sh"}

	err = h.k8sAdapter.ExecWithTerminalSize(ctx, kubernetes.ExecOptions{
		Namespace: namespace,
		Pod:       pod,
		Container: container,
		Command:   command,
		Stdin:     stdinReader,
		Stdout:    stdoutWriter,
		Stderr:    stdoutWriter,
		TTY:       true,
	}, sizeQueue)

	if err != nil {
		h.log.Error("Exec error", "error", err)
		session.sendMessage("error", map[string]string{"message": err.Error()})
	}

	stdoutWriter.Close()
	stdinReader.Close()

	cancel()
	wg.Wait()

	conn.Close()
	h.log.Info("Terminal connection closed", "namespace", namespace, "pod", pod)
}

func (h *TerminalHandler) readFromWebSocket(ctx context.Context, cancel context.CancelFunc, session *TerminalSession) {
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		_, message, err := session.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNormalClosure) {
				h.log.Error("WebSocket read error", "error", err)
			}
			return
		}

		var msg TerminalMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			h.log.Error("Invalid message format", "error", err)
			continue
		}

		switch msg.Type {
		case "input":
			var input TerminalInput
			if err := json.Unmarshal(msg.Data, &input); err != nil {
				h.log.Error("Invalid input data", "error", err)
				continue
			}
			if _, err := session.stdinPipe.Write([]byte(input.Data)); err != nil {
				h.log.Error("Failed to write to stdin", "error", err)
				return
			}

		case "resize":
			var resize TerminalResize
			if err := json.Unmarshal(msg.Data, &resize); err != nil {
				h.log.Error("Invalid resize data", "error", err)
				continue
			}
			session.sizeQueue.Resize(resize.Cols, resize.Rows)

		case "ping":
			session.sendMessage("pong", nil)

		default:
			h.log.Warn("Unknown message type", "type", msg.Type)
		}
	}
}

func (h *TerminalHandler) writeToWebSocket(ctx context.Context, session *TerminalSession) {
	buf := make([]byte, 4096)

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		n, err := session.stdoutPipe.Read(buf)
		if err != nil {
			if err != io.EOF {
				h.log.Error("Failed to read from stdout", "error", err)
			}
			return
		}

		if n > 0 {
			session.sendMessage("output", map[string]string{"data": string(buf[:n])})
		}
	}
}

func (s *TerminalSession) sendMessage(msgType string, data interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	msg := map[string]interface{}{
		"type": msgType,
	}
	if data != nil {
		msg["data"] = data
	}

	return s.conn.WriteJSON(msg)
}
