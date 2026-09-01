package http

import (
	"context"
	"net/http"
	"time"

	"github.com/tonymora/celia/internal/adapters/primary/http/handlers"
	"github.com/tonymora/celia/internal/adapters/primary/http/middleware"
	"github.com/tonymora/celia/internal/application/cluster"
	"github.com/tonymora/celia/internal/application/observability"
	"github.com/tonymora/celia/internal/application/operation"
	"github.com/tonymora/celia/internal/application/resource"
	"github.com/tonymora/celia/internal/application/trouble"
	"github.com/tonymora/celia/pkg/config"
	"github.com/tonymora/celia/pkg/logger"
)

type Server struct {
	server               *http.Server
	log                  *logger.Logger
	config               config.ServerConfig
	clusterService       *cluster.Service
	resourceService      *resource.Service
	observabilityService *observability.Service
	troubleService       *trouble.Service
	operationService     *operation.Service
}

func NewServer(
	cfg config.ServerConfig,
	log *logger.Logger,
	clusterService *cluster.Service,
	resourceService *resource.Service,
	observabilityService *observability.Service,
	troubleService *trouble.Service,
	operationService *operation.Service,
) *Server {
	return &Server{
		log:                  log.WithComponent("http-server"),
		config:               cfg,
		clusterService:       clusterService,
		resourceService:      resourceService,
		observabilityService: observabilityService,
		troubleService:       troubleService,
		operationService:     operationService,
	}
}

func (s *Server) Start(addr string) error {
	router := s.setupRouter()

	s.server = &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  s.config.ReadTimeout,
		WriteTimeout: s.config.WriteTimeout,
	}

	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	if s.server == nil {
		return nil
	}
	return s.server.Shutdown(ctx)
}

func (s *Server) setupRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","timestamp":"` + time.Now().Format(time.RFC3339) + `"}`))
	})

	clusterHandler := handlers.NewClusterHandler(s.clusterService, s.log)
	resourceHandler := handlers.NewResourceHandler(s.resourceService, s.log)
	observabilityHandler := handlers.NewObservabilityHandler(s.observabilityService, s.log)
	troubleHandler := handlers.NewTroubleHandler(s.troubleService, s.log)
	operationHandler := handlers.NewOperationHandler(s.operationService, s.log)

	mux.HandleFunc("GET /api/v1/contexts", clusterHandler.ListContexts)
	mux.HandleFunc("POST /api/v1/clusters/connect", clusterHandler.Connect)
	mux.HandleFunc("POST /api/v1/clusters/disconnect", clusterHandler.Disconnect)
	mux.HandleFunc("GET /api/v1/clusters/current", clusterHandler.GetCurrentContext)
	mux.HandleFunc("GET /api/v1/clusters/connection", clusterHandler.GetConnection)
	mux.HandleFunc("GET /api/v1/clusters/namespaces", clusterHandler.ListNamespaces)
	mux.HandleFunc("GET /api/v1/clusters/health", clusterHandler.GetHealth)

	mux.HandleFunc("GET /api/v1/resources/{kind}", resourceHandler.List)
	mux.HandleFunc("GET /api/v1/resources/{kind}/{namespace}/{name}", resourceHandler.Get)
	mux.HandleFunc("GET /api/v1/resources/{kind}/{namespace}/{name}/yaml", resourceHandler.GetYAML)
	mux.HandleFunc("PUT /api/v1/resources/{kind}/{namespace}/{name}", resourceHandler.Update)
	mux.HandleFunc("DELETE /api/v1/resources/{kind}/{namespace}/{name}", resourceHandler.Delete)

	mux.HandleFunc("GET /api/v1/pods", resourceHandler.ListPods)
	mux.HandleFunc("GET /api/v1/pods/{namespace}/{name}", resourceHandler.GetPod)
	mux.HandleFunc("GET /api/v1/deployments", resourceHandler.ListDeployments)
	mux.HandleFunc("GET /api/v1/deployments/{namespace}/{name}", resourceHandler.GetDeployment)
	mux.HandleFunc("GET /api/v1/services", resourceHandler.ListServices)
	mux.HandleFunc("GET /api/v1/services/{namespace}/{name}", resourceHandler.GetService)
	mux.HandleFunc("GET /api/v1/configmaps", resourceHandler.ListConfigMaps)
	mux.HandleFunc("GET /api/v1/configmaps/{namespace}/{name}", resourceHandler.GetConfigMap)
	mux.HandleFunc("GET /api/v1/secrets", resourceHandler.ListSecrets)
	mux.HandleFunc("GET /api/v1/secrets/{namespace}/{name}", resourceHandler.GetSecret)
	mux.HandleFunc("GET /api/v1/nodes", resourceHandler.ListNodes)
	mux.HandleFunc("GET /api/v1/nodes/{name}", resourceHandler.GetNode)

	mux.HandleFunc("GET /api/v1/logs/{namespace}/{pod}", observabilityHandler.GetLogs)
	mux.HandleFunc("GET /api/v1/events", observabilityHandler.ListEvents)
	mux.HandleFunc("GET /api/v1/events/{kind}/{namespace}/{name}", observabilityHandler.ListEventsForResource)
	mux.HandleFunc("GET /api/v1/metrics/nodes", observabilityHandler.GetNodeMetrics)
	mux.HandleFunc("GET /api/v1/metrics/pods", observabilityHandler.GetPodMetrics)
	mux.HandleFunc("GET /api/v1/metrics/cluster", observabilityHandler.GetClusterMetrics)

	mux.HandleFunc("GET /api/v1/problems", troubleHandler.GetProblems)
	mux.HandleFunc("GET /api/v1/problems/stats", troubleHandler.GetProblemStats)
	mux.HandleFunc("GET /api/v1/diagnosis/{kind}/{namespace}/{name}", troubleHandler.GetDiagnosis)

	mux.HandleFunc("POST /api/v1/operations/scale/{namespace}/{name}", operationHandler.ScaleDeployment)
	mux.HandleFunc("POST /api/v1/operations/restart/{kind}/{namespace}/{name}", operationHandler.RolloutRestart)
	mux.HandleFunc("DELETE /api/v1/operations/pods/{namespace}/{name}", operationHandler.DeletePod)
	mux.HandleFunc("POST /api/v1/operations/purge", operationHandler.PurgePods)
	mux.HandleFunc("GET /api/v1/operations/history", operationHandler.GetActionHistory)

	wsHandler := handlers.NewWSHandler(s.observabilityService, s.troubleService, s.log)
	mux.HandleFunc("GET /api/v1/ws", wsHandler.HandleWebSocket)

	handler := middleware.Logging(s.log)(mux)
	handler = middleware.Recovery(s.log)(handler)
	handler = middleware.CORS()(handler)

	return handler
}
