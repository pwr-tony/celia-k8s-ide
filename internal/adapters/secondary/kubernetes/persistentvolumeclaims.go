package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListPersistentVolumeClaims(ctx context.Context, namespace string) ([]resource.PersistentVolumeClaim, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pvcs, err := clientset.CoreV1().PersistentVolumeClaims(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list persistent volume claims: %w", err)
	}

	result := make([]resource.PersistentVolumeClaim, len(pvcs.Items))
	for i := range pvcs.Items {
		result[i] = mapPersistentVolumeClaim(&pvcs.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetPersistentVolumeClaim(ctx context.Context, namespace, name string) (*resource.PersistentVolumeClaim, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pvc, err := clientset.CoreV1().PersistentVolumeClaims(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get persistent volume claim: %w", err)
	}

	result := mapPersistentVolumeClaim(pvc)
	return &result, nil
}
