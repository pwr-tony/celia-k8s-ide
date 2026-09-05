package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListPersistentVolumes(ctx context.Context) ([]resource.PersistentVolume, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pvs, err := clientset.CoreV1().PersistentVolumes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list persistent volumes: %w", err)
	}

	result := make([]resource.PersistentVolume, len(pvs.Items))
	for i := range pvs.Items {
		result[i] = mapPersistentVolume(&pvs.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetPersistentVolume(ctx context.Context, name string) (*resource.PersistentVolume, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pv, err := clientset.CoreV1().PersistentVolumes().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get persistent volume: %w", err)
	}

	result := mapPersistentVolume(pv)
	return &result, nil
}
