-- name: GetMerchantBySlug :one
SELECT *
FROM merchants
WHERE slug = $1
LIMIT 1;
