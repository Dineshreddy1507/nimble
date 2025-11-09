package main

import (
    "fmt"
    "log"

    "github.com/nimble-challenge/petstore/internal/auth"
)

func main() {
    values := map[string]string{
        "merchant": "merchant-secret",
        "customer": "customer-secret",
    }
    for label, raw := range values {
        hash, err := auth.HashPassword(raw)
        if err != nil {
            log.Fatalf("failed to hash %s: %v", label, err)
        }
        fmt.Printf("%s:%s\n", label, hash)
    }
}
