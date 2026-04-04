package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/tonymora/celia/internal/adapters/primary/http"
	"github.com/tonymora/celia/internal/adapters/secondary/kubernetes"
	"github.com/tonymora/celia/internal/application/cluster"
	"github.com/tonymora/celia/internal/application/observability"
	"github.com/tonymora/celia/internal/application/resource"
	"github.com/tonymora/celia/internal/application/trouble"
	"github.com/tonymora/celia/pkg/config"
	"github.com/tonymora/celia/pkg/logger"
)

var (
	version   = "dev"
	commit    = "unknown"
	buildDate = "unknown"
)

func main() {
	configPath := flag.String("config", "", "Path to config file")
	showVersion := flag.Bool("version", false, "Show version information")
	flag.Parse()

	if *showVersion {
		fmt.Printf("Celia Server %s (commit: %s, built: %s)\n", version, commit, buildDate)
		os.Exit(0)
	}

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	log := logger.New(cfg.Logging.Level, cfg.Logging.Format)
	log.Info("Starting Celia Server",
		"version", version,
		"commit", commit,
		"build_date", buildDate,
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	k8sAdapter, err := kubernetes.NewAdapter(cfg.Kubernetes)
	if err != nil {
		log.Error("Failed to initialize Kubernetes adapter", "error", err)
		os.Exit(1)
	}

	clusterService := cluster.NewService(k8sAdapter, log)
	resourceService := resource.NewService(k8sAdapter, log)
	observabilityService := observability.NewService(k8sAdapter, log)
	troubleService := trouble.NewService(k8sAdapter, log, cfg.Trouble)

	if cfg.Trouble.Enabled {
		go troubleService.StartDetection(ctx)
	}

	server := http.NewServer(
		cfg.Server,
		log,
		clusterService,
		resourceService,
		observabilityService,
		troubleService,
	)

	go func() {
		addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
		log.Info("Starting HTTP server", "address", addr)
		if err := server.Start(addr); err != nil {
			log.Error("Server error", "error", err)
			cancel()
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	log.Info("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error("Server shutdown error", "error", err)
	}

	log.Info("Server stopped")
}
