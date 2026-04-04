package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListConfigMaps(ctx context.Context, namespace string) ([]resource.ConfigMap, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	configMaps, err := clientset.CoreV1().ConfigMaps(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list configmaps: %w", err)
	}

	result := make([]resource.ConfigMap, len(configMaps.Items))
	for i := range configMaps.Items {
		result[i] = mapConfigMap(&configMaps.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetConfigMap(ctx context.Context, namespace, name string) (*resource.ConfigMap, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	configMap, err := clientset.CoreV1().ConfigMaps(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get configmap: %w", err)
	}

	result := mapConfigMap(configMap)
	return &result, nil
}
