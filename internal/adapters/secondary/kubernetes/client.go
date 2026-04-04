package kubernetes

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/tonymora/celia/internal/domain/cluster"
	"github.com/tonymora/celia/pkg/config"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
)

type Adapter struct {
	config     config.KubernetesConfig
	kubeConfig api.Config
	clientset  *kubernetes.Clientset
	restConfig *rest.Config
	connection *cluster.Connection
	mu         sync.RWMutex
}

func NewAdapter(cfg config.KubernetesConfig) (*Adapter, error) {
	adapter := &Adapter{
		config:     cfg,
		connection: cluster.NewConnection(),
	}

	kubeconfigPath := cfg.Kubeconfig
	if kubeconfigPath == "" {
		kubeconfigPath = defaultKubeconfigPath()
	}

	kubeConfig, err := loadKubeConfig(kubeconfigPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load kubeconfig: %w", err)
	}
	adapter.kubeConfig = *kubeConfig

	return adapter, nil
}

func defaultKubeconfigPath() string {
	if env := os.Getenv("KUBECONFIG"); env != "" {
		return env
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".kube", "config")
}

func loadKubeConfig(path string) (*api.Config, error) {
	config, err := clientcmd.LoadFromFile(path)
	if err != nil {
		return nil, err
	}
	return config, nil
}

func (a *Adapter) ListContexts() ([]cluster.Context, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()

	contexts := make([]cluster.Context, 0, len(a.kubeConfig.Contexts))
	currentContext := a.kubeConfig.CurrentContext

	for name, ctx := range a.kubeConfig.Contexts {
		contexts = append(contexts, cluster.Context{
			Name:        name,
			Cluster:     ctx.Cluster,
			User:        ctx.AuthInfo,
			Namespace:   ctx.Namespace,
			IsCurrent:   name == currentContext,
			IsConnected: a.connection.IsConnected() && a.connection.ContextName == name,
		})
	}

	return contexts, nil
}

func (a *Adapter) Connect(ctx context.Context, contextName string) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	contextConfig, ok := a.kubeConfig.Contexts[contextName]
	if !ok {
		return fmt.Errorf("context %q not found", contextName)
	}

	configOverrides := &clientcmd.ConfigOverrides{
		CurrentContext: contextName,
	}

	kubeconfigPath := a.config.Kubeconfig
	if kubeconfigPath == "" {
		kubeconfigPath = defaultKubeconfigPath()
	}

	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{ExplicitPath: kubeconfigPath},
		configOverrides,
	)

	restConfig, err := clientConfig.ClientConfig()
	if err != nil {
		a.connection.Fail(err.Error())
		return fmt.Errorf("failed to build client config: %w", err)
	}

	restConfig.Timeout = a.config.RequestTimeout

	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		a.connection.Fail(err.Error())
		return fmt.Errorf("failed to create clientset: %w", err)
	}

	_, err = clientset.Discovery().ServerVersion()
	if err != nil {
		a.connection.Fail(err.Error())
		return fmt.Errorf("failed to connect to cluster: %w", err)
	}

	a.clientset = clientset
	a.restConfig = restConfig

	namespace := contextConfig.Namespace
	if namespace == "" {
		namespace = a.config.DefaultNamespace
	}

	a.connection.Connect(contextName, namespace, restConfig.Host)

	return nil
}

func (a *Adapter) Disconnect() error {
	a.mu.Lock()
	defer a.mu.Unlock()

	a.clientset = nil
	a.restConfig = nil
	a.connection.Disconnect()

	return nil
}

func (a *Adapter) GetCurrentContext() (*cluster.Context, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if !a.connection.IsConnected() {
		return nil, nil
	}

	ctx, ok := a.kubeConfig.Contexts[a.connection.ContextName]
	if !ok {
		return nil, nil
	}

	return &cluster.Context{
		Name:        a.connection.ContextName,
		Cluster:     ctx.Cluster,
		User:        ctx.AuthInfo,
		Namespace:   a.connection.Namespace,
		IsCurrent:   true,
		IsConnected: true,
	}, nil
}

func (a *Adapter) IsConnected() bool {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.connection.IsConnected()
}

func (a *Adapter) GetConnection() *cluster.Connection {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.connection
}

func (a *Adapter) getClientset() (*kubernetes.Clientset, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if a.clientset == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.clientset, nil
}

func (a *Adapter) getRestConfig() (*rest.Config, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if a.restConfig == nil {
		return nil, fmt.Errorf("not connected to a cluster")
	}
	return a.restConfig, nil
}

func (a *Adapter) getCurrentNamespace() string {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.connection.Namespace
}
