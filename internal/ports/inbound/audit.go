package inbound

import (
	"context"
	"time"

	"github.com/tonymora/celia/internal/domain/audit"
)

type AuditPort interface {
	List(ctx context.Context, from, to time.Time) ([]audit.Entry, error)

	ListRecent(ctx context.Context, limit int) ([]audit.Entry, error)

	ListByCluster(ctx context.Context, clusterName string, from, to time.Time) ([]audit.Entry, error)

	ListDestructive(ctx context.Context, from, to time.Time) ([]audit.Entry, error)

	GetByID(ctx context.Context, id string) (*audit.Entry, error)

	GetStats(ctx context.Context, from, to time.Time) (*AuditStats, error)
}

type AuditStats struct {
	Total       int
	Successful  int
	Failed      int
	Destructive int
	ByAction    map[string]int
	ByCluster   map[string]int
}
