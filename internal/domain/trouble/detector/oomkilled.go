package detector

import (
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type OOMKilledDetector struct {
	BaseDetector
}

func NewOOMKilledDetector() *OOMKilledDetector {
	return &OOMKilledDetector{
		BaseDetector: BaseDetector{
			name:    "oomkilled",
			enabled: true,
		},
	}
}

func (d *OOMKilledDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, pod := range input.Pods {
		if !pod.HasOOMKilled() {
			continue
		}

		var oomContainer *resource.Container
		for i := range pod.Containers {
			c := &pod.Containers[i]
			if c.LastState.Type == resource.ContainerStateTerminated && c.LastState.Reason == "OOMKilled" {
				oomContainer = c
				break
			}
			if c.State.Type == resource.ContainerStateTerminated && c.State.Reason == "OOMKilled" {
				oomContainer = c
				break
			}
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeOOMKilled,
			"Pod",
			pod.Namespace,
			pod.Name,
		)
		problem.SetSeverity(trouble.SeverityCritical)

		if oomContainer != nil {
			problem.SetTitle(fmt.Sprintf("OOMKilled: %s/%s", pod.Name, oomContainer.Name))
			problem.SetDescription(fmt.Sprintf(
				"Container '%s' was killed due to out of memory. This container has restarted %d times.",
				oomContainer.Name,
				oomContainer.RestartCount,
			))

			if oomContainer.Resources.MemoryLimit != "" {
				problem.AddCause(fmt.Sprintf(
					"Memory limit is set to %s, which may be insufficient",
					oomContainer.Resources.MemoryLimit,
				))
			} else {
				problem.AddCause("No memory limit is set, container used more memory than available on the node")
			}
		}

		problem.AddSuggestion("Increase the container's memory limit")
		problem.AddSuggestion("Profile the application to identify memory leaks")
		problem.AddSuggestion("Check if the application has proper garbage collection")
		problem.AddSuggestion("Consider horizontal scaling instead of vertical scaling")
		problem.AddSuggestion("Review recent code changes that may have increased memory usage")

		for _, event := range input.Events {
			if event.InvolvedKind == "Pod" &&
				event.InvolvedName == pod.Name &&
				event.InvolvedNamespace == pod.Namespace {
				problem.AddRelatedEvent(event.UID)
			}
		}

		if pod.NodeName != "" {
			problem.AffectedNode = pod.NodeName
		}

		problems = append(problems, *problem)
	}

	return problems
}
