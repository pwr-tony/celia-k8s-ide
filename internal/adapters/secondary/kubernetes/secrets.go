package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListSecrets(ctx context.Context, namespace string) ([]resource.Secret, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	secrets, err := clientset.CoreV1().Secrets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list secrets: %w", err)
	}

	result := make([]resource.Secret, len(secrets.Items))
	for i := range secrets.Items {
		result[i] = mapSecret(&secrets.Items[i], false)
	}

	return result, nil
}

func (a *Adapter) GetSecret(ctx context.Context, namespace, name string, reveal bool) (*resource.Secret, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	secret, err := clientset.CoreV1().Secrets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get secret: %w", err)
	}

	result := mapSecret(secret, reveal)
	return &result, nil
}
