"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GUEST_WISHLIST_KEY } from "@/constants";
import type { GuestWishlistItem, ProductSnapshot } from "@/types/guest";

interface WishlistStore {
  items: GuestWishlistItem[];
  addItem: (product: ProductSnapshot) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ProductSnapshot) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (get().hasItem(product.id)) return;
        set((state) => ({
          items: [
            ...state.items,
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              comparePrice: product.comparePrice,
              image: product.images[0],
              stock: product.stock,
            },
          ],
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      toggleItem: (product) => {
        if (get().hasItem(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      hasItem: (productId) => get().items.some((i) => i.productId === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: GUEST_WISHLIST_KEY }
  )
);
