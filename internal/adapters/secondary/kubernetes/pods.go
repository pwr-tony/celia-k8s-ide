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

func (a *Adapter) PurgePods(ctx context.Context, namespace string, states []string) ([]PurgeResult, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	pods, err := clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	var results []PurgeResult
	for _, pod := range pods.Items {
		shouldDelete := false
		var reason string

		for _, state := range states {
			switch state {
			case "Evicted":
				if pod.Status.Reason == "Evicted" {
					shouldDelete = true
					reason = "Evicted"
				}
			case "Error":
				if pod.Status.Phase == corev1.PodFailed {
					shouldDelete = true
					reason = "Error/Failed"
				}
			case "Completed":
				if pod.Status.Phase == corev1.PodSucceeded {
					shouldDelete = true
					reason = "Completed"
				}
			case "OOMKilled":
				for _, cs := range pod.Status.ContainerStatuses {
					if cs.LastTerminationState.Terminated != nil && cs.LastTerminationState.Terminated.Reason == "OOMKilled" {
						shouldDelete = true
						reason = "OOMKilled"
						break
					}
				}
			case "ContainerStatusUnknown":
				for _, cs := range pod.Status.ContainerStatuses {
					if cs.State.Waiting != nil && cs.State.Waiting.Reason == "ContainerStatusUnknown" {
						shouldDelete = true
						reason = "ContainerStatusUnknown"
						break
					}
				}
			case "Terminating":
				if pod.DeletionTimestamp != nil {
					shouldDelete = true
					reason = "Terminating"
				}
			case "PodInitializing":
				for _, cs := range pod.Status.ContainerStatuses {
					if cs.State.Waiting != nil && cs.State.Waiting.Reason == "PodInitializing" {
						shouldDelete = true
						reason = "PodInitializing"
						break
					}
				}
			}
			if shouldDelete {
				break
			}
		}

		if shouldDelete {
			result := PurgeResult{
				Namespace: pod.Namespace,
				Name:      pod.Name,
				Reason:    reason,
			}

			gracePeriod := int64(0)
			err := clientset.CoreV1().Pods(pod.Namespace).Delete(ctx, pod.Name, metav1.DeleteOptions{
				GracePeriodSeconds: &gracePeriod,
			})
			if err != nil {
				result.Error = err.Error()
				result.Deleted = false
			} else {
				result.Deleted = true
			}

			results = append(results, result)
		}
	}

	return results, nil
}

type PurgeResult struct {
	Namespace string
	Name      string
	Reason    string
	Deleted   bool
	Error     string
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
