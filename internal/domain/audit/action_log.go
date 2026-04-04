package audit

import (
	"sync"
	"time"
)

type ActionLog struct {
	ClusterName string
	entries     []Entry
	mu          sync.RWMutex
	maxEntries  int
}

func NewActionLog(clusterName string, maxEntries int) *ActionLog {
	if maxEntries <= 0 {
		maxEntries = 1000
	}
	return &ActionLog{
		ClusterName: clusterName,
		entries:     make([]Entry, 0),
		maxEntries:  maxEntries,
	}
}

func (l *ActionLog) Add(entry Entry) {
	l.mu.Lock()
	defer l.mu.Unlock()

	l.entries = append(l.entries, entry)

	if len(l.entries) > l.maxEntries {
		l.entries = l.entries[len(l.entries)-l.maxEntries:]
	}
}

func (l *ActionLog) List() []Entry {
	l.mu.RLock()
	defer l.mu.RUnlock()

	result := make([]Entry, len(l.entries))
	copy(result, l.entries)
	return result
}

func (l *ActionLog) ListByTimeRange(from, to time.Time) []Entry {
	l.mu.RLock()
	defer l.mu.RUnlock()

	var result []Entry
	for _, entry := range l.entries {
		if entry.Timestamp.After(from) && entry.Timestamp.Before(to) {
			result = append(result, entry)
		}
	}
	return result
}

func (l *ActionLog) ListRecent(n int) []Entry {
	l.mu.RLock()
	defer l.mu.RUnlock()

	if n >= len(l.entries) {
		result := make([]Entry, len(l.entries))
		copy(result, l.entries)
		return result
	}

	start := len(l.entries) - n
	result := make([]Entry, n)
	copy(result, l.entries[start:])
	return result
}

func (l *ActionLog) ListDestructive() []Entry {
	l.mu.RLock()
	defer l.mu.RUnlock()

	var result []Entry
	for _, entry := range l.entries {
		if entry.IsDestructive() {
			result = append(result, entry)
		}
	}
	return result
}

func (l *ActionLog) ListFailed() []Entry {
	l.mu.RLock()
	defer l.mu.RUnlock()

	var result []Entry
	for _, entry := range l.entries {
		if !entry.Success {
			result = append(result, entry)
		}
	}
	return result
}

func (l *ActionLog) GetByID(id string) (*Entry, bool) {
	l.mu.RLock()
	defer l.mu.RUnlock()

	for i := range l.entries {
		if l.entries[i].ID == id {
			return &l.entries[i], true
		}
	}
	return nil, false
}

func (l *ActionLog) Count() int {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return len(l.entries)
}

func (l *ActionLog) Clear() {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.entries = make([]Entry, 0)
}
