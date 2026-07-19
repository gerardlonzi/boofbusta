import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().min(1),
  categoryId: z.string().min(1),
  brand: z.string().trim().optional().nullable(),
  tags: z.array(z.string()).default([]),
  weight: z.coerce.number().positive().optional().nullable(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional()
    .nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "name-asc", "name-desc"])
    .default("newest"),
  featured: z.coerce.boolean().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
