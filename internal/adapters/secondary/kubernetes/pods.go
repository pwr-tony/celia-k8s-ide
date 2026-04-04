package kubernetes

import (
	"context"
	"fmt"
	"io"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/ports/outbound"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) ListPods(ctx context.Context, namespace string) ([]resource.Pod, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pods, err := clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	result := make([]resource.Pod, len(pods.Items))
	for i := range pods.Items {
		result[i] = mapPod(&pods.Items[i])
	}

	return result, nil
}

func (a *Adapter) GetPod(ctx context.Context, namespace, name string) (*resource.Pod, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pod, err := clientset.CoreV1().Pods(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get pod: %w", err)
	}

	result := mapPod(pod)
	return &result, nil
}

func (a *Adapter) DeletePod(ctx context.Context, namespace, name string, gracePeriod *int64) error {
	clientset, err := a.getClientset()
	if err != nil {
		return err
	}

	deleteOptions := metav1.DeleteOptions{}
	if gracePeriod != nil {
		deleteOptions.GracePeriodSeconds = gracePeriod
	}

	err = clientset.CoreV1().Pods(namespace).Delete(ctx, name, deleteOptions)
	if err != nil {
		return fmt.Errorf("failed to delete pod: %w", err)
	}

	return nil
}

func (a *Adapter) GetPodLogs(ctx context.Context, namespace, pod, container string, opts outbound.LogOptions) (io.ReadCloser, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	podLogOpts := &corev1.PodLogOptions{
		Container:  container,
		Follow:     opts.Follow,
		Timestamps: opts.Timestamps,
		Previous:   opts.Previous,
	}

	if opts.TailLines > 0 {
		podLogOpts.TailLines = &opts.TailLines
	}

	if opts.Since > 0 {
		seconds := int64(opts.Since.Seconds())
		podLogOpts.SinceSeconds = &seconds
	}

	req := clientset.CoreV1().Pods(namespace).GetLogs(pod, podLogOpts)
	stream, err := req.Stream(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get pod logs: %w", err)
	}

	return stream, nil
}
