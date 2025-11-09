package auth

import (
	"context"

	"github.com/nimble-challenge/petstore/internal/database"
)

// Role represents the type of actor making a request.
type Role string

const (
	RoleMerchant Role = "merchant"
	RoleCustomer Role = "customer"
)

// Principal captures identity and authorization context.
type Principal struct {
	Role     Role
	Merchant database.Merchant
}

type contextKey string

const principalContextKey contextKey = "principal"

// WithPrincipal attaches the authenticated principal to context.
func WithPrincipal(ctx context.Context, principal Principal) context.Context {
	return context.WithValue(ctx, principalContextKey, principal)
}

// PrincipalFromContext extracts the principal from context.
func PrincipalFromContext(ctx context.Context) (Principal, bool) {
	val := ctx.Value(principalContextKey)
	if val == nil {
		return Principal{}, false
	}

	principal, ok := val.(Principal)
	return principal, ok
}
