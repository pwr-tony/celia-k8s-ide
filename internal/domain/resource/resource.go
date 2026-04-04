package resource

import "time"

type Resource struct {
	Kind       Kind
	APIVersion string
	Name       string
	Namespace  string
	UID        string
	Labels     map[string]string
	Annotations map[string]string
	CreatedAt  time.Time

	Status     string
	Ready      bool
	Message    string

	OwnerKind  string
	OwnerName  string
	OwnerUID   string

	YAML       string
}

func (r *Resource) GetLabel(key string) string {
	if r.Labels == nil {
		return ""
	}
	return r.Labels[key]
}

func (r *Resource) GetAnnotation(key string) string {
	if r.Annotations == nil {
		return ""
	}
	return r.Annotations[key]
}

func (r *Resource) Age() time.Duration {
	return time.Since(r.CreatedAt)
}

func (r *Resource) HasOwner() bool {
	return r.OwnerUID != ""
}

func (r *Resource) QualifiedName() string {
	if r.Namespace == "" {
		return r.Name
	}
	return r.Namespace + "/" + r.Name
}

type WatchEvent struct {
	Type     WatchEventType
	Resource Resource
}

type WatchEventType string

const (
	WatchEventAdded    WatchEventType = "ADDED"
	WatchEventModified WatchEventType = "MODIFIED"
	WatchEventDeleted  WatchEventType = "DELETED"
	WatchEventError    WatchEventType = "ERROR"
)

type ResourceList struct {
	Kind       Kind
	Items      []Resource
	TotalCount int
	Continue   string
}
