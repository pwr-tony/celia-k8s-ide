package resource

type PersistentVolumeClaim struct {
	Resource

	Phase            PVCPhase
	AccessModes      []string
	StorageClassName string
	VolumeMode       string
	VolumeName       string
	Capacity         string
	RequestedStorage string
	Conditions       []PVCCondition
	Selector         map[string]string
}

type PVCPhase string

const (
	PVCPhasePending PVCPhase = "Pending"
	PVCPhaseBound   PVCPhase = "Bound"
	PVCPhaseLost    PVCPhase = "Lost"
)

type PVCCondition struct {
	Type               string
	Status             string
	LastProbeTime      string
	LastTransitionTime string
	Reason             string
	Message            string
}

func (pvc *PersistentVolumeClaim) IsBound() bool {
	return pvc.Phase == PVCPhaseBound
}

func (pvc *PersistentVolumeClaim) IsPending() bool {
	return pvc.Phase == PVCPhasePending
}

func (pvc *PersistentVolumeClaim) IsLost() bool {
	return pvc.Phase == PVCPhaseLost
}

func (pvc *PersistentVolumeClaim) GetBoundVolumeName() string {
	return pvc.VolumeName
}

func (pvc *PersistentVolumeClaim) HasAccessMode(mode string) bool {
	for _, m := range pvc.AccessModes {
		if m == mode {
			return true
		}
	}
	return false
}

func (pvc *PersistentVolumeClaim) IsReadWriteOnce() bool {
	return pvc.HasAccessMode("ReadWriteOnce")
}

func (pvc *PersistentVolumeClaim) IsReadOnlyMany() bool {
	return pvc.HasAccessMode("ReadOnlyMany")
}

func (pvc *PersistentVolumeClaim) IsReadWriteMany() bool {
	return pvc.HasAccessMode("ReadWriteMany")
}

func (pvc *PersistentVolumeClaim) GetCondition(condType string) *PVCCondition {
	for i := range pvc.Conditions {
		if pvc.Conditions[i].Type == condType {
			return &pvc.Conditions[i]
		}
	}
	return nil
}

func (pvc *PersistentVolumeClaim) IsResizing() bool {
	cond := pvc.GetCondition("Resizing")
	return cond != nil && cond.Status == "True"
}

func (pvc *PersistentVolumeClaim) HasFileSystemResizePending() bool {
	cond := pvc.GetCondition("FileSystemResizePending")
	return cond != nil && cond.Status == "True"
}
