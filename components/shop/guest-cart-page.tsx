"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { calculateCartTotals } from "@/lib/commerce/totals";
import { CartItemControls } from "@/components/shop/guest-cart-controls";
import { ROUTES } from "@/constants";

export function GuestCartPage() {
  const items = useCartStore((s) => s.items);
  const totals = calculateCartTotals(items.map((i) => ({ price: i.price, quantity: i.quantity })));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-cream">Your cart is empty</h1>
        <p className="mt-2 text-muted">Discover our premium microdose products</p>
        <Link
          href={ROUTES.shop}
          className="mt-8 inline-flex rounded-xl bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-light"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-cream">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-hover">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/shop/product/${item.slug}`}
                  className="font-medium text-cream hover:text-accent"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-accent">{formatPrice(item.price)}</p>
                <CartItemControls productId={item.productId} quantity={item.quantity} />
              </div>
              <p className="font-semibold text-cream">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold text-cream">Order Summary</h2>
          <dl className="space-y-2 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-cream">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd className="text-cream">{formatPrice(totals.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="text-cream">
                {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt className="text-cream">Total</dt>
              <dd className="text-accent">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <Link
            href={ROUTES.checkout}
            className="mt-6 block w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-white hover:bg-primary-light"
          >
            Proceed to Checkout
          </Link>
          <Link href={ROUTES.shop} className="mt-3 block text-center text-sm text-muted hover:text-accent">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
