import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/cookies";
import { createOrder } from "@/services/order.service";
import { checkoutSchema } from "@/validations/commerce";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const result = await createOrder(session.userId, input);
    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
