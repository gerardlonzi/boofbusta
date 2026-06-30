import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { AppError } from "@/lib/api-response";
import type { ProductInput, ProductQuery } from "@/validations/product";

function buildOrderBy(sort: ProductQuery["sort"]) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "name-asc":
      return { name: "asc" as const };
    case "name-desc":
      return { name: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export async function getProducts(query: ProductQuery) {
  const { page, limit, search, category, minPrice, maxPrice, inStock, sort, featured, status } =
    query;
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : { status: "ACTIVE" as const }),
    ...(featured !== undefined ? { featured } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: buildOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product) throw new AppError("Produit introuvable", 404);
  return product;
}

export async function createProduct(input: ProductInput) {
  const slug = slugify(input.name);
  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug }, { sku: input.sku }] },
  });
  if (existing) throw new AppError("Slug ou SKU déjà existant", 409);

  return prisma.product.create({
    data: { ...input, slug },
    include: { category: true },
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const data = { ...input };
  if (input.name) {
    (data as ProductInput & { slug?: string }).slug = slugify(input.name);
  }
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { category: { select: { name: true, slug: true } } },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPromotions(limit = 12) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      comparePrice: { not: null },
    },
    include: { category: { select: { name: true, slug: true } } },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
