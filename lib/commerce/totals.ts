/**
 * lib/commerce/totals.ts
 *
 * Les prix sont stockés en DOLLARS dans MongoDB (ex: price: 80 = $80.00).
 * Aucune conversion nécessaire.
 */

import {
  TAX_RATE,
  SHIPPING_FLAT_RATE,
  FREE_SHIPPING_THRESHOLD,
} from "@/constants/commerce";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateCartTotals(
  items: { price: number; quantity: number }[],
  couponDiscount = 0
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = round(subtotal * TAX_RATE);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const discount = round(couponDiscount);
  const total = round(Math.max(0, subtotal + tax + shipping - discount));

  return {
    subtotal: round(subtotal),
    tax,
    shipping,
    discount,
    total,
  };
}

export function applyCoupon(
  subtotal: number,
  type: "PERCENTAGE" | "FIXED",
  value: number
): number {
  if (type === "PERCENTAGE") {
    return round(subtotal * (value / 100));
  }
  return round(Math.min(value, subtotal));
}