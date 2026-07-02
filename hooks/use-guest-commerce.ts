"use client";

import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { ProductSnapshot } from "@/types/guest";
import { toast } from "sonner";

export function useGuestCart() {
  const store = useCartStore();

  async function addToCart(product: ProductSnapshot, quantity = 1) {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const apiRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await apiRes.json();
      if (!apiRes.ok) throw new Error(data.error?.message ?? "Error");
      store.addItem(product, quantity);
      toast.success("Added to cart");
      return;
    }
    store.addItem(product, quantity);
    toast.success("Added to cart");
  }

  return { ...store, addToCart };
}

export function useGuestWishlist() {
  const store = useWishlistStore();

  async function toggleWishlist(product: ProductSnapshot) {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const inWishlist = store.hasItem(product.id);
      if (inWishlist) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" });
        store.removeItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        store.addItem(product);
        toast.success("Added to wishlist");
      }
      return;
    }
    const wasIn = store.hasItem(product.id);
    store.toggleItem(product);
    toast.success(wasIn ? "Removed from wishlist" : "Added to wishlist");
  }

  return { ...store, toggleWishlist };
}

export async function syncGuestDataOnLogin() {
  const cartItems = useCartStore.getState().items;
  const wishlistItems = useWishlistStore.getState().items;

  if (cartItems.length > 0) {
    for (const item of cartItems) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
      });
    }
    useCartStore.getState().clearCart();
  }

  if (wishlistItems.length > 0) {
    for (const item of wishlistItems) {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }),
      });
    }
    useWishlistStore.getState().clearWishlist();
  }
}
