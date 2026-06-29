import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/cookies";
import { getCart, addToCart, updateCartItem, removeFromCart } from "@/services/cart.service";
import { cartItemSchema, updateCartItemSchema } from "@/validations/commerce";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const cart = await getCart(session.userId);
    return apiSuccess({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = cartItemSchema.parse(body);
    const cart = await addToCart(session.userId, input.productId, input.quantity);
    return apiSuccess({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { productId, ...rest } = body;
    const input = updateCartItemSchema.parse(rest);
    const cart = await updateCartItem(session.userId, productId, input.quantity);
    return apiSuccess({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) throw new Error("productId required");
    const cart = await removeFromCart(session.userId, productId);
    return apiSuccess({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}
