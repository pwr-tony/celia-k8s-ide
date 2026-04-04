package detector

import (
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type ImagePullDetector struct {
	BaseDetector
}

func NewImagePullDetector() *ImagePullDetector {
	return &ImagePullDetector{
		BaseDetector: BaseDetector{
			name:    "imagepull",
			enabled: true,
		},
	}
}

func (d *ImagePullDetector) Detect(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	for _, pod := range input.Pods {
		if !pod.HasImagePullBackOff() {
			continue
		}

		var problemContainer *resource.Container
		for i := range pod.Containers {
			c := &pod.Containers[i]
			if c.State.Type == resource.ContainerStateWaiting {
				if c.State.Reason == "ImagePullBackOff" || c.State.Reason == "ErrImagePull" {
					problemContainer = c
					break
				}
			}
		}

		if problemContainer == nil {
			for i := range pod.InitContainers {
				c := &pod.InitContainers[i]
				if c.State.Type == resource.ContainerStateWaiting {
					if c.State.Reason == "ImagePullBackOff" || c.State.Reason == "ErrImagePull" {
						problemContainer = c
						break
					}
				}
			}
		}

		problem := trouble.NewProblem(
			trouble.ProblemTypeImagePull,
			"Pod",
			pod.Namespace,
			pod.Name,
		)

		if problemContainer != nil {
			problem.SetTitle(fmt.Sprintf("ImagePullBackOff: %s", problemContainer.Image))
			problem.SetDescription(fmt.Sprintf(
				"Unable to pull image '%s': %s",
				problemContainer.Image,
				problemContainer.State.Message,
			))

			message := problemContainer.State.Message
			if message != "" {
				problem.AddCause(message)
			}
		}

		problem.AddSuggestion("Verify the image name and tag are correct")
		problem.AddSuggestion("Check if the image exists in the registry")
		problem.AddSuggestion("Verify image pull secrets are configured correctly")
		problem.AddSuggestion("Check if the registry is accessible from the cluster")
		problem.AddSuggestion("If using a private registry, ensure authentication is configured")

		for _, event := range input.Events {
			if event.InvolvedKind == "Pod" &&
				event.InvolvedName == pod.Name &&
				event.InvolvedNamespace == pod.Namespace &&
				(event.Reason == "Failed" || event.Reason == "ErrImagePull" || event.Reason == "ImagePullBackOff") {
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
