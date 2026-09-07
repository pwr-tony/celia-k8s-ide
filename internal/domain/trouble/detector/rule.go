package detector

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/tonymora/celia/internal/domain/resource"
	"github.com/tonymora/celia/internal/domain/trouble"
)

type Rule struct {
	Name           string            `yaml:"name"`
	Enabled        bool              `yaml:"enabled"`
	Description    string            `yaml:"description"`
	ResourceType   string            `yaml:"resourceType"`
	Severity       string            `yaml:"severity"`
	ProblemType    string            `yaml:"problemType"`
	Conditions     []Condition       `yaml:"conditions"`
	Title          string            `yaml:"title"`
	Message        string            `yaml:"message"`
	PossibleCauses []string          `yaml:"possibleCauses"`
	Suggestions    []string          `yaml:"suggestions"`
	Labels         map[string]string `yaml:"labels"`
}

type Condition struct {
	Field    string `yaml:"field"`
	Operator string `yaml:"operator"`
	Value    string `yaml:"value"`
}

type RuleSet struct {
	Version string `yaml:"version"`
	Rules   []Rule `yaml:"rules"`
}

func (r *Rule) Evaluate(input DetectorInput) []trouble.Problem {
	var problems []trouble.Problem

	switch strings.ToLower(r.ResourceType) {
	case "pod", "pods":
		for _, pod := range input.Pods {
			if r.matchesPod(pod) {
				problem := r.createProblem("Pod", pod.Namespace, pod.Name, pod)
				if problem != nil {
					problems = append(problems, *problem)
				}
			}
		}
	case "deployment", "deployments":
		for _, dep := range input.Deployments {
			if r.matchesDeployment(dep) {
				problem := r.createProblem("Deployment", dep.Namespace, dep.Name, dep)
				if problem != nil {
					problems = append(problems, *problem)
				}
			}
		}
	case "node", "nodes":
		for _, node := range input.Nodes {
			if r.matchesNode(node) {
				problem := r.createProblem("Node", "", node.Name, node)
				if problem != nil {
					problems = append(problems, *problem)
				}
			}
		}
	}

	return problems
}

func (r *Rule) matchesPod(pod resource.Pod) bool {
	for _, cond := range r.Conditions {
		if !r.evaluateCondition(cond, podFieldGetter(pod)) {
			return false
		}
	}
	return true
}

func (r *Rule) matchesDeployment(dep resource.Deployment) bool {
	for _, cond := range r.Conditions {
		if !r.evaluateCondition(cond, deploymentFieldGetter(dep)) {
			return false
		}
	}
	return true
}

func (r *Rule) matchesNode(node resource.Node) bool {
	for _, cond := range r.Conditions {
		if !r.evaluateCondition(cond, nodeFieldGetter(node)) {
			return false
		}
	}
	return true
}

func (r *Rule) evaluateCondition(cond Condition, getValue func(string) (interface{}, bool)) bool {
	val, exists := getValue(cond.Field)

	switch strings.ToLower(cond.Operator) {
	case "exists":
		return exists
	case "notexists", "not_exists":
		return !exists
	case "eq", "==", "equals":
		return fmt.Sprintf("%v", val) == cond.Value
	case "ne", "!=", "notequals", "not_equals":
		return fmt.Sprintf("%v", val) != cond.Value
	case "contains":
		return strings.Contains(fmt.Sprintf("%v", val), cond.Value)
	case "notcontains", "not_contains":
		return !strings.Contains(fmt.Sprintf("%v", val), cond.Value)
	case "startswith", "starts_with":
		return strings.HasPrefix(fmt.Sprintf("%v", val), cond.Value)
	case "endswith", "ends_with":
		return strings.HasSuffix(fmt.Sprintf("%v", val), cond.Value)
	case "matches", "regex":
		re, err := regexp.Compile(cond.Value)
		if err != nil {
			return false
		}
		return re.MatchString(fmt.Sprintf("%v", val))
	case "gt", ">":
		return compareNumbers(val, cond.Value) > 0
	case "gte", ">=":
		return compareNumbers(val, cond.Value) >= 0
	case "lt", "<":
		return compareNumbers(val, cond.Value) < 0
	case "lte", "<=":
		return compareNumbers(val, cond.Value) <= 0
	case "in":
		valStr := fmt.Sprintf("%v", val)
		for _, v := range strings.Split(cond.Value, ",") {
			if strings.TrimSpace(v) == valStr {
				return true
			}
		}
		return false
	case "notin", "not_in":
		valStr := fmt.Sprintf("%v", val)
		for _, v := range strings.Split(cond.Value, ",") {
			if strings.TrimSpace(v) == valStr {
				return false
			}
		}
		return true
	default:
		return fmt.Sprintf("%v", val) == cond.Value
	}
}

