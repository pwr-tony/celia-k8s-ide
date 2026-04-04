package kubernetes

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListNamespaces(ctx context.Context) ([]string, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	namespaces, err := clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	names := make([]string, len(namespaces.Items))
	for i, ns := range namespaces.Items {
		names[i] = ns.Name
	}

	return names, nil
}
