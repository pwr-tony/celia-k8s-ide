package detector

import (
	"fmt"
	"time"

	"github.com/tonymora/celia/internal/domain/trouble"
)

type PendingDetector struct {
	BaseDetector
	pendingThreshold time.Duration
}

func NewPendingDetector() *PendingDetector {
	return &PendingDetector{
		BaseDetector: BaseDetector{
			name:    "pending",
			enabled: true,
		},
		pendingThreshold: 2 * time.Minute,
	}
}

func (d *PendingDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, pod := range input.Pods {
		if !pod.IsPending() {
			continue
		}

		pendingDuration := time.Since(pod.CreatedAt)
		if pendingDuration < d.pendingThreshold {
			continue
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypePending,
			"Pod",
			pod.Namespace,
			pod.Name,
		)

		problem.SetTitle(fmt.Sprintf("Pending: %s", pod.Name))
		problem.SetDescription(fmt.Sprintf(
			"Pod has been pending for %s",
			pendingDuration.Round(time.Second),
		))

		scheduledCond := pod.GetCondition("PodScheduled")
		if scheduledCond != nil && scheduledCond.Status != "True" {
			problem.AddCause(fmt.Sprintf("Scheduling failed: %s", scheduledCond.Message))

			switch scheduledCond.Reason {
			case "Unschedulable":
				problem.SetSeverity(trouble.SeverityHigh)
				problem.AddSuggestion("Check if nodes have sufficient resources")
				problem.AddSuggestion("Review node selectors and affinity rules")
				problem.AddSuggestion("Check for taints that might prevent scheduling")
			}
		}

		for _, event := range input.Events {
			if event.InvolvedKind == "Pod" &&
				event.InvolvedName == pod.Name &&
				event.InvolvedNamespace == pod.Namespace &&
				event.Reason == "FailedScheduling" {
				problem.AddRelatedEvent(event.UID)
				problem.AddCause(event.Message)
			}
		}

		problem.AddSuggestion("Check cluster resource availability")
		problem.AddSuggestion("Review pod resource requests")
		problem.AddSuggestion("Check PersistentVolumeClaims if the pod uses volumes")
		problem.AddSuggestion("Verify node labels match pod nodeSelector")

		problems = append(problems, *problem)
	}

	return problems
}
