package graph

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/nimble-challenge/petstore/internal/database"
)

func mapPet(model database.Pet) (*Pet, error) {
	id, err := uuidFromPg(model.ID)
	if err != nil {
		return nil, err
	}

	var soldAt *time.Time
	if model.SoldAt.Valid {
		t := model.SoldAt.Time
		soldAt = &t
	}

	var removedAt *time.Time
	if model.RemovedAt.Valid {
		t := model.RemovedAt.Time
		removedAt = &t
	}

	return &Pet{
		ID:          id.String(),
		Name:        model.Name,
		Species:     Species(model.Species),
		AgeYears:    int(model.AgeYears),
		Description: model.Description,
		ImagePath:   model.ImagePath,
		CreatedAt:   model.CreatedAt.Time,
		SoldAt:      soldAt,
		RemovedAt:   removedAt,
	}, nil
}

func mapPets(models []database.Pet) ([]*Pet, error) {
	result := make([]*Pet, 0, len(models))
	for _, m := range models {
		p, err := mapPet(m)
		if err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, nil
}

func mapSoldPet(row database.ListSalesByMerchantAndRangeRow) (*SoldPet, error) {
	pet := database.Pet{
		ID:          row.PetID,
		MerchantID:  row.PetMerchantID,
		Name:        row.PetName,
		Species:     row.PetSpecies,
		AgeYears:    row.PetAgeYears,
		Description: row.PetDescription,
		ImagePath:   row.PetImagePath,
		CreatedAt:   row.PetCreatedAt,
		SoldAt:      row.PetSoldAt,
		RemovedAt:   row.PetRemovedAt,
	}

	mapped, err := mapPet(pet)
	if err != nil {
		return nil, err
	}

	if !row.SaleSoldAt.Valid {
		return nil, fmt.Errorf("sale record missing sold_at")
	}

	return &SoldPet{
		Pet:    mapped,
		SoldAt: row.SaleSoldAt.Time,
	}, nil
}

func uuidFromPg(value pgtype.UUID) (uuid.UUID, error) {
	if !value.Valid {
		return uuid.UUID{}, ErrInvalidUUID
	}
	return uuid.FromBytes(value.Bytes[:])
}

var ErrInvalidUUID = errors.New("invalid uuid value")

func uuidToPg(id string) (pgtype.UUID, error) {
	parsed, err := uuid.Parse(id)
	if err != nil {
		return pgtype.UUID{}, err
	}
	var result pgtype.UUID
	result.Bytes = parsed
	result.Valid = true
	return result, nil
}
