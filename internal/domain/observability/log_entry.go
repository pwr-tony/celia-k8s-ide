package observability

import "time"

type LogEntry struct {
	Timestamp time.Time
	Namespace string
	Pod       string
	Container string
	Message   string
	Stream    string 
}

func (l *LogEntry) IsError() bool {
	return l.Stream == "stderr"
}

type LogFilter struct {
	Namespace  string
	Pod        string
	Container  string
	Since      time.Duration
	TailLines  int64
	Timestamps bool
	Follow     bool
	Search     string
}

func DefaultLogFilter() LogFilter {
	return LogFilter{
		TailLines:  100,
		Timestamps: true,
		Follow:     false,
	}
}
