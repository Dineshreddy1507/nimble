package auth

import (
	"encoding/base64"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/nimble-challenge/petstore/internal/database"
)

// Middleware enforces basic authentication per store slug and role.
func Middleware(db *database.Queries, role Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			storeSlug := chi.URLParam(r, "storeSlug")
			if storeSlug == "" {
				unauthorized(w, "missing store slug")
				return
			}

			username, password, ok := basicAuthCredentials(r.Header.Get("Authorization"))
			if !ok {
				unauthorized(w, "invalid authorization header")
				return
			}

			if subtleConstantTimeCompare(username, storeSlug) == false {
				unauthorized(w, "invalid credentials")
				return
			}

			ctx := r.Context()
			merchant, err := db.GetMerchantBySlug(ctx, storeSlug)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					unauthorized(w, "unknown store")
					return
				}
				http.Error(w, "internal server error", http.StatusInternalServerError)
				return
			}

			var hash string
			switch role {
			case RoleMerchant:
				hash = merchant.MerchantPasswordHash
			case RoleCustomer:
				hash = merchant.CustomerPasswordHash
			default:
				http.Error(w, "internal server error", http.StatusInternalServerError)
				return
			}

			if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
				unauthorized(w, "invalid credentials")
				return
			}

			principal := Principal{
				Role:     role,
				Merchant: merchant,
			}

			next.ServeHTTP(w, r.WithContext(WithPrincipal(ctx, principal)))
		})
	}
}

func subtleConstantTimeCompare(a, b string) bool {
	if len(a) != len(b) {
		return false
	}

	// Basic constant-time comparison to avoid leaking slug.
	var result byte
	for i := 0; i < len(a); i++ {
		result |= a[i] ^ b[i]
	}
	return result == 0
}

func unauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("WWW-Authenticate", `Basic realm="Pets"`)
	http.Error(w, message, http.StatusUnauthorized)
}

func basicAuthCredentials(header string) (username, password string, ok bool) {
	if header == "" {
		return "", "", false
	}
	const prefix = "Basic "
	if !strings.HasPrefix(header, prefix) {
		return "", "", false
	}
	decoded, err := base64.StdEncoding.DecodeString(header[len(prefix):])
	if err != nil {
		return "", "", false
	}

	parts := strings.SplitN(string(decoded), ":", 2)
	if len(parts) != 2 {
		return "", "", false
	}
	return parts[0], parts[1], true
}

// HashPassword is a helper to create bcrypt hashes for seed data.
func HashPassword(raw string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// MustHashPassword creates a bcrypt hash or panics. Intended for tooling/seed usage.
func MustHashPassword(raw string) string {
	hash, err := HashPassword(raw)
	if err != nil {
		panic(err)
	}
	return hash
}
