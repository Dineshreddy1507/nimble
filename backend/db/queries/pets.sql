-- name: CreatePet :one
INSERT INTO pets (
    merchant_id,
    name,
    species,
    age_years,
    description,
    image_path
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
)
RETURNING *;

-- name: MarkPetRemoved :one
UPDATE pets
SET removed_at = NOW()
WHERE id = $1
  AND merchant_id = $2
  AND sold_at IS NULL
  AND removed_at IS NULL
RETURNING *;

-- name: ListMerchantUnsoldPets :many
SELECT *
FROM pets
WHERE merchant_id = $1
  AND sold_at IS NULL
  AND removed_at IS NULL
ORDER BY created_at DESC;

-- name: ListAvailablePetsByMerchant :many
SELECT *
FROM pets
WHERE merchant_id = $1
  AND sold_at IS NULL
  AND removed_at IS NULL
ORDER BY created_at ASC;

-- name: GetPetsForUpdate :many
SELECT *
FROM pets
WHERE merchant_id = $1
  AND id = ANY($2::uuid[])
  AND sold_at IS NULL
  AND removed_at IS NULL
FOR UPDATE;

-- name: FindUnavailablePets :many
SELECT id, name, sold_at, removed_at
FROM pets
WHERE merchant_id = $1
  AND id = ANY($2::uuid[])
  AND (sold_at IS NOT NULL OR removed_at IS NOT NULL);

-- name: MarkPetSold :one
UPDATE pets
SET sold_at = $3
WHERE id = $1
  AND merchant_id = $2
  AND sold_at IS NULL
  AND removed_at IS NULL
RETURNING *;
