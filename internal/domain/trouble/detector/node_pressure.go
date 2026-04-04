package detector

import (
	"fmt"

	"github.com/tonymora/celia/internal/domain/trouble"
)

type NodePressureDetector struct {
	BaseDetector
}

func NewNodePressureDetector() *NodePressureDetector {
	return &NodePressureDetector{
		BaseDetector: BaseDetector{
			name:    "node_pressure",
			enabled: true,
		},
	}
}

func (d *NodePressureDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, node := range input.Nodes {
		pressureConditions := []struct {
			condType string
			label    string
			check    func() bool
		}{
			{"MemoryPressure", "Memory", node.HasMemoryPressure},
			{"DiskPressure", "Disk", node.HasDiskPressure},
			{"PIDPressure", "PID", node.HasPIDPressure},
		}

		for _, pc := range pressureConditions {
			if !pc.check() {
				continue
			}

			problem := trouble.NewProblem(
				trouble.ProblemTypeNodePressure,
				"Node",
				"",
				node.Name,
			)
			problem.SetSeverity(trouble.SeverityHigh)
			problem.AffectedNode = node.Name

			cond := node.GetCondition(pc.condType)
			problem.SetTitle(fmt.Sprintf("Node %s Pressure: %s", pc.label, node.Name))

			if cond != nil {
				problem.SetDescription(fmt.Sprintf(
					"Node is experiencing %s pressure: %s",
					pc.label,
					cond.Message,
				))
				problem.AddCause(cond.Message)
			} else {
				problem.SetDescription(fmt.Sprintf(
					"Node is experiencing %s pressure",
					pc.label,
				))
			}

			switch pc.condType {
			case "MemoryPressure":
				problem.AddSuggestion("Identify pods consuming excessive memory")
				problem.AddSuggestion("Consider evicting low-priority workloads")
				problem.AddSuggestion("Add more memory to the node or add more nodes")
				problem.AddSuggestion("Review pod memory limits and requests")
			case "DiskPressure":
				problem.AddSuggestion("Clean up unused container images: crictl rmi --prune")
				problem.AddSuggestion("Remove unused volumes and logs")
				problem.AddSuggestion("Check for pods with excessive logging")
				problem.AddSuggestion("Increase disk space or add more nodes")
			case "PIDPressure":
				problem.AddSuggestion("Identify processes spawning excessive threads")
				problem.AddSuggestion("Review application behavior")
				problem.AddSuggestion("Consider increasing PID limits")
				problem.AddSuggestion("Check for fork bombs or runaway processes")
			}

			for _, pod := range input.Pods {
				if pod.NodeName == node.Name {
					problem.AddRelatedPod(pod.Name)
				}
			}

			for _, event := range input.Events {
				if event.InvolvedKind == "Node" && event.InvolvedName == node.Name {
					problem.AddRelatedEvent(event.UID)
				}
			}

			problems = append(problems, *problem)
		}
	}

	return problems
}
