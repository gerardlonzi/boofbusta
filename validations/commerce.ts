import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    street: z.string().trim().min(5),
    city: z.string().trim().min(2),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().min(3),
    country: z.string().trim().min(2),
    phone: z.string().trim().optional(),
  }),
  billingAddress: z
    .object({
      firstName: z.string().trim().min(2),
      lastName: z.string().trim().min(2),
      street: z.string().trim().min(5),
      city: z.string().trim().min(2),
      state: z.string().trim().optional(),
      postalCode: z.string().trim().min(3),
      country: z.string().trim().min(2),
    })
    .optional(),
  shippingMethod: z.string().default("standard"),
  couponCode: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum([
    "stripe",
    "bitcoin"
]),
});

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  street: z.string().trim().min(5),
  city: z.string().trim().min(2),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(3),
  country: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  isDefault: z.boolean().default(false),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000).optional(),
  images: z.array(z.string().url()).max(5).default([]),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minPurchase: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
