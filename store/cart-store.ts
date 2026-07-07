"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GUEST_CART_KEY } from "@/constants";
import type { GuestCartItem, ProductSnapshot } from "@/types/guest";

interface CartStore {
  items: GuestCartItem[];
  addItem: (product: ProductSnapshot, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, product.stock);
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                quantity: Math.min(quantity, product.stock),
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice,
                image: product.images[0],
                stock: product.stock,
              },
            ],
          };
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: GUEST_CART_KEY }
  )
);
