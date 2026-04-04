package audit

import (
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/tonymora/celia/internal/domain/operation"
)

type Entry struct {
	ID          string
	Timestamp   time.Time
	ClusterName string
	Namespace   string

	Action   operation.ActionType
	Resource string

	Before string
	After  string

	Success bool
	Error   string

	Details map[string]string
}

func NewEntry(clusterName string, action operation.ActionType, namespace, resourceKind, resourceName string) *Entry {
	resource := resourceKind + "/" + resourceName
	if namespace != "" {
		resource = namespace + "/" + resource
	}

	return &Entry{
		ID:          generateEntryID(),
		Timestamp:   time.Now(),
		ClusterName: clusterName,
		Namespace:   namespace,
		Action:      action,
		Resource:    resource,
		Details:     make(map[string]string),
	}
}

func generateEntryID() string {
	now := time.Now()
	input := fmt.Sprintf("%d-%d", now.UnixNano(), now.Nanosecond())
	hash := sha256.Sum256([]byte(input))
	return fmt.Sprintf("%x", hash[:8])
}

func (e *Entry) SetBefore(yaml string) {
	e.Before = yaml
}

func (e *Entry) SetAfter(yaml string) {
	e.After = yaml
}

func (e *Entry) SetSuccess() {
	e.Success = true
}

func (e *Entry) SetError(err string) {
	e.Success = false
	e.Error = err
}

func (e *Entry) AddDetail(key, value string) {
	e.Details[key] = value
}

func (e *Entry) IsDestructive() bool {
	return e.Action.IsDestructive()
}

func (e *Entry) HasDiff() bool {
	return e.Before != "" && e.After != ""
}

func (e *Entry) Age() time.Duration {
	return time.Since(e.Timestamp)
}
