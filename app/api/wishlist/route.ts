import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/cookies";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} from "@/services/wishlist.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const wishlist = await getWishlist(session.userId);
    return apiSuccess({ wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const { productId, action } = await request.json();

    if (action === "moveToCart") {
      const result = await moveToCart(session.userId, productId);
      return apiSuccess(result);
    }

    const wishlist = await addToWishlist(session.userId, productId);
    return apiSuccess({ wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) throw new Error("productId required");
    const wishlist = await removeFromWishlist(session.userId, productId);
    return apiSuccess({ wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}
