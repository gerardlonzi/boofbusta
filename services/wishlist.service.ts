import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-response";
import { addToCart } from "./cart.service";

async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              images: true,
              stock: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  return wishlist;
}

export async function getWishlist(userId: string) {
  return getOrCreateWishlist(userId);
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    throw new AppError("Product unavailable", 400);
  }

  const wishlist = await getOrCreateWishlist(userId);
  const exists = wishlist.items.some((i) => i.productId === productId);
  if (exists) throw new AppError("Product already in wishlist", 409);

  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
  });

  return getOrCreateWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const item = wishlist.items.find((i) => i.productId === productId);
  if (!item) throw new AppError("Product not found", 404);

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  return getOrCreateWishlist(userId);
}

export async function moveToCart(userId: string, productId: string) {
  await addToCart(userId, productId, 1);
  await removeFromWishlist(userId, productId);
  return { wishlist: await getOrCreateWishlist(userId) };
}
