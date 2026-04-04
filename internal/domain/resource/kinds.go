package resource

type Kind string

const (
	KindPod                   Kind = "Pod"
	KindDeployment            Kind = "Deployment"
	KindReplicaSet            Kind = "ReplicaSet"
	KindStatefulSet           Kind = "StatefulSet"
	KindDaemonSet             Kind = "DaemonSet"
	KindService               Kind = "Service"
	KindIngress               Kind = "Ingress"
	KindConfigMap             Kind = "ConfigMap"
	KindSecret                Kind = "Secret"
	KindPersistentVolume      Kind = "PersistentVolume"
	KindPersistentVolumeClaim Kind = "PersistentVolumeClaim"
	KindNamespace             Kind = "Namespace"
	KindNode                  Kind = "Node"
	KindEvent                 Kind = "Event"
	KindJob                   Kind = "Job"
	KindCronJob               Kind = "CronJob"
	KindServiceAccount        Kind = "ServiceAccount"
	KindRole                  Kind = "Role"
	KindRoleBinding           Kind = "RoleBinding"
	KindClusterRole           Kind = "ClusterRole"
	KindClusterRoleBinding    Kind = "ClusterRoleBinding"
	KindNetworkPolicy         Kind = "NetworkPolicy"
	KindHorizontalPodAutoscaler Kind = "HorizontalPodAutoscaler"
)

func (k Kind) String() string {
	return string(k)
}

func (k Kind) IsNamespaced() bool {
	switch k {
	case KindNode, KindNamespace, KindPersistentVolume, KindClusterRole, KindClusterRoleBinding:
		return false
	default:
		return true
	}
}

func (k Kind) Plural() string {
	plurals := map[Kind]string{
		KindPod:                     "pods",
		KindDeployment:              "deployments",
		KindReplicaSet:              "replicasets",
		KindStatefulSet:             "statefulsets",
		KindDaemonSet:               "daemonsets",
		KindService:                 "services",
		KindIngress:                 "ingresses",
		KindConfigMap:               "configmaps",
		KindSecret:                  "secrets",
		KindPersistentVolume:        "persistentvolumes",
		KindPersistentVolumeClaim:   "persistentvolumeclaims",
		KindNamespace:               "namespaces",
		KindNode:                    "nodes",
		KindEvent:                   "events",
		KindJob:                     "jobs",
		KindCronJob:                 "cronjobs",
		KindServiceAccount:          "serviceaccounts",
		KindRole:                    "roles",
		KindRoleBinding:             "rolebindings",
		KindClusterRole:             "clusterroles",
		KindClusterRoleBinding:      "clusterrolebindings",
		KindNetworkPolicy:           "networkpolicies",
		KindHorizontalPodAutoscaler: "horizontalpodautoscalers",
	}
	if p, ok := plurals[k]; ok {
		return p
	}
	return string(k) + "s"
}

func (k Kind) APIGroup() string {
	groups := map[Kind]string{
		KindDeployment:              "apps",
		KindReplicaSet:              "apps",
		KindStatefulSet:             "apps",
		KindDaemonSet:               "apps",
		KindIngress:                 "networking.k8s.io",
		KindNetworkPolicy:           "networking.k8s.io",
		KindJob:                     "batch",
		KindCronJob:                 "batch",
		KindRole:                    "rbac.authorization.k8s.io",
		KindRoleBinding:             "rbac.authorization.k8s.io",
		KindClusterRole:             "rbac.authorization.k8s.io",
		KindClusterRoleBinding:      "rbac.authorization.k8s.io",
		KindHorizontalPodAutoscaler: "autoscaling",
	}
	if g, ok := groups[k]; ok {
		return g
	}
	return ""
}

func SupportedKinds() []Kind {
	return []Kind{
		KindPod,
		KindDeployment,
		KindReplicaSet,
		KindStatefulSet,
		KindDaemonSet,
		KindService,
		KindIngress,
		KindConfigMap,
		KindSecret,
		KindPersistentVolume,
		KindPersistentVolumeClaim,
		KindNamespace,
		KindNode,
		KindEvent,
		KindJob,
		KindCronJob,
		KindServiceAccount,
	}
}

func ParseKind(s string) (Kind, bool) {
	for _, k := range SupportedKinds() {
		if string(k) == s {
			return k, true
		}
	}
	return "", false
}
