package detector

import (
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type HighRestartDetector struct {
	BaseDetector
	restartThreshold int32
}

func NewHighRestartDetector() *HighRestartDetector {
	return &HighRestartDetector{
		BaseDetector: BaseDetector{
			name:    "high_restart",
			enabled: true,
		},
		restartThreshold: 5,
	}
}

func (d *HighRestartDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, pod := range input.Pods {
		if pod.Phase != resource.PodPhaseRunning {
			continue
		}

		if pod.HasCrashLoopBackOff() {
			continue
		}

		if pod.RestartCount < d.restartThreshold {
			continue
		}

		var maxRestartContainer *resource.Container
		var maxRestarts int32 = 0
		for i := range pod.Containers {
			c := &pod.Containers[i]
			if c.RestartCount > maxRestarts {
				maxRestarts = c.RestartCount
				maxRestartContainer = c
			}
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeHighRestart,
			"Pod",
			pod.Namespace,
			pod.Name,
		)

		if pod.RestartCount >= 20 {
			problem.SetSeverity(trouble.SeverityHigh)
		} else if pod.RestartCount >= 10 {
			problem.SetSeverity(trouble.SeverityMedium)
		} else {
			problem.SetSeverity(trouble.SeverityLow)
		}

		if maxRestartContainer != nil {
			problem.SetTitle(fmt.Sprintf("High Restarts: %s (%d)", pod.Name, pod.RestartCount))
			problem.SetDescription(fmt.Sprintf(
				"Container '%s' has restarted %d times. This indicates potential stability issues.",
				maxRestartContainer.Name,
				maxRestartContainer.RestartCount,
			))

			if maxRestartContainer.LastState.Type == resource.ContainerStateTerminated {
				reason := maxRestartContainer.LastState.Reason
				if reason != "" {
					problem.AddCause(fmt.Sprintf("Last termination reason: %s", reason))
				}
				if maxRestartContainer.LastState.ExitCode != 0 {
					problem.AddCause(fmt.Sprintf("Last exit code: %d", maxRestartContainer.LastState.ExitCode))
				}
			}
		} else {
			problem.SetTitle(fmt.Sprintf("High Restarts: %s (%d)", pod.Name, pod.RestartCount))
			problem.SetDescription(fmt.Sprintf(
				"Pod has %d total container restarts. This indicates potential stability issues.",
				pod.RestartCount,
			))
		}

		problem.AddSuggestion("Review container logs for recurring errors")
		problem.AddSuggestion("Check if resource limits are too restrictive")
		problem.AddSuggestion("Verify application health and startup behavior")
		problem.AddSuggestion("Consider implementing proper graceful shutdown")

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
