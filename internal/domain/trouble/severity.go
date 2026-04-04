package trouble

type Severity int

const (
	SeverityLow      Severity = 1 
	SeverityMedium   Severity = 2 
	SeverityHigh     Severity = 3 
	SeverityCritical Severity = 4 
)

func (s Severity) String() string {
	switch s {
	case SeverityLow:
		return "Low"
	case SeverityMedium:
		return "Medium"
	case SeverityHigh:
		return "High"
	case SeverityCritical:
		return "Critical"
	default:
		return "Unknown"
	}
}

func (s Severity) Color() string {
	switch s {
	case SeverityLow:
		return "blue"
	case SeverityMedium:
		return "yellow"
	case SeverityHigh:
		return "orange"
	case SeverityCritical:
		return "red"
	default:
		return "gray"
	}
}

func (s Severity) Icon() string {
	switch s {
	case SeverityLow:
		return "info"
	case SeverityMedium:
		return "warning"
	case SeverityHigh:
		return "error"
	case SeverityCritical:
		return "critical"
	default:
		return "unknown"
	}
}
