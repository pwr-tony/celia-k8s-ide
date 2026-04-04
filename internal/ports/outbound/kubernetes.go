package outbound

import (
	"context"
	"io"
	"time"

	"github.com/tonymora/celia/internal/domain/cluster"
	"github.com/tonymora/celia/internal/domain/resource"
)

type KubernetesPort interface {
	ListContexts() ([]cluster.Context, error)
	Connect(ctx context.Context, contextName string) error
	Disconnect() error
	GetCurrentContext() (*cluster.Context, error)
	IsConnected() bool
	ListNamespaces(ctx context.Context) ([]string, error)
	GetClusterHealth(ctx context.Context) (*cluster.Health, error)

	ListResources(ctx context.Context, kind resource.Kind, namespace string) ([]resource.Resource, error)
	GetResource(ctx context.Context, kind resource.Kind, namespace, name string) (*resource.Resource, error)
	GetResourceYAML(ctx context.Context, kind resource.Kind, namespace, name string) (string, error)
	UpdateResource(ctx context.Context, kind resource.Kind, namespace, name string, yaml string) error
	DeleteResource(ctx context.Context, kind resource.Kind, namespace, name string) error

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

	ListEvents(ctx context.Context, namespace string) ([]resource.Event, error)
	ListEventsForResource(ctx context.Context, kind, namespace, name string) ([]resource.Event, error)
	WatchEvents(ctx context.Context, namespace string) (<-chan resource.Event, error)

	WatchResources(ctx context.Context, kind resource.Kind, namespace string) (<-chan resource.WatchEvent, error)

	GetPodLogs(ctx context.Context, namespace, pod, container string, opts LogOptions) (io.ReadCloser, error)

	ScaleDeployment(ctx context.Context, namespace, name string, replicas int32) error
	RolloutRestart(ctx context.Context, kind resource.Kind, namespace, name string) error
	DeletePod(ctx context.Context, namespace, name string, gracePeriod *int64) error
}

type LogOptions struct {
	Follow     bool
	TailLines  int64
	Since      time.Duration
	Timestamps bool
	Container  string
	Previous   bool
}

func DefaultLogOptions() LogOptions {
	return LogOptions{
		Follow:     false,
		TailLines:  100,
		Timestamps: true,
		Previous:   false,
	}
}
