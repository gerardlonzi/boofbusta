import { prisma } from "@/lib/prisma";
import { calculateCartTotals } from "@/lib/commerce/totals";
import { AppError } from "@/lib/api-response";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
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

  if (!cart) {
    cart = await prisma.cart.create({
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

  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const totals = calculateCartTotals(
    cart.items.map((item) => ({
      price: item.product.price,
      quantity: item.quantity,
    }))
  );
  return { ...cart, totals };
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    throw new AppError("Produit indisponible", 400);
  }
  if (product.stock < quantity) {
    throw new AppError("Stock insuffisant", 400);
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) throw new AppError("Stock insuffisant", 400);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) throw new AppError("Article introuvable dans le panier", 404);

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (quantity > item.product.stock) {
      throw new AppError("Stock insuffisant", 400);
    }
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  return getCart(userId);
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) throw new AppError("Article introuvable", 404);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
}
