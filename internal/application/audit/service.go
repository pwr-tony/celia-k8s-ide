package audit

import (
	"context"
	"time"

	"github.com/tonymora/celia/internal/domain/audit"
	"github.com/tonymora/celia/internal/domain/operation"
	"github.com/tonymora/celia/internal/ports/inbound"
	"github.com/tonymora/celia/internal/ports/outbound"
	"github.com/tonymora/celia/pkg/logger"
)

type Service struct {
	store outbound.AuditStorePort
	log   *logger.Logger
}

func NewService(store outbound.AuditStorePort, log *logger.Logger) *Service {
	return &Service{
		store: store,
		log:   log.WithComponent("audit-service"),
	}
}

func (s *Service) List(ctx context.Context, from, to time.Time) ([]audit.Entry, error) {
	return s.store.List(ctx, from, to)
}

func (s *Service) ListRecent(ctx context.Context, limit int) ([]audit.Entry, error) {
	return s.store.ListRecent(ctx, limit)
}

func (s *Service) ListByCluster(ctx context.Context, clusterName string, from, to time.Time) ([]audit.Entry, error) {
	return s.store.ListByCluster(ctx, clusterName, from, to)
}

func (s *Service) ListDestructive(ctx context.Context, from, to time.Time) ([]audit.Entry, error) {
	entries, err := s.store.List(ctx, from, to)
	if err != nil {
		return nil, err
	}

	var destructive []audit.Entry
	for _, e := range entries {
		if e.IsDestructive() {
			destructive = append(destructive, e)
		}
	}

	return destructive, nil
}

func (s *Service) GetByID(ctx context.Context, id string) (*audit.Entry, error) {
	return s.store.GetByID(ctx, id)
}

func (s *Service) GetStats(ctx context.Context, from, to time.Time) (*inbound.AuditStats, error) {
	entries, err := s.store.List(ctx, from, to)
	if err != nil {
		return nil, err
	}

	stats := &inbound.AuditStats{
		Total:     len(entries),
		ByAction:  make(map[string]int),
		ByCluster: make(map[string]int),
	}

	for _, e := range entries {
		if e.Success {
			stats.Successful++
		} else {
			stats.Failed++
		}

		if e.IsDestructive() {
			stats.Destructive++
		}

		stats.ByAction[string(e.Action)]++
		stats.ByCluster[e.ClusterName]++
	}

	return stats, nil
}

func (s *Service) LogAction(ctx context.Context, clusterName string, actionType operation.ActionType, namespace, resourceKind, resourceName string, success bool, errorMsg string, before, after string) error {
	entry := audit.NewEntry(clusterName, actionType, namespace, resourceKind, resourceName)
	entry.SetBefore(before)
	entry.SetAfter(after)

	if success {
		entry.SetSuccess()
	} else {
		entry.SetError(errorMsg)
	}

	return s.store.Append(ctx, *entry)
}
