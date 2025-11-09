CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    merchant_password_hash TEXT NOT NULL,
    customer_password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('CAT','DOG','FROG')),
    age_years INTEGER NOT NULL CHECK (age_years >= 0 AND age_years <= 50),
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sold_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ
);

CREATE INDEX idx_pets_merchant_unsold ON pets (merchant_id) WHERE sold_at IS NULL AND removed_at IS NULL;

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets (id) ON DELETE CASCADE,
    sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    purchase_method TEXT NOT NULL CHECK (purchase_method IN ('DIRECT','CART'))
);

CREATE UNIQUE INDEX uq_sales_pet ON sales (pet_id);