func compareNumbers(val interface{}, threshold string) int {
	var numVal float64
	switch v := val.(type) {
	case int:
		numVal = float64(v)
	case int32:
		numVal = float64(v)
	case int64:
		numVal = float64(v)
	case float32:
		numVal = float64(v)
	case float64:
		numVal = v
	case string:
		parsed, err := strconv.ParseFloat(v, 64)
		if err != nil {
			return 0
		}
		numVal = parsed
	default:
		return 0
	}

	thresholdVal, err := strconv.ParseFloat(threshold, 64)
	if err != nil {
		return 0
	}

	if numVal > thresholdVal {
		return 1
	} else if numVal < thresholdVal {
		return -1
	}
	return 0
}

func (r *Rule) createProblem(kind, namespace, name string, res interface{}) *trouble.Problem {
	problemType := r.getProblemType()
	problem := trouble.NewProblem(problemType, kind, namespace, name)

	problem.SetSeverity(r.getSeverity())

	title := r.interpolate(r.Title, kind, namespace, name, res)
	if title != "" {
		problem.SetTitle(title)
	}

	desc := r.interpolate(r.Message, kind, namespace, name, res)
	if desc != "" {
		problem.SetDescription(desc)
	}

	for _, cause := range r.PossibleCauses {
		problem.AddCause(r.interpolate(cause, kind, namespace, name, res))
	}

	for _, suggestion := range r.Suggestions {
		problem.AddSuggestion(r.interpolate(suggestion, kind, namespace, name, res))
	}

	return problem
}

func (r *Rule) interpolate(template, kind, namespace, name string, res interface{}) string {
	result := template
	result = strings.ReplaceAll(result, "{{.Kind}}", kind)
	result = strings.ReplaceAll(result, "{{.Namespace}}", namespace)
	result = strings.ReplaceAll(result, "{{.Name}}", name)
	result = strings.ReplaceAll(result, "{{.RuleName}}", r.Name)

	if pod, ok := res.(resource.Pod); ok {
		result = strings.ReplaceAll(result, "{{.Phase}}", string(pod.Phase))
		result = strings.ReplaceAll(result, "{{.Status}}", pod.Status)
		result = strings.ReplaceAll(result, "{{.RestartCount}}", fmt.Sprintf("%d", pod.RestartCount))
		result = strings.ReplaceAll(result, "{{.NodeName}}", pod.NodeName)
	}

	if dep, ok := res.(resource.Deployment); ok {
		result = strings.ReplaceAll(result, "{{.Replicas}}", fmt.Sprintf("%d", dep.Replicas))
		result = strings.ReplaceAll(result, "{{.ReadyReplicas}}", fmt.Sprintf("%d", dep.ReadyReplicas))
		result = strings.ReplaceAll(result, "{{.AvailableReplicas}}", fmt.Sprintf("%d", dep.AvailableReplicas))
	}

	if node, ok := res.(resource.Node); ok {
		result = strings.ReplaceAll(result, "{{.NodeName}}", node.Name)
		result = strings.ReplaceAll(result, "{{.KubeletVersion}}", node.KubeletVersion)
	}

	return result
}

func (r *Rule) getSeverity() trouble.Severity {
	switch strings.ToLower(r.Severity) {
	case "critical":
		return trouble.SeverityCritical
	case "high":
		return trouble.SeverityHigh
	case "medium":
		return trouble.SeverityMedium
	case "low":
		return trouble.SeverityLow
	default:
		return trouble.SeverityMedium
	}
}

