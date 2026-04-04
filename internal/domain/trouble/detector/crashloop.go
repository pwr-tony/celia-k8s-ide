package detector

import (
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type CrashLoopDetector struct {
	BaseDetector
}

func NewCrashLoopDetector() *CrashLoopDetector {
	return &CrashLoopDetector{
		BaseDetector: BaseDetector{
			name:    "crashloop",
			enabled: true,
		},
	}
}

func (d *CrashLoopDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, pod := range input.Pods {
		if !pod.HasCrashLoopBackOff() {
			continue
		}

		var crashingContainer *resource.Container
		for i := range pod.Containers {
			c := &pod.Containers[i]
			if c.State.Type == resource.ContainerStateWaiting && c.State.Reason == "CrashLoopBackOff" {
				crashingContainer = c
				break
			}
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeCrashLoop,
			"Pod",
			pod.Namespace,
			pod.Name,
		)

		if crashingContainer != nil {
			problem.SetTitle(fmt.Sprintf("CrashLoopBackOff: %s/%s", pod.Name, crashingContainer.Name))
			problem.SetDescription(fmt.Sprintf(
				"Container '%s' is repeatedly crashing. Restart count: %d",
				crashingContainer.Name,
				crashingContainer.RestartCount,
			))

			if crashingContainer.LastState.Type == resource.ContainerStateTerminated {
				if crashingContainer.LastState.ExitCode != 0 {
					problem.AddCause(fmt.Sprintf(
						"Container exited with code %d: %s",
						crashingContainer.LastState.ExitCode,
						crashingContainer.LastState.Message,
					))
				}
			}
		}

		problem.AddSuggestion("Check container logs for error messages")
		problem.AddSuggestion("Verify the container command and arguments")
		problem.AddSuggestion("Check if the application is crashing on startup")
		problem.AddSuggestion("Ensure all required environment variables are set")

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
