package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nimble-challenge/petstore/internal/database"
)

type Resolver struct {
	DB   *database.Queries
	Pool *pgxpool.Pool
}
