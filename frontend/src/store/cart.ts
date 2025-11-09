import { create } from 'zustand';
import type { Pet } from '../types/pet';

interface CartState {
  items: Pet[];
  addItem: (pet: Pet) => void;
  removeItem: (id: string) => void;
  removeMany: (ids: string[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (pet) =>
    set((state) => {
      const exists = state.items.some((item) => item.id === pet.id);
      if (exists) {
        return state;
      }
      return { items: [...state.items, pet] };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  removeMany: (ids) =>
    set((state) => ({
      items: state.items.filter((item) => !ids.includes(item.id)),
    })),
  clear: () => set({ items: [] }),
}));

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartCount = () => useCartStore((state) => state.items.length);
