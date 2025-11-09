import { ApolloProvider, useMutation, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { createApolloClient } from '../api/client';
import {
  CUSTOMER_AVAILABLE_PETS,
  PURCHASE_CART,
  PURCHASE_PET,
} from '../api/queries';
import { CartPanel } from '../components/CartPanel';
import { PetCard } from '../components/PetCard';
import { StoreHeader } from '../components/StoreHeader';
import { useCartCount, useCartItems, useCartStore } from '../store/cart';
import type { Pet, PurchaseResult } from '../types/pet';

type CustomerAvailablePetsData = {
  customerAvailablePets: Pet[];
};

type PurchasePetMutationData = {
  customerPurchasePet: PurchaseResult;
};

type PurchasePetVariables = {
  id: string;
};

type PurchaseCartMutationData = {
  customerPurchaseCart: PurchaseResult;
};

type PurchaseCartVariables = {
  petIds: string[];
};

export const StorefrontRoute = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  const client = useMemo(
    () => (storeSlug ? createApolloClient(storeSlug) : null),
    [storeSlug],
  );

  if (!storeSlug || !client) {
    return <Navigate to="/" replace />;
  }

  return (
    <ApolloProvider client={client}>
      <StorefrontView storeSlug={storeSlug} />
    </ApolloProvider>
  );
};

interface StorefrontViewProps {
  storeSlug: string;
}

const StorefrontView = ({ storeSlug }: StorefrontViewProps) => {
  const { data, loading, error, refetch } = useQuery<CustomerAvailablePetsData>(
    CUSTOMER_AVAILABLE_PETS,
    {
      fetchPolicy: 'cache-and-network',
    },
  );
  const [purchasePetMutation, purchasePetState] = useMutation<
    PurchasePetMutationData,
    PurchasePetVariables
  >(PURCHASE_PET);
  const [purchaseCartMutation, purchaseCartState] = useMutation<
    PurchaseCartMutationData,
    PurchaseCartVariables
  >(PURCHASE_CART);

  const [isCartOpen, setCartOpen] = useState(false);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);

  const cartItems = useCartItems();
  const cartCount = useCartCount();
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const removeMany = useCartStore((state) => state.removeMany);

  const handlePurchaseResult = async (result: PurchaseResult | undefined | null) => {
    if (!result) {
      return;
    }

    if (result.purchasedPets.length > 0) {
      const purchasedNames = result.purchasedPets.map((pet) => pet.name).join(', ');
      toast.success(
        result.purchasedPets.length === 1
          ? `${purchasedNames} is officially yours!`
          : `Success! ${purchasedNames} are now yours!`,
      );
      removeMany(result.purchasedPets.map((pet) => pet.id));
      await refetch();
    }

    result.errors.forEach((purchaseError) => {
      toast.error(purchaseError.message);
    });
  };

  const handlePurchase = async (pet: Pet) => {
    try {
      setActivePurchaseId(pet.id);
      const response = await purchasePetMutation({
        variables: { id: pet.id },
      });
      await handlePurchaseResult(response.data?.customerPurchasePet);
    } catch (mutationError) {
      toast.error('We could not complete that purchase. Please try again.');
      // eslint-disable-next-line no-console
      console.error(mutationError);
    } finally {
      setActivePurchaseId(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      const response = await purchaseCartMutation({
        variables: { petIds: cartItems.map((pet) => pet.id) },
      });
      const result = response.data?.customerPurchaseCart;
      await handlePurchaseResult(result);
      if (result && result.success) {
        setCartOpen(false);
      }
    } catch (mutationError) {
      toast.error('Checkout failed. Please try again.');
      // eslint-disable-next-line no-console
      console.error(mutationError);
    }
  };

  const availablePets: Pet[] = data?.customerAvailablePets ?? [];

  return (
    <div className="page">
      <StoreHeader
        storeName="Paws Plus"
        subtitle={<span>Friendly pets, instant adoption.</span>}
        cartCount={cartCount}
        onToggleCart={() => setCartOpen((state) => !state)}
      />

      <section className="pet-grid">
        {loading && availablePets.length === 0 ? (
          <p className="status state-loading">Fetching the latest furry friends…</p>
        ) : null}

        {error ? (
          <p className="status state-error">
            Could not load pets for store <strong>{storeSlug}</strong>. Please refresh.
          </p>
        ) : null}

        {availablePets.length === 0 && !loading && !error ? (
          <p className="status">All pets have found homes! Check back soon.</p>
        ) : (
          availablePets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onAddToCart={(item) => {
                addItem(item);
                setCartOpen(true);
                toast.success(`${item.name} added to cart.`);
              }}
              onPurchase={handlePurchase}
              isPurchasing={activePurchaseId === pet.id && purchasePetState.loading}
            />
          ))
        )}
      </section>

      <div
        className={`cart-overlay ${isCartOpen ? 'cart-overlay--visible' : ''}`}
        onClick={() => setCartOpen(false)}
        role="presentation"
      />

      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={(id) => removeItem(id)}
        onCheckout={handleCheckout}
        isProcessing={purchaseCartState.loading}
      />
    </div>
  );
};
