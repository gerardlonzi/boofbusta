import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getCategories, createCategory } from "@/services/category.service";
import { requireAdmin } from "@/lib/auth/cookies";
import { categorySchema } from "@/validations/product";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await getCategories();
    return apiSuccess({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = categorySchema.parse(body);
    const category = await createCategory(input);
    revalidateTag("categories", { expire: 0 });
    return apiSuccess({ category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
