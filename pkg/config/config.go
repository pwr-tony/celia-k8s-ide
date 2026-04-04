package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server     ServerConfig     `yaml:"server"`
	WebSocket  WebSocketConfig  `yaml:"websocket"`
	Kubernetes KubernetesConfig `yaml:"kubernetes"`
	Logging    LoggingConfig    `yaml:"logging"`
	Audit      AuditConfig      `yaml:"audit"`
	Trouble    TroubleConfig    `yaml:"trouble"`
}

type ServerConfig struct {
	Host            string        `yaml:"host"`
	Port            int           `yaml:"port"`
	ReadTimeout     time.Duration `yaml:"read_timeout"`
	WriteTimeout    time.Duration `yaml:"write_timeout"`
	ShutdownTimeout time.Duration `yaml:"shutdown_timeout"`
}

type WebSocketConfig struct {
	ReadBufferSize  int           `yaml:"read_buffer_size"`
	WriteBufferSize int           `yaml:"write_buffer_size"`
	PingInterval    time.Duration `yaml:"ping_interval"`
	PongTimeout     time.Duration `yaml:"pong_timeout"`
}

type KubernetesConfig struct {
	Kubeconfig       string        `yaml:"kubeconfig"`
	DefaultNamespace string        `yaml:"default_namespace"`
	ResyncPeriod     time.Duration `yaml:"resync_period"`
	RequestTimeout   time.Duration `yaml:"request_timeout"`
}

type LoggingConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
	Output string `yaml:"output"`
}

type AuditConfig struct {
	Enabled   bool   `yaml:"enabled"`
	Directory string `yaml:"directory"`
	Retention string `yaml:"retention"`
}

type TroubleConfig struct {
	Enabled           bool          `yaml:"enabled"`
	DetectionInterval time.Duration `yaml:"detection_interval"`
	Detectors         []string      `yaml:"detectors"`
}

func Default() *Config {
	return &Config{
		Server: ServerConfig{
			Host:            "127.0.0.1",
			Port:            9119,
			ReadTimeout:     30 * time.Second,
			WriteTimeout:    30 * time.Second,
			ShutdownTimeout: 10 * time.Second,
		},
		WebSocket: WebSocketConfig{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			PingInterval:    30 * time.Second,
			PongTimeout:     60 * time.Second,
		},
		Kubernetes: KubernetesConfig{
			Kubeconfig:       "",
			DefaultNamespace: "default",
			ResyncPeriod:     30 * time.Second,
			RequestTimeout:   30 * time.Second,
		},
		Logging: LoggingConfig{
			Level:  "info",
			Format: "json",
			Output: "stdout",
		},
		Audit: AuditConfig{
			Enabled:   true,
			Directory: "~/.celia/audit",
			Retention: "30d",
		},
		Trouble: TroubleConfig{
			Enabled:           true,
			DetectionInterval: 10 * time.Second,
			Detectors: []string{
				"crashloop",
				"imagepull",
				"oomkilled",
				"pending",
				"probe_failing",
				"node_notready",
				"node_pressure",
				"high_restart",
			},
		},
	}
}

func Load(path string) (*Config, error) {
	cfg := Default()

	if path == "" {
		path = findConfigFile()
	}

	if path == "" {
		return cfg, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	cfg.Audit.Directory = expandPath(cfg.Audit.Directory)
	cfg.Kubernetes.Kubeconfig = expandPath(cfg.Kubernetes.Kubeconfig)

	return cfg, nil
}

func findConfigFile() string {
	locations := []string{
		"./configs/default.yaml",
		"./config.yaml",
		"~/.celia/config.yaml",
		"/etc/celia/config.yaml",
	}

	for _, loc := range locations {
		path := expandPath(loc)
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	return ""
}

func expandPath(path string) string {
	if strings.HasPrefix(path, "~/") {
		home, err := os.UserHomeDir()
		if err != nil {
			return path
		}
		return filepath.Join(home, path[2:])
	}
	return path
}

func (c *Config) Validate() error {
	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", c.Server.Port)
	}

	if c.Server.ReadTimeout <= 0 {
		return fmt.Errorf("invalid read timeout: %v", c.Server.ReadTimeout)
	}

	if c.Server.WriteTimeout <= 0 {
		return fmt.Errorf("invalid write timeout: %v", c.Server.WriteTimeout)
	}

	validLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
	}
	if !validLevels[c.Logging.Level] {
		return fmt.Errorf("invalid log level: %s", c.Logging.Level)
	}

	return nil
}
