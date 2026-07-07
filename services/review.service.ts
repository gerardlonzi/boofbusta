import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-response";
import type { ReviewInput } from "@/validations/commerce";

export async function createReview(userId: string, input: ReviewInput) {
  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: { userId, productId: input.productId },
    },
  });
  if (existing) throw new AppError("Vous avez déjà laissé un avis", 409);

  const hasOrdered = await prisma.orderItem.findFirst({
    where: {
      productId: input.productId,
      order: { userId, paymentStatus: "PAID" },
    },
  });
  if (!hasOrdered) {
    throw new AppError("Vous devez avoir acheté ce produit pour laisser un avis", 403);
  }

  return prisma.review.create({
    data: { userId, ...input },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
  });
}

export async function replyToReview(reviewId: string, adminReply: string) {
  return prisma.review.update({
    where: { id: reviewId },
    data: { adminReply },
  });
}

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllReviews(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count(),
  ]);
  return { reviews, pagination: { page, limit, total } };
}
