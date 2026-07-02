"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useGuestCart } from "@/hooks/use-guest-commerce";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants";
import type { ProductSnapshot } from "@/types/guest";

interface ProductPurchasePanelProps {
  product: ProductSnapshot;
  disabled?: boolean;
}

export function ProductPurchasePanel({ product, disabled }: ProductPurchasePanelProps) {
  const { addToCart } = useGuestCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const maxQty = Math.min(product.stock, 99);
  const lineTotal = product.price * quantity;

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQuantity((q) => Math.min(maxQty, q + 1));
  }

  async function handleAddToCart() {
    setLoading(true);
    try {
      await addToCart(product, quantity);
      setAdded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Quantité</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= 1 || disabled}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            disabled={quantity >= maxQty || disabled}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="text-2xl font-bold">{formatPrice(lineTotal)}</span>
        </div>
        {quantity > 1 && (
          <p className="mt-1 text-xs text-zinc-400">
            {formatPrice(product.price)} × {quantity}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
        >
          <ShoppingBag className="h-5 w-5" />
          {loading ? "Adding..." : disabled ? "Out of stock" : "Add to cart"}
        </button>

        {added && (
          <Link
            href={ROUTES.cart}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Voir le panier
          </Link>
        )}
      </div>
    </div>
  );
}
