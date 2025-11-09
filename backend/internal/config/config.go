package config

import (
	"errors"
	"fmt"
	"os"
)

// Config contains runtime configuration for the backend service.
type Config struct {
	DatabaseURL string
	ListenAddr  string
}

// Load reads configuration from environment variables.
func Load() (Config, error) {
	cfg := Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		ListenAddr:  valueOrDefault(os.Getenv("LISTEN_ADDR"), ":8080"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}

	return cfg, nil
}

func (c Config) String() string {
	return fmt.Sprintf("listen=%s", c.ListenAddr)
}

func valueOrDefault(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
