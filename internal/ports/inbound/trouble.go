package inbound

import (
	"context"

	"github.com/tonymora/celia/internal/domain/trouble"
)

type TroublePort interface {
	GetProblems(ctx context.Context) ([]trouble.Problem, error)

	GetProblemsByNamespace(ctx context.Context, namespace string) ([]trouble.Problem, error)

	GetProblemsByNode(ctx context.Context, nodeName string) ([]trouble.Problem, error)

	GetProblemsByType(ctx context.Context, problemType trouble.ProblemType) ([]trouble.Problem, error)

	GetDiagnosis(ctx context.Context, kind, namespace, name string) (*trouble.Diagnosis, error)

	GetCorrelations(ctx context.Context, problemID string) ([]trouble.Correlation, error)

	Subscribe(ctx context.Context) (<-chan trouble.ProblemUpdate, error)

	GetProblemStats(ctx context.Context) (*ProblemStats, error)
}

type ProblemStats struct {
	Total    int
	Critical int
	High     int
	Medium   int
	Low      int
	ByType   map[trouble.ProblemType]int
}
