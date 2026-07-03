import { NextRequest } from "next/server";
import { productQuerySchema } from "@/validations/product";
import { getProducts, createProduct } from "@/services/product.service";
import { requireAdmin } from "@/lib/auth/cookies";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = productQuerySchema.parse(params);
    const result = await getProducts(query);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { productSchema } = await import("@/validations/product");
    const input = productSchema.parse(body);
    const product = await createProduct(input);
    return apiSuccess({ product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
