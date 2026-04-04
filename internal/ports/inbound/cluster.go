package inbound

import (
	"context"

	"github.com/tonymora/celia/internal/domain/cluster"
)

type ClusterPort interface {
	ListContexts(ctx context.Context) ([]cluster.Context, error)

	Connect(ctx context.Context, contextName string) error

	Disconnect(ctx context.Context) error

	GetCurrentContext(ctx context.Context) (*cluster.Context, error)

	GetConnection(ctx context.Context) (*cluster.Connection, error)

	ListNamespaces(ctx context.Context) ([]string, error)

	GetHealth(ctx context.Context) (*cluster.Health, error)
}
