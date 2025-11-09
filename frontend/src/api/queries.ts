import { gql } from '@apollo/client';

export const CUSTOMER_AVAILABLE_PETS = gql`
  query CustomerAvailablePets {
    customerAvailablePets {
      id
      name
      species
      ageYears
      description
      imagePath
      createdAt
    }
  }
`;

export const PURCHASE_PET = gql`
  mutation PurchasePet($id: ID!) {
    customerPurchasePet(id: $id) {
      success
      purchasedPets {
        id
        name
      }
      errors {
        petId
        message
      }
    }
  }
`;

export const PURCHASE_CART = gql`
  mutation PurchaseCart($petIds: [ID!]!) {
    customerPurchaseCart(input: { petIds: $petIds }) {
      success
      purchasedPets {
        id
        name
      }
      errors {
        petId
        message
      }
    }
  }
`;
