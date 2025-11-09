package server

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/playground"

	"github.com/nimble-challenge/petstore/graph"
	"github.com/nimble-challenge/petstore/internal/auth"
	"github.com/nimble-challenge/petstore/internal/config"
	"github.com/nimble-challenge/petstore/internal/database"
)

// Server wraps the HTTP server configuration.
type Server struct {
	cfg      config.Config
	pool     *pgxpool.Pool
	queries  *database.Queries
	http     *http.Server
	router   chi.Router
	resolver *graph.Resolver
}

// New constructs a Server instance.
func New(cfg config.Config, pool *pgxpool.Pool) *Server {
	queries := database.New(pool)
	resolver := &graph.Resolver{
		DB:   queries,
		Pool: pool,
	}

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(cors.AllowAll().Handler)

	executableSchema := graph.NewExecutableSchema(graph.Config{Resolvers: resolver})
	graphqlHandler := handler.NewDefaultServer(executableSchema)
	graphqlHandler.Use(extension.Introspection{})

	router.Route("/merchant/{storeSlug}", func(r chi.Router) {
		r.Use(auth.Middleware(queries, auth.RoleMerchant))
		r.Handle("/graphql", graphqlHandler)
		r.Get("/playground", func(w http.ResponseWriter, r *http.Request) {
			playground.Handler("GraphQL Playground", "/merchant/"+chi.URLParam(r, "storeSlug")+"/graphql").ServeHTTP(w, r)
		})
	})

	router.Route("/customer/{storeSlug}", func(r chi.Router) {
		r.Use(auth.Middleware(queries, auth.RoleCustomer))
		r.Handle("/graphql", graphqlHandler)
		r.Get("/playground", func(w http.ResponseWriter, r *http.Request) {
			playground.Handler("GraphQL Playground", "/customer/"+chi.URLParam(r, "storeSlug")+"/graphql").ServeHTTP(w, r)
		})
	})

	httpServer := &http.Server{
		Addr:         cfg.ListenAddr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &Server{
		cfg:      cfg,
		pool:     pool,
		queries:  queries,
		http:     httpServer,
		router:   router,
		resolver: resolver,
	}
}

// Start begins listening for HTTP requests.
func (s *Server) Start() error {
	return s.http.ListenAndServe()
}

// Shutdown gracefully stops the server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
