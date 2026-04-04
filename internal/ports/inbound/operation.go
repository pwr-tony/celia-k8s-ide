package inbound

import (
	"context"

	"github.com/tonymora/celia/internal/domain/operation"
)

type OperationPort interface {
	ScaleDeployment(ctx context.Context, namespace, name string, replicas int32) (*operation.ActionResult, error)

	RolloutRestart(ctx context.Context, kind, namespace, name string) (*operation.ActionResult, error)

	DeletePod(ctx context.Context, namespace, name string, gracePeriod *int64) (*operation.ActionResult, error)

	UpdateResource(ctx context.Context, kind, namespace, name string, yaml string) (*operation.ActionResult, error)

	GetPendingActions(ctx context.Context) ([]operation.Action, error)

	GetActionHistory(ctx context.Context, limit int) ([]operation.Action, error)

	CancelAction(ctx context.Context, actionID string) error
}
