import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/cookies";
import { updateCategory, deleteCategory } from "@/services/category.service";
import { categorySchema } from "@/validations/product";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = categorySchema.partial().parse(body);
    const category = await updateCategory(id, input);
    revalidateTag("categories", { expire: 0 });
    return apiSuccess({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCategory(id);
    revalidateTag("categories", { expire: 0 });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
