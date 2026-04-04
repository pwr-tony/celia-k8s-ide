package audit

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/tonymora/celia/internal/domain/audit"
)

type FileStore struct {
	directory string
	entries   []audit.Entry
	mu        sync.RWMutex
}

func NewFileStore(directory string) (*FileStore, error) {
	if len(directory) > 0 && directory[0] == '~' {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, fmt.Errorf("failed to get home directory: %w", err)
		}
		directory = filepath.Join(home, directory[1:])
	}

	if err := os.MkdirAll(directory, 0755); err != nil {
		return nil, fmt.Errorf("failed to create audit directory: %w", err)
	}

	store := &FileStore{
		directory: directory,
		entries:   make([]audit.Entry, 0),
	}

	if err := store.load(); err != nil {
		fmt.Printf("Warning: failed to load audit entries: %v\n", err)
	}

	return store, nil
}

func (s *FileStore) Append(ctx context.Context, entry audit.Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.entries = append(s.entries, entry)

	return s.save()
}

func (s *FileStore) List(ctx context.Context, from, to time.Time) ([]audit.Entry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []audit.Entry
	for _, e := range s.entries {
		if e.Timestamp.After(from) && e.Timestamp.Before(to) {
			result = append(result, e)
		}
	}

	return result, nil
}

func (s *FileStore) ListByCluster(ctx context.Context, clusterName string, from, to time.Time) ([]audit.Entry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []audit.Entry
	for _, e := range s.entries {
		if e.ClusterName == clusterName && e.Timestamp.After(from) && e.Timestamp.Before(to) {
			result = append(result, e)
		}
	}

	return result, nil
}

func (s *FileStore) ListRecent(ctx context.Context, n int) ([]audit.Entry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if n >= len(s.entries) {
		result := make([]audit.Entry, len(s.entries))
		copy(result, s.entries)
		return result, nil
	}

	start := len(s.entries) - n
	result := make([]audit.Entry, n)
	copy(result, s.entries[start:])
	return result, nil
}

func (s *FileStore) GetByID(ctx context.Context, id string) (*audit.Entry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for i := range s.entries {
		if s.entries[i].ID == id {
			return &s.entries[i], nil
		}
	}

	return nil, nil
}

func (s *FileStore) Close() error {
	return s.save()
}

func (s *FileStore) load() error {
	filename := filepath.Join(s.directory, "audit.json")

	data, err := os.ReadFile(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	return json.Unmarshal(data, &s.entries)
}

func (s *FileStore) save() error {
	filename := filepath.Join(s.directory, "audit.json")

	data, err := json.MarshalIndent(s.entries, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filename, data, 0644)
}
