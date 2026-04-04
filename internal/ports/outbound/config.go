package outbound

import "github.com/tonymora/celia/internal/domain/cluster"

type ConfigPort interface {
	LoadKubeContexts() ([]cluster.Context, error)

	GetCurrentContext() (string, error)

	SetCurrentContext(contextName string) error

	GetKubeconfigPath() string
}
