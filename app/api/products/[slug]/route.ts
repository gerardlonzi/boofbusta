import { NextRequest } from "next/server";
import { getProductBySlug, updateProduct, deleteProduct } from "@/services/product.service";
import { requireAdmin } from "@/lib/auth/cookies";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    return apiSuccess({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) throw new Error("Not found");
    const body = await request.json();
    const { productSchema } = await import("@/validations/product");
    const input = productSchema.partial().parse(body);
    const product = await updateProduct(existing.id, input);
    return apiSuccess({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) throw new Error("Not found");
    await deleteProduct(existing.id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
