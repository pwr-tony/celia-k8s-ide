package outbound

import (
	"context"
	"time"

	"github.com/tonymora/celia/internal/domain/audit"
)

type AuditStorePort interface {
	Append(ctx context.Context, entry audit.Entry) error

	List(ctx context.Context, from, to time.Time) ([]audit.Entry, error)

	ListByCluster(ctx context.Context, clusterName string, from, to time.Time) ([]audit.Entry, error)

	ListRecent(ctx context.Context, n int) ([]audit.Entry, error)

	GetByID(ctx context.Context, id string) (*audit.Entry, error)

	Close() error
}
