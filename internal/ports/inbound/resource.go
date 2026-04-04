package inbound

import (
	"context"

	"github.com/tonymora/celia/internal/domain/resource"
)

type ResourcePort interface {
	List(ctx context.Context, kind resource.Kind, namespace string) ([]resource.Resource, error)

	Get(ctx context.Context, kind resource.Kind, namespace, name string) (*resource.Resource, error)

	GetYAML(ctx context.Context, kind resource.Kind, namespace, name string) (string, error)

	Update(ctx context.Context, kind resource.Kind, namespace, name string, yaml string) error

	Delete(ctx context.Context, kind resource.Kind, namespace, name string) error

	Watch(ctx context.Context, kind resource.Kind, namespace string) (<-chan resource.WatchEvent, error)

	ListPods(ctx context.Context, namespace string) ([]resource.Pod, error)
	GetPod(ctx context.Context, namespace, name string) (*resource.Pod, error)
	ListDeployments(ctx context.Context, namespace string) ([]resource.Deployment, error)
	GetDeployment(ctx context.Context, namespace, name string) (*resource.Deployment, error)
	ListServices(ctx context.Context, namespace string) ([]resource.Service, error)
	GetService(ctx context.Context, namespace, name string) (*resource.Service, error)
	ListConfigMaps(ctx context.Context, namespace string) ([]resource.ConfigMap, error)
	GetConfigMap(ctx context.Context, namespace, name string) (*resource.ConfigMap, error)
	ListSecrets(ctx context.Context, namespace string) ([]resource.Secret, error)
	GetSecret(ctx context.Context, namespace, name string, reveal bool) (*resource.Secret, error)
	ListNodes(ctx context.Context) ([]resource.Node, error)
	GetNode(ctx context.Context, name string) (*resource.Node, error)
}
