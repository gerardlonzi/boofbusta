import { NextRequest } from "next/server";
import { requireSession, requireAdmin } from "@/lib/auth/cookies";
import { createReview, getAllReviews, replyToReview } from "@/services/review.service";
import { reviewSchema } from "@/validations/commerce";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const isAdmin = request.nextUrl.searchParams.get("admin") === "true";
    if (isAdmin) {
      await requireAdmin();
      const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
      const result = await getAllReviews(page);
      return apiSuccess(result);
    }

    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) throw new Error("productId required");
    const { getProductReviews } = await import("@/services/review.service");
    const reviews = await getProductReviews(productId);
    return apiSuccess({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = reviewSchema.parse(body);
    const review = await createReview(session.userId, input);
    return apiSuccess({ review }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const { reviewId, adminReply } = await request.json();
    const review = await replyToReview(reviewId, adminReply);
    return apiSuccess({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
