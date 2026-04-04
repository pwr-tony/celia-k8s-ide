package kubernetes

import (
	"context"

	"github.com/tonymora/celia/internal/domain/cluster"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (a *Adapter) GetClusterHealth(ctx context.Context) (*cluster.Health, error) {
	clientset, err := a.getClientset()
	if err != nil {
		return nil, err
	}

	health := cluster.NewHealth()

	nodes, err := clientset.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	health.NodeSummary.Total = len(nodes.Items)
	for _, node := range nodes.Items {
		ready := false
		for _, cond := range node.Status.Conditions {
			if cond.Type == "Ready" && cond.Status == "True" {
				ready = true
				break
			}
		}
		if ready {
			health.NodeSummary.Ready++
		} else {
			health.NodeSummary.NotReady++
		}
	}

	pods, err := clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	health.PodSummary.Total = len(pods.Items)
	for _, pod := range pods.Items {
		switch pod.Status.Phase {
		case "Running":
			health.PodSummary.Running++
		case "Pending":
			health.PodSummary.Pending++
		case "Failed":
			health.PodSummary.Failed++
		case "Succeeded":
			health.PodSummary.Succeeded++
		}
	}

	componentStatuses, err := clientset.CoreV1().ComponentStatuses().List(ctx, metav1.ListOptions{})
	if err == nil {
		for _, cs := range componentStatuses.Items {
			status := cluster.HealthStatusHealthy
			message := ""
			for _, cond := range cs.Conditions {
				if cond.Type == "Healthy" {
					if cond.Status != "True" {
						status = cluster.HealthStatusUnhealthy
					}
					message = cond.Message
					break
				}
			}
			health.AddComponent(cs.Name, status, message)
		}
	}

	health.CalculateStatus()
	return health, nil
}
