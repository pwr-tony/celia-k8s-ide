package operation

type ActionType string

const (
	ActionTypeScale         ActionType = "scale"
	ActionTypeRolloutRestart ActionType = "rollout_restart"
	ActionTypeDelete        ActionType = "delete"
	ActionTypeUpdate        ActionType = "update"
	ActionTypeCreate        ActionType = "create"
	ActionTypeCordon        ActionType = "cordon"
	ActionTypeUncordon      ActionType = "uncordon"
	ActionTypeDrain         ActionType = "drain"
)

func (a ActionType) String() string {
	return string(a)
}

func (a ActionType) IsDestructive() bool {
	switch a {
	case ActionTypeDelete, ActionTypeDrain:
		return true
	default:
		return false
	}
}

func (a ActionType) RequiresConfirmation() bool {
	switch a {
	case ActionTypeDelete, ActionTypeDrain, ActionTypeScale, ActionTypeRolloutRestart:
		return true
	default:
		return false
	}
}

func (a ActionType) Description() string {
	switch a {
	case ActionTypeScale:
		return "Scale deployment replicas"
	case ActionTypeRolloutRestart:
		return "Restart deployment pods gracefully"
	case ActionTypeDelete:
		return "Delete resource"
	case ActionTypeUpdate:
		return "Update resource configuration"
	case ActionTypeCreate:
		return "Create new resource"
	case ActionTypeCordon:
		return "Mark node as unschedulable"
	case ActionTypeUncordon:
		return "Mark node as schedulable"
	case ActionTypeDrain:
		return "Drain pods from node"
	default:
		return "Unknown action"
	}
}
