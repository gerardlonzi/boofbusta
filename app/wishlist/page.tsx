"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { ROUTES } from "@/constants";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-cream">My Wishlist</h1>
      <p className="mb-8 text-muted">Save your favorite products — no account required</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="text-5xl">💚</p>
          <p className="mt-4 text-muted">Your wishlist is empty</p>
          <Link
            href={ROUTES.shop}
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const snapshot = {
              id: item.productId,
              name: item.name,
              slug: item.slug,
              price: item.price,
              comparePrice: item.comparePrice,
              images: item.image ? [item.image] : [],
              stock: item.stock,
            };
            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <Link
                  href={`/shop/product/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-hover"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/shop/product/${item.slug}`}
                    className="font-medium text-cream hover:text-accent"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 font-semibold text-accent">{formatPrice(item.price)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <AddToCartButton product={snapshot} disabled={item.stock === 0} variant="compact" />
                    <WishlistButton product={snapshot} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
