package resource

type PersistentVolume struct {
	Resource

	Capacity         string
	AccessModes      []string
	ReclaimPolicy    string
	StorageClassName string
	VolumeMode       string
	Phase            PVPhase
	Reason           string
	ClaimRef         *PVClaimRef
	Source           PVSource
	MountOptions     []string
	NodeAffinity     string
}

type PVPhase string

const (
	PVPhasePending   PVPhase = "Pending"
	PVPhaseAvailable PVPhase = "Available"
	PVPhaseBound     PVPhase = "Bound"
	PVPhaseReleased  PVPhase = "Released"
	PVPhaseFailed    PVPhase = "Failed"
)

type PVClaimRef struct {
	Namespace string
	Name      string
	UID       string
}

type PVSource struct {
	Type       string
	Path       string
	Server     string
	SecretName string
	ReadOnly   bool
	FSType     string
	Driver     string
	VolumeID   string
}

func (pv *PersistentVolume) IsBound() bool {
	return pv.Phase == PVPhaseBound
}

func (pv *PersistentVolume) IsAvailable() bool {
	return pv.Phase == PVPhaseAvailable
}

func (pv *PersistentVolume) IsReleased() bool {
	return pv.Phase == PVPhaseReleased
}

func (pv *PersistentVolume) IsFailed() bool {
	return pv.Phase == PVPhaseFailed
}

func (pv *PersistentVolume) GetBoundClaimName() string {
	if pv.ClaimRef != nil {
		return pv.ClaimRef.Name
	}
	return ""
}

func (pv *PersistentVolume) GetBoundClaimNamespace() string {
	if pv.ClaimRef != nil {
		return pv.ClaimRef.Namespace
	}
	return ""
}

func (pv *PersistentVolume) GetSourceType() string {
	return pv.Source.Type
}

func (pv *PersistentVolume) HasAccessMode(mode string) bool {
	for _, m := range pv.AccessModes {
		if m == mode {
			return true
		}
	}
	return false
}

func (pv *PersistentVolume) IsReadWriteOnce() bool {
	return pv.HasAccessMode("ReadWriteOnce")
}

func (pv *PersistentVolume) IsReadOnlyMany() bool {
	return pv.HasAccessMode("ReadOnlyMany")
}

func (pv *PersistentVolume) IsReadWriteMany() bool {
	return pv.HasAccessMode("ReadWriteMany")
}
