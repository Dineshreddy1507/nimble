## Nimble Pet Store Prototype

This project implements the Nimble fullstack challenge: merchants manage pet listings via a GraphQL API while customers browse and purchase through a polished React frontend. Everything runs locally with Docker Compose—no external services required.

### Stack Highlights
- **Backend:** Go 1.22, gqlgen GraphQL server, PostgreSQL 16, pgx/sqlc data access, chi router.
- **Frontend:** React 19 (Vite + TypeScript), Apollo Client 4, Zustand state, Nginx for static hosting.
- **Infrastructure:** Docker Compose (db, backend, frontend), seeded demo data and bundled pet artwork.

### Repository Layout
- `backend/` – Go service (`cmd/server` entrypoint), GraphQL schema/resolvers (`graph/`), SQL migrations + seeds (`db/`), generated sqlc data layer (`internal/database`).
- `frontend/` – React application, GraphQL hooks, cart UI, Dockerfile & Nginx config.
- `docs/architecture.md` – Design notes, data model, sequence overview.
- `docker-compose.yml` – Orchestrates PostgreSQL, backend API, and frontend SPA.

### Quick Start (Docker Compose)
1. **Pre-requisites:** Docker & Docker Compose v2.
2. **Run the stack:**
   ```bash
   docker compose up --build
   ```
   - Postgres seeding happens automatically (demo store `paws-plus` with inventory).
   - Backend GraphQL server: `http://localhost:8080`
   - Frontend storefront: `http://localhost:3000/stores/paws-plus`
3. **Credentials:**
   - Merchant API (Basic Auth): username `paws-plus`, password `merchant-secret`
   - Customer API/front-end: username `paws-plus`, password `customer-secret`

### Manual Development (without Docker)
1. Start PostgreSQL locally and run migrations + seed:
   ```bash
   createdb petstore
   psql petstore < backend/db/migrations/0001_init.sql
   psql petstore < backend/db/seed/seed.sql
   ```
2. Export environment variables for the backend:
   ```bash
   # adjust username/password to match your local setup
   export DATABASE_URL="postgres://petstore:petstore@localhost:5432/petstore?sslmode=disable"
   export LISTEN_ADDR=":8080"
   ```
3. Run the Go server:
   ```bash
   cd backend
   go run ./cmd/server
   ```
4. Start the React app in another terminal:
   ```bash
   cd frontend
   cp .env.example .env        # optional override for backend URL / password
   npm install
   npm run dev
   ```
   Visit `http://localhost:5173/stores/paws-plus`.

### GraphQL Endpoints
- **Merchant:** `POST http://localhost:8080/merchant/paws-plus/graphql`
- **Customer:** `POST http://localhost:8080/customer/paws-plus/graphql`

Both endpoints require HTTP Basic Auth (see credentials above). Playgrounds are available at `/playground` under the same paths.

### Customer UX Flow
- Grid of available pets (unsold only) with local SVG artwork in `frontend/public/assets/pets/`.
- “Purchase now” performs single-item checkout; “Add to cart” opens a slide-over cart with bulk checkout.
- Concurrency protection: backend uses row-level locking and sale recording to prevent double purchases; UI surfaces targeted error messages when items sell out.

### Testing & Tooling
- **Backend:** `go build ./...` and `go test ./...` (no tests yet, hooks ready).
- **Frontend:** `npm run build` for production bundle (used by Docker build).
- Generated assets (`sqlc`, `gqlgen`) are checked in; regenerate with `sqlc generate` / `go run github.com/99designs/gqlgen generate`.

### Next Steps & Extensions
- Merchant-facing CLI or UI for pet management.
- Photo upload pipeline instead of bundled art.
- Additional analytics (sales dashboard, purchase history).
