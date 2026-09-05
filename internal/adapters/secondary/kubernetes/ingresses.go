package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListIngresses(ctx context.Context, namespace string) ([]resource.Ingress, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	ingresses, err := clientset.NetworkingV1().Ingresses(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list ingresses: %w", err)
	}

	result := make([]resource.Ingress, len(ingresses.Items))
	for i := range ingresses.Items {
		result[i] = mapIngress(&ingresses.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetIngress(ctx context.Context, namespace, name string) (*resource.Ingress, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	ingress, err := clientset.NetworkingV1().Ingresses(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get ingress: %w", err)
	}

	result := mapIngress(ingress)
	return &result, nil
}
