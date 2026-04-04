package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListNodes(ctx context.Context) ([]resource.Node, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	nodes, err := clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list nodes: %w", err)
	}

	result := make([]resource.Node, len(nodes.Items))
	for i := range nodes.Items {
		result[i] = mapNode(&nodes.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetNode(ctx context.Context, name string) (*resource.Node, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	node, err := clientset.CoreV1().Nodes().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get node: %w", err)
	}

	result := mapNode(node)
	return &result, nil
}