func (r *Rule) getProblemType() trouble.ProblemType {
	switch strings.ToLower(r.ProblemType) {
	case "crashloop", "crashloopbackoff":
		return trouble.ProblemTypeCrashLoop
	case "imagepull", "imagepullbackoff":
		return trouble.ProblemTypeImagePull
	case "oomkilled":
		return trouble.ProblemTypeOOMKilled
	case "probefailing":
		return trouble.ProblemTypeProbeFailing
	case "pending":
		return trouble.ProblemTypePending
	case "nodenotready":
		return trouble.ProblemTypeNodeNotReady
	case "nodepressure":
		return trouble.ProblemTypeNodePressure
	case "nodeunschedulable":
		return trouble.ProblemTypeNodeUnschedulable
	case "highrestartcount":
		return trouble.ProblemTypeHighRestart
	case "containererror":
		return trouble.ProblemTypeContainerError
	case "resourcequotaexceeded", "resourcequota":
		return trouble.ProblemTypeResourceQuota
	case "failedscheduling":
		return trouble.ProblemTypeFailedScheduling
	case "evicted":
		return trouble.ProblemTypeEvicted
	default:
		return trouble.ProblemTypeContainerError
	}
}

func podFieldGetter(pod resource.Pod) func(string) (interface{}, bool) {
	return func(field string) (interface{}, bool) {
		switch strings.ToLower(field) {
		case "name":
			return pod.Name, true
		case "namespace":
			return pod.Namespace, true
		case "phase":
			return string(pod.Phase), true
		case "status":
			return pod.Status, true
		case "restartcount":
			return pod.RestartCount, true
		case "nodename":
			return pod.NodeName, pod.NodeName != ""
		case "hostip":
			return pod.HostIP, pod.HostIP != ""
		case "podip":
			return pod.PodIP, pod.PodIP != ""
		case "containercount":
			return len(pod.Containers), true
		case "age":
			return int(pod.Age().Seconds()), true
		}

		if strings.HasPrefix(strings.ToLower(field), "label.") {
			labelKey := field[6:]
			if val, ok := pod.Labels[labelKey]; ok {
				return val, true
			}
			return "", false
		}

		if strings.HasPrefix(strings.ToLower(field), "annotation.") {
			annoKey := field[11:]
			if val, ok := pod.Annotations[annoKey]; ok {
				return val, true
			}
			return "", false
		}

		return nil, false
	}
}

func deploymentFieldGetter(dep resource.Deployment) func(string) (interface{}, bool) {
	return func(field string) (interface{}, bool) {
		switch strings.ToLower(field) {
		case "name":
			return dep.Name, true
		case "namespace":
			return dep.Namespace, true
		case "replicas":
			return dep.Replicas, true
		case "readyreplicas":
			return dep.ReadyReplicas, true
		case "availablereplicas":
			return dep.AvailableReplicas, true
		case "unavailablereplicas":
			return dep.Replicas - dep.AvailableReplicas, true
		case "age":
			return int(dep.Age().Seconds()), true
		}

		if strings.HasPrefix(strings.ToLower(field), "label.") {
			labelKey := field[6:]
			if val, ok := dep.Labels[labelKey]; ok {
				return val, true
			}
			return "", false
		}

		return nil, false
	}
}

func nodeFieldGetter(node resource.Node) func(string) (interface{}, bool) {
	return func(field string) (interface{}, bool) {
		switch strings.ToLower(field) {
		case "name":
			return node.Name, true
		case "ready":
			return node.IsReady(), true
		case "unschedulable":
			return node.Unschedulable, true
		case "kubeletversion":
			return node.KubeletVersion, true
		case "containerruntimeversion":
			return node.ContainerRuntimeVersion, true
		case "osimage":
			return node.OSImage, true
		case "architecture":
			return node.Architecture, true
		case "podcapacity":
			return node.Capacity.Pods, node.Capacity.Pods != ""
		}

		if strings.HasPrefix(strings.ToLower(field), "label.") {
			labelKey := field[6:]
			if val, ok := node.Labels[labelKey]; ok {
				return val, true
			}
			return "", false
		}

		if strings.HasPrefix(strings.ToLower(field), "condition.") {
			condName := field[10:]
			cond := node.GetCondition(condName)
			if cond != nil {
				return cond.Status, true
			}
			return "", false
		}

		return nil, false
	}
}
