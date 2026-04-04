package cluster

import (
	"context"

	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/domain/cluster"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	k8sAdapter *kubernetes.Adapter
	log        *logger.Logger
}

func NewService(k8sAdapter *kubernetes.Adapter, log *logger.Logger) *Service {
	return &Service{
		k8sAdapter: k8sAdapter,
		log:        log.WithComponent("cluster-service"),
	}
}

func (s *Service) ListContexts(ctx context.Context) ([]cluster.Context, error) {
	s.log.Debug("Listing contexts")
	return s.k8sAdapter.ListContexts()
}

func (s *Service) Connect(ctx context.Context, contextName string) error {
	s.log.Info("Connecting to context", "context", contextName)

	if err := s.k8sAdapter.Connect(ctx, contextName); err != nil {
		s.log.Error("Failed to connect to context", "context", contextName, "error", err)
		return err
	}

	s.log.Info("Connected to context", "context", contextName)
	return nil
}

func (s *Service) Disconnect(ctx context.Context) error {
	s.log.Info("Disconnecting from cluster")
	return s.k8sAdapter.Disconnect()
}

func (s *Service) GetCurrentContext(ctx context.Context) (*cluster.Context, error) {
	return s.k8sAdapter.GetCurrentContext()
}

func (s *Service) GetConnection(ctx context.Context) (*cluster.Connection, error) {
	return s.k8sAdapter.GetConnection(), nil
}

func (s *Service) ListNamespaces(ctx context.Context) ([]string, error) {
	if !s.k8sAdapter.IsConnected() {
		return nil, ErrNotConnected
	}
	return s.k8sAdapter.ListNamespaces(ctx)
}

func (s *Service) GetHealth(ctx context.Context) (*cluster.Health, error) {
	if !s.k8sAdapter.IsConnected() {
		return nil, ErrNotConnected
	}
	return s.k8sAdapter.GetClusterHealth(ctx)
}

func (s *Service) IsConnected() bool {
	return s.k8sAdapter.IsConnected()
}

var (
	ErrNotConnected = &ClusterError{Message: "not connected to a cluster"}
)

type ClusterError struct {
	Message string
}

func (e *ClusterError) Error() string {
	return e.Message
}
