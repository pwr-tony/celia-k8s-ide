package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListServices(ctx context.Context, namespace string) ([]resource.Service, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	services, err := clientset.CoreV1().Services(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	result := make([]resource.Service, len(services.Items))
	for i := range services.Items {
		result[i] = mapService(&services.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetService(ctx context.Context, namespace, name string) (*resource.Service, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	service, err := clientset.CoreV1().Services(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get service: %w", err)
	}

	result := mapService(service)
	return &result, nil
}
