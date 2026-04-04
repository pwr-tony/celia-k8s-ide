package resource

import (
	"context"

	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	k8sAdapter *kubernetes.Adapter
	log        *logger.Logger
}

func NewService(k8sAdapter *kubernetes.Adapter, log *logger.Logger) *Service {
	return &Service{
		k8sAdapter: k8sAdapter,
		log:        log.WithComponent("resource-service"),
	}
}

func (s *Service) List(ctx context.Context, kind resource.Kind, namespace string) ([]resource.Resource, error) {
	s.log.Debug("Listing resources", "kind", kind, "namespace", namespace)
	return s.k8sAdapter.ListResources(ctx, kind, namespace)
}

func (s *Service) Get(ctx context.Context, kind resource.Kind, namespace, name string) (*resource.Resource, error) {
	s.log.Debug("Getting resource", "kind", kind, "namespace", namespace, "name", name)
	return s.k8sAdapter.GetResource(ctx, kind, namespace, name)
}

func (s *Service) GetYAML(ctx context.Context, kind resource.Kind, namespace, name string) (string, error) {
	s.log.Debug("Getting resource YAML", "kind", kind, "namespace", namespace, "name", name)
	return s.k8sAdapter.GetResourceYAML(ctx, kind, namespace, name)
}

func (s *Service) Update(ctx context.Context, kind resource.Kind, namespace, name string, yaml string) error {
	s.log.Info("Updating resource", "kind", kind, "namespace", namespace, "name", name)
	return s.k8sAdapter.UpdateResource(ctx, kind, namespace, name, yaml)
}

func (s *Service) Delete(ctx context.Context, kind resource.Kind, namespace, name string) error {
	s.log.Info("Deleting resource", "kind", kind, "namespace", namespace, "name", name)
	return s.k8sAdapter.DeleteResource(ctx, kind, namespace, name)
}

func (s *Service) Watch(ctx context.Context, kind resource.Kind, namespace string) (<-chan resource.WatchEvent, error) {
	s.log.Debug("Watching resources", "kind", kind, "namespace", namespace)
	return s.k8sAdapter.WatchResources(ctx, kind, namespace)
}

func (s *Service) ListPods(ctx context.Context, namespace string) ([]resource.Pod, error) {
	return s.k8sAdapter.ListPods(ctx, namespace)
}

func (s *Service) GetPod(ctx context.Context, namespace, name string) (*resource.Pod, error) {
	return s.k8sAdapter.GetPod(ctx, namespace, name)
}

func (s *Service) ListDeployments(ctx context.Context, namespace string) ([]resource.Deployment, error) {
	return s.k8sAdapter.ListDeployments(ctx, namespace)
}

func (s *Service) GetDeployment(ctx context.Context, namespace, name string) (*resource.Deployment, error) {
	return s.k8sAdapter.GetDeployment(ctx, namespace, name)
}

func (s *Service) ListServices(ctx context.Context, namespace string) ([]resource.Service, error) {
	return s.k8sAdapter.ListServices(ctx, namespace)
}

func (s *Service) GetService(ctx context.Context, namespace, name string) (*resource.Service, error) {
	return s.k8sAdapter.GetService(ctx, namespace, name)
}

func (s *Service) ListConfigMaps(ctx context.Context, namespace string) ([]resource.ConfigMap, error) {
	return s.k8sAdapter.ListConfigMaps(ctx, namespace)
}

func (s *Service) GetConfigMap(ctx context.Context, namespace, name string) (*resource.ConfigMap, error) {
	return s.k8sAdapter.GetConfigMap(ctx, namespace, name)
}

func (s *Service) ListSecrets(ctx context.Context, namespace string) ([]resource.Secret, error) {
	return s.k8sAdapter.ListSecrets(ctx, namespace)
}

func (s *Service) GetSecret(ctx context.Context, namespace, name string, reveal bool) (*resource.Secret, error) {
	return s.k8sAdapter.GetSecret(ctx, namespace, name, reveal)
}

func (s *Service) ListNodes(ctx context.Context) ([]resource.Node, error) {
	return s.k8sAdapter.ListNodes(ctx)
}

func (s *Service) GetNode(ctx context.Context, name string) (*resource.Node, error) {
	return s.k8sAdapter.GetNode(ctx, name)
}
