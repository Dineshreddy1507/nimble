## Summary
- **Goal:** Pet store platform where merchants manage inventories via GraphQL API and customers purchase pets through a React storefront.
- **Tech stack:** Go (gqlgen) backend, PostgreSQL storage, GraphQL API, React + TypeScript frontend (Vite), Docker Compose orchestration.
- **Security:** Basic HTTP auth on separate merchant/customer GraphQL endpoints. Credentials are scoped per store.
- **Deployment target:** Local development via Docker Compose with seeded demo data and bundled pet images.

## Domain Model
- **Merchant**
  - `id`, `slug`, `display_name`
  - `merchant_password_hash`, `customer_password_hash`
  - `created_at`, `updated_at`
- **Pet**
  - `id`, `merchant_id`
  - `name`, `species` (enum: Cat, Dog, Frog)
  - `age_years` (integer), `description`
  - `image_path` (local asset reference)
  - `created_at`, `removed_at` (nullable; set when merchant removes listing)
- **Sale**
  - `id`, `merchant_id`, `pet_id`
  - `sold_at`
  - `purchase_method` (enum: direct | cart) for analytics

> The `Sale` table allows time-range queries and auditing of transactions.

## Backend Design
- Implements two HTTP GraphQL endpoints:
  - `/merchant/{storeSlug}/graphql`
  - `/customer/{storeSlug}/graphql`
- Basic auth middleware verifies credentials for the `storeSlug` and injects the merchant identity into request context.
- **GraphQL schema (draft highlights):**
  - Merchant mutations:
    - `createPet(input: CreatePetInput!): Pet!`
    - `removePet(id: ID!): Boolean!`
  - Merchant queries:
    - `soldPets(range: DateRangeInput!): [SoldPet!]!`
    - `unsoldPets: [Pet!]!`
  - Customer queries/mutations:
    - `availablePets: [Pet!]!`
    - `purchasePet(id: ID!): PurchaseResult!`
    - `purchaseCart(input: PurchaseCartInput!): PurchaseResult!`
- Purchases run inside SQL transactions with `SELECT ... FOR UPDATE` to prevent race conditions and ensure pets cannot be double-sold.
- Gqlgen resolvers wrap PostgreSQL queries via `sqlc`-generated data access layer for type safety.

## Frontend Design
- React + TypeScript app bootstrapped with Vite.
- Screens:
  - **Storefront:** Lists available pets (cards with name, species, age, description, image, purchase/add-to-cart actions).
  - **Cart drawer:** Managed with Zustand store; checkout mutation triggers `purchaseCart`.
  - **Toast notifications:** Human-readable success/error handling for sold-out pets.
- GraphQL client: Apollo Client configured with Basic auth header and store slug.
- Routing: `/stores/:storeSlug` loads store-specific data to enable multiple merchants.

## Assets
- Local images stored under `frontend/public/assets/pets/*`.
- Seed script populates pets with bundled image references; sample images generated programmatically to avoid external dependencies.

## Local Development & Delivery
- **Docker Compose services:**
  - `db`: PostgreSQL with mounted init scripts for schema + seed data.
  - `backend`: Go service (hot reload via `air`) exposing GraphQL endpoints at `http://localhost:8080`.
  - `frontend`: Vite dev server proxied through Docker to `http://localhost:5173`.
- `.env` file holds store credentials and DB connection info; Compose injects them into services.
- README documents setup, credentials for demo merchant/customer, and example GraphQL queries.

## Next Steps
1. Scaffold repo structure (`backend/`, `frontend/`, `docs/`, `assets/`).
2. Generate Go GraphQL server skeleton with gqlgen and define schema.
3. Model database schema + migrations; integrate via sqlc.
4. Create React frontend with Apollo Client and storefront UX.
5. Bundle sample pet images and seed data.
6. Compose services and verify end-to-end flow.
