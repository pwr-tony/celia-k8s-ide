package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
)

func (a *Adapter) ListEvents(ctx context.Context, namespace string) ([]resource.Event, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	events, err := clientset.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list events: %w", err)
	}

	result := make([]resource.Event, len(events.Items))
	for i := range events.Items {
		result[i] = mapEvent(&events.Items[i])
	}

	return result, nil
}

func (a *Adapter) ListEventsForResource(ctx context.Context, kind, namespace, name string) ([]resource.Event, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	fieldSelector := fmt.Sprintf("involvedObject.kind=%s,involvedObject.name=%s", kind, name)
	if namespace != "" {
		fieldSelector += fmt.Sprintf(",involvedObject.namespace=%s", namespace)
	}

	events, err := clientset.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{
		FieldSelector: fieldSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list events: %w", err)
	}

	result := make([]resource.Event, len(events.Items))
	for i := range events.Items {
		result[i] = mapEvent(&events.Items[i])
	}

	return result, nil
}

func (a *Adapter) WatchEvents(ctx context.Context, namespace string) (<-chan resource.Event, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	watcher, err := clientset.CoreV1().Events(namespace).Watch(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to watch events: %w", err)
	}

	eventChan := make(chan resource.Event, 100)

	go func() {
		defer close(eventChan)
		defer watcher.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case watchEvent, ok := <-watcher.ResultChan():
				if !ok {
					return
				}

				if watchEvent.Type == watch.Error {
					continue
				}

				if event, ok := watchEvent.Object.(*corev1.Event); ok {
					eventChan <- mapEvent(event)
				}
			}
		}
	}()

	return eventChan, nil
}
