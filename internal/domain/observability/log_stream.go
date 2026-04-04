package observability

import (
	"context"
	"sync"
)

type LogStream struct {
	ID        string
	Filter    LogFilter
	Entries   chan LogEntry
	Errors    chan error
	ctx       context.Context
	cancel    context.CancelFunc
	mu        sync.RWMutex
	active    bool
}

func NewLogStream(id string, filter LogFilter) *LogStream {
	ctx, cancel := context.WithCancel(context.Background())
	return &LogStream{
		ID:      id,
		Filter:  filter,
		Entries: make(chan LogEntry, 100),
		Errors:  make(chan error, 10),
		ctx:     ctx,
		cancel:  cancel,
		active:  true,
	}
}

func (s *LogStream) Context() context.Context {
	return s.ctx
}

func (s *LogStream) IsActive() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.active
}

func (s *LogStream) Send(entry LogEntry) bool {
	s.mu.RLock()
	active := s.active
	s.mu.RUnlock()

	if !active {
		return false
	}

	select {
	case s.Entries <- entry:
		return true
	case <-s.ctx.Done():
		return false
	default:
		return false
	}
}

func (s *LogStream) SendError(err error) {
	select {
	case s.Errors <- err:
	default:
	}
}

func (s *LogStream) Close() {
	s.mu.Lock()
	s.active = false
	s.mu.Unlock()

	s.cancel()
	close(s.Entries)
	close(s.Errors)
}

type LogStreamManager struct {
	streams map[string]*LogStream
	mu      sync.RWMutex
}

func NewLogStreamManager() *LogStreamManager {
	return &LogStreamManager{
		streams: make(map[string]*LogStream),
	}
}

func (m *LogStreamManager) Create(id string, filter LogFilter) *LogStream {
	stream := NewLogStream(id, filter)

	m.mu.Lock()
	m.streams[id] = stream
	m.mu.Unlock()

	return stream
}

func (m *LogStreamManager) Get(id string) (*LogStream, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	stream, ok := m.streams[id]
	return stream, ok
}

func (m *LogStreamManager) Close(id string) {
	m.mu.Lock()
	if stream, ok := m.streams[id]; ok {
		stream.Close()
		delete(m.streams, id)
	}
	m.mu.Unlock()
}

func (m *LogStreamManager) CloseAll() {
	m.mu.Lock()
	for id, stream := range m.streams {
		stream.Close()
		delete(m.streams, id)
	}
	m.mu.Unlock()
}

func (m *LogStreamManager) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.streams)
}
