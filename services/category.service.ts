import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { AppError } from "@/lib/api-response";
import type { CategoryInput } from "@/validations/product";

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category) throw new AppError("Catégorie introuvable", 404);
  return category;
}

export async function createCategory(input: CategoryInput) {
  const slug = slugify(input.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError("Catégorie déjà existante", 409);

  return prisma.category.create({
    data: { ...input, slug },
  });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const data: Partial<CategoryInput & { slug?: string }> = { ...input };
  if (input.name) data.slug = slugify(input.name);
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new AppError("Impossible de supprimer une catégorie avec des produits", 400);
  }
  return prisma.category.delete({ where: { id } });
}
