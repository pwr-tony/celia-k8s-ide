package detector

import (
	"fmt"
	"strings"
	"time"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type ProbeFailingDetector struct {
	BaseDetector
	eventThreshold time.Duration
}

func NewProbeFailingDetector() *ProbeFailingDetector {
	return &ProbeFailingDetector{
		BaseDetector: BaseDetector{
			name:    "probe_failing",
			enabled: true,
		},
		eventThreshold: 10 * time.Minute,
	}
}

func (d *ProbeFailingDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	probeFailures := make(map[string][]resource.Event)
	for _, event := range input.Events {
		if event.InvolvedKind != "Pod" {
			continue
		}
		if event.Reason != "Unhealthy" {
			continue
		}
		if time.Since(event.LastTimestamp) > d.eventThreshold {
			continue
		}

		key := event.InvolvedNamespace + "/" + event.InvolvedName
		probeFailures[key] = append(probeFailures[key], event)
	}

	for _, pod := range input.Pods {
		if pod.Phase != resource.PodPhaseRunning {
			continue
		}

		key := pod.Namespace + "/" + pod.Name
		events, hasFailures := probeFailures[key]
		if !hasFailures {
			continue
		}

		probeType := "health"
		for _, event := range events {
			msg := strings.ToLower(event.Message)
			if strings.Contains(msg, "liveness") {
				probeType = "liveness"
				break
			} else if strings.Contains(msg, "readiness") {
				probeType = "readiness"
			} else if strings.Contains(msg, "startup") && probeType != "readiness" {
				probeType = "startup"
			}
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeProbeFailing,
			"Pod",
			pod.Namespace,
			pod.Name,
		)

		problem.SetTitle(fmt.Sprintf("Probe Failing: %s (%s)", pod.Name, probeType))
		problem.SetDescription(fmt.Sprintf(
			"%s probe is failing. This may indicate the application is unhealthy.",
			strings.Title(probeType),
		))

		switch probeType {
		case "liveness":
			problem.SetSeverity(trouble.SeverityHigh)
			problem.AddCause("Liveness probe failure will cause the container to restart")
		case "readiness":
			problem.SetSeverity(trouble.SeverityMedium)
			problem.AddCause("Readiness probe failure removes the pod from service endpoints")
		case "startup":
			problem.SetSeverity(trouble.SeverityMedium)
			problem.AddCause("Startup probe failure indicates the application failed to start in time")
		}

		for _, event := range events {
			problem.AddCause(event.Message)
			problem.AddRelatedEvent(event.UID)
		}

		problem.AddSuggestion("Check application logs for errors")
		problem.AddSuggestion("Verify the probe endpoint is responding correctly")
		problem.AddSuggestion("Consider increasing probe timeout or failure threshold")
		problem.AddSuggestion("Check if the application is under heavy load")

		if pod.NodeName != "" {
			problem.AffectedNode = pod.NodeName
		}

		problems = append(problems, *problem)
	}

	return problems
}
