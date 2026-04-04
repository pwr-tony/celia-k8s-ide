package trouble

type ProblemType string

const (
	ProblemTypeCrashLoop         ProblemType = "CrashLoopBackOff"
	ProblemTypeImagePull         ProblemType = "ImagePullBackOff"
	ProblemTypeOOMKilled         ProblemType = "OOMKilled"
	ProblemTypeProbeFailing      ProblemType = "ProbeFailing"
	ProblemTypePending           ProblemType = "Pending"
	ProblemTypeNodeNotReady      ProblemType = "NodeNotReady"
	ProblemTypeNodePressure      ProblemType = "NodePressure"
	ProblemTypeNodeUnschedulable ProblemType = "NodeUnschedulable"
	ProblemTypeHighRestart       ProblemType = "HighRestartCount"
	ProblemTypeContainerError    ProblemType = "ContainerError"
	ProblemTypeResourceQuota     ProblemType = "ResourceQuotaExceeded"
	ProblemTypeFailedScheduling  ProblemType = "FailedScheduling"
	ProblemTypeEvicted           ProblemType = "Evicted"
	ProblemTypeUnknown           ProblemType = "Unknown"
)

func (p ProblemType) String() string {
	return string(p)
}

func (p ProblemType) DefaultSeverity() Severity {
	switch p {
	case ProblemTypeCrashLoop:
		return SeverityHigh
	case ProblemTypeImagePull:
		return SeverityHigh
	case ProblemTypeOOMKilled:
		return SeverityCritical
	case ProblemTypeProbeFailing:
		return SeverityMedium
	case ProblemTypePending:
		return SeverityMedium
	case ProblemTypeNodeNotReady:
		return SeverityCritical
	case ProblemTypeNodePressure:
		return SeverityHigh
	case ProblemTypeNodeUnschedulable:
		return SeverityMedium
	case ProblemTypeHighRestart:
		return SeverityMedium
	case ProblemTypeContainerError:
		return SeverityHigh
	case ProblemTypeResourceQuota:
		return SeverityMedium
	case ProblemTypeFailedScheduling:
		return SeverityHigh
	case ProblemTypeEvicted:
		return SeverityHigh
	default:
		return SeverityLow
	}
}

func (p ProblemType) Category() string {
	switch p {
	case ProblemTypeCrashLoop, ProblemTypeImagePull, ProblemTypeOOMKilled,
		ProblemTypeProbeFailing, ProblemTypeContainerError:
		return "Container"
	case ProblemTypePending, ProblemTypeFailedScheduling, ProblemTypeEvicted:
		return "Scheduling"
	case ProblemTypeNodeNotReady, ProblemTypeNodePressure, ProblemTypeNodeUnschedulable:
		return "Node"
	case ProblemTypeResourceQuota:
		return "Resource"
	case ProblemTypeHighRestart:
		return "Stability"
	default:
		return "Other"
	}
}

func (p ProblemType) Description() string {
	switch p {
	case ProblemTypeCrashLoop:
		return "Container is repeatedly crashing and restarting"
	case ProblemTypeImagePull:
		return "Unable to pull container image"
	case ProblemTypeOOMKilled:
		return "Container was killed due to out of memory"
	case ProblemTypeProbeFailing:
		return "Health probe is failing"
	case ProblemTypePending:
		return "Pod is stuck in pending state"
	case ProblemTypeNodeNotReady:
		return "Node is not ready to accept pods"
	case ProblemTypeNodePressure:
		return "Node is experiencing resource pressure"
	case ProblemTypeNodeUnschedulable:
		return "Node has been cordoned"
	case ProblemTypeHighRestart:
		return "Container has restarted many times"
	case ProblemTypeContainerError:
		return "Container encountered an error"
	case ProblemTypeResourceQuota:
		return "Resource quota has been exceeded"
	case ProblemTypeFailedScheduling:
		return "Pod cannot be scheduled"
	case ProblemTypeEvicted:
		return "Pod has been evicted"
	default:
		return "Unknown problem type"
	}
}
