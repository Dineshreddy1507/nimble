export type Species = 'CAT' | 'DOG' | 'FROG';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  ageYears: number;
  description: string;
  imagePath: string;
  createdAt: string;
  soldAt?: string | null;
  removedAt?: string | null;
}

export interface PurchaseError {
  petId?: string | null;
  message: string;
}

export interface PurchaseResult {
  success: boolean;
  purchasedPets: Pet[];
  errors: PurchaseError[];
}
