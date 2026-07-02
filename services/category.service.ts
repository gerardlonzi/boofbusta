import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { AppError } from "@/lib/api-response";
import { deleteImageByUrl } from "@/lib/cloudinary";
import type { CategoryInput } from "@/validations/product";

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  const normalizedSlug = slugify(slug);
  const category = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    include: { children: true },
  });
  if (!category) throw new AppError("Category not found", 404);
  return category;
}

export async function createCategory(input: CategoryInput) {
  const slug = slugify(input.slug || input.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError("Category already exists", 409);

  return prisma.category.create({
    data: { ...input, slug },
  });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError("Category not found", 404);

  const data: Record<string, unknown> = { ...input };
  if (input.slug) data.slug = slugify(input.slug);
  else if (input.name) data.slug = slugify(input.name);

  if (input.image === null && existing.image) {
    await deleteImageByUrl(existing.image);
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return null;

  if (category._count.products > 0) {
    throw new AppError("Cannot delete a category that has products", 400);
  }

  if (category.image) {
    await deleteImageByUrl(category.image);
  }

  return prisma.category.delete({ where: { id } });
}
