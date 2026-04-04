package resource

import "time"

type EventType string

const (
	EventTypeNormal  EventType = "Normal"
	EventTypeWarning EventType = "Warning"
)

type Event struct {
	Resource

	Type    EventType
	Reason  string
	Message string
	Count   int32

	InvolvedKind      string
	InvolvedNamespace string
	InvolvedName      string
	InvolvedUID       string

	SourceComponent string
	SourceHost      string

	FirstTimestamp time.Time
	LastTimestamp  time.Time
}

func (e *Event) IsWarning() bool {
	return e.Type == EventTypeWarning
}

func (e *Event) IsNormal() bool {
	return e.Type == EventTypeNormal
}

func (e *Event) InvolvedObjectKey() string {
	if e.InvolvedNamespace != "" {
		return e.InvolvedNamespace + "/" + e.InvolvedKind + "/" + e.InvolvedName
	}
	return e.InvolvedKind + "/" + e.InvolvedName
}

func (e *Event) IsRecent(threshold time.Duration) bool {
	return time.Since(e.LastTimestamp) < threshold
}

func (e *Event) Age() time.Duration {
	return time.Since(e.FirstTimestamp)
}

func (e *Event) Duration() time.Duration {
	return e.LastTimestamp.Sub(e.FirstTimestamp)
}

func (e *Event) IsPodEvent() bool {
	return e.InvolvedKind == "Pod"
}

func (e *Event) IsNodeEvent() bool {
	return e.InvolvedKind == "Node"
}

func (e *Event) IsTroublesome() bool {
	if e.Type != EventTypeWarning {
		return false
	}

	troubleReasons := map[string]bool{
		"BackOff":                true,
		"Failed":                 true,
		"FailedScheduling":       true,
		"FailedCreate":           true,
		"FailedMount":            true,
		"FailedAttachVolume":     true,
		"Unhealthy":              true,
		"NodeNotReady":           true,
		"ErrImagePull":           true,
		"ImagePullBackOff":       true,
		"CrashLoopBackOff":       true,
		"OOMKilling":             true,
		"Killing":                true,
		"Evicted":                true,
		"FailedCreatePodSandBox": true,
	}

	return troubleReasons[e.Reason]
}
