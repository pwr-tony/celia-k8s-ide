package detector

import (
	"fmt"
	"time"

	"github.com/tonymora/celia/internal/domain/trouble"
)

type NodeNotReadyDetector struct {
	BaseDetector
}

func NewNodeNotReadyDetector() *NodeNotReadyDetector {
	return &NodeNotReadyDetector{
		BaseDetector: BaseDetector{
			name:    "node_notready",
			enabled: true,
		},
	}
}

func (d *NodeNotReadyDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, node := range input.Nodes {
		if node.IsReady() {
			continue
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeNodeNotReady,
			"Node",
			"",
			node.Name,
		)
		problem.SetSeverity(trouble.SeverityCritical)
		problem.AffectedNode = node.Name

		readyCond := node.GetCondition("Ready")
		if readyCond != nil {
			notReadyDuration := time.Since(readyCond.LastTransitionTime)
			problem.SetTitle(fmt.Sprintf("Node NotReady: %s", node.Name))
			problem.SetDescription(fmt.Sprintf(
				"Node has been NotReady for %s. Reason: %s",
				notReadyDuration.Round(time.Second),
				readyCond.Message,
			))
			problem.AddCause(readyCond.Message)
		}

		affectedPods := 0
		for _, pod := range input.Pods {
			if pod.NodeName == node.Name {
				affectedPods++
				problem.AddRelatedPod(pod.Name)
			}
		}
		if affectedPods > 0 {
			problem.AddCause(fmt.Sprintf("%d pods are running on this node", affectedPods))
		}

		for _, event := range input.Events {
			if event.InvolvedKind == "Node" && event.InvolvedName == node.Name {
				problem.AddRelatedEvent(event.UID)
			}
		}

		problem.AddSuggestion("Check kubelet status on the node: systemctl status kubelet")
		problem.AddSuggestion("Review kubelet logs: journalctl -u kubelet")
		problem.AddSuggestion("Check node connectivity and network issues")
		problem.AddSuggestion("Verify node has sufficient resources (CPU, memory, disk)")
		problem.AddSuggestion("Check if container runtime is healthy")

		problems = append(problems, *problem)
	}

	return problems
}
