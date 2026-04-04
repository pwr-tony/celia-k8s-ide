package kubernetes

import (
	"context"
	"fmt"
	"time"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

func (a *Adapter) ListDeployments(ctx context.Context, namespace string) ([]resource.Deployment, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	deployments, err := clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}

	result := make([]resource.Deployment, len(deployments.Items))
	for i := range deployments.Items {
		result[i] = mapDeployment(&deployments.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetDeployment(ctx context.Context, namespace, name string) (*resource.Deployment, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	deployment, err := clientset.AppsV1().Deployments(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get deployment: %w", err)
	}

	result := mapDeployment(deployment)
	return &result, nil
}

func (a *Adapter) ScaleDeployment(ctx context.Context, namespace, name string, replicas int32) error {
	clientset, err := a.getClientset()
	if err != nil {
		return err
	}

	scale, err := clientset.AppsV1().Deployments(namespace).GetScale(ctx, name, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get deployment scale: %w", err)
	}

	scale.Spec.Replicas = replicas

	_, err = clientset.AppsV1().Deployments(namespace).UpdateScale(ctx, name, scale, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to scale deployment: %w", err)
	}

	return nil
}

func (a *Adapter) RolloutRestart(ctx context.Context, kind resource.Kind, namespace, name string) error {
	clientset, err := a.getClientset()
	if err != nil {
		return err
	}

	patch := []byte(fmt.Sprintf(`{"spec":{"template":{"metadata":{"annotations":{"kubectl.kubernetes.io/restartedAt":"%s"}}}}}`, time.Now().Format(time.RFC3339)))

	switch kind {
	case resource.KindDeployment:
		_, err = clientset.AppsV1().Deployments(namespace).Patch(
			ctx,
			name,
			types.StrategicMergePatchType,
			patch,
			metav1.PatchOptions{},
		)
	case resource.KindStatefulSet:
		_, err = clientset.AppsV1().StatefulSets(namespace).Patch(
			ctx,
			name,
			types.StrategicMergePatchType,
			patch,
			metav1.PatchOptions{},
		)
	case resource.KindDaemonSet:
		_, err = clientset.AppsV1().DaemonSets(namespace).Patch(
			ctx,
			name,
			types.StrategicMergePatchType,
			patch,
			metav1.PatchOptions{},
		)
	default:
		return fmt.Errorf("unsupported resource kind for rollout restart: %s", kind)
	}

	if err != nil {
		return fmt.Errorf("failed to rollout restart: %w", err)
	}

	return nil
}
