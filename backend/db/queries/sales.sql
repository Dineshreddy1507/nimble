-- name: InsertSale :one
INSERT INTO sales (
    merchant_id,
    pet_id,
    sold_at,
    purchase_method
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING *;

-- name: ListSalesByMerchantAndRange :many
SELECT
    s.id AS sale_id,
    s.merchant_id AS sale_merchant_id,
    s.pet_id AS sale_pet_id,
    s.sold_at AS sale_sold_at,
    s.purchase_method AS sale_purchase_method,
    p.id AS pet_id,
    p.merchant_id AS pet_merchant_id,
    p.name AS pet_name,
    p.species AS pet_species,
    p.age_years AS pet_age_years,
    p.description AS pet_description,
    p.image_path AS pet_image_path,
    p.created_at AS pet_created_at,
    p.sold_at AS pet_sold_at,
    p.removed_at AS pet_removed_at
FROM sales s
JOIN pets p ON p.id = s.pet_id
WHERE s.merchant_id = $1
  AND s.sold_at >= $2
  AND s.sold_at <= $3
ORDER BY s.sold_at DESC;
