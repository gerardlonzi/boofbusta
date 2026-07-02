import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { calculateCartTotals, applyCoupon } from "@/lib/commerce/totals";
import { AppError } from "@/lib/api-response";
import { isStripeEnabled } from "@/lib/env";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { clearCart, getCart } from "./cart.service";
import type { CheckoutInput } from "@/validations/commerce";

export async function createOrder(userId: string, input: CheckoutInput) {
  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw new AppError("Panier vide", 400);
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Stock insuffisant pour ${item.product.name}`, 400);
    }
  }

  let couponId: string | undefined;
  let discount = 0;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) {
      throw new AppError("Coupon invalide", 400);
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new AppError("Coupon expiré", 400);
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError("Coupon épuisé", 400);
    }
    discount = applyCoupon(cart.totals.subtotal, coupon.type, coupon.value);
    couponId = coupon.id;
  }

  const totals = calculateCartTotals(
    cart.items.map((i) => ({ price: i.product.price, quantity: i.quantity })),
    discount
  );

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount,
        total: totals.total,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress ?? input.shippingAddress,
        shippingMethod: input.shippingMethod,
        couponId,
        notes: input.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images[0] ?? null,
          })),
        },
      },
      include: { items: true, user: true },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  let checkoutUrl: string | null = null;

  if (isStripeEnabled()) {
    try {
      const session = await createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.user.email,
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? undefined,
        })),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      checkoutUrl = session.url;
    } catch (stripeError) {
      console.error("[Stripe] Payment unavailable, confirming order directly:", stripeError);
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      });
      await clearCart(userId);
      await sendOrderConfirmationEmail(
        order.user.email,
        order.orderNumber,
        order.total
      );
    }
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED", paymentStatus: "PAID" },
    });
    await clearCart(userId);
    await sendOrderConfirmationEmail(
      order.user.email,
      order.orderNumber,
      order.total
    );
  }

  return { order, checkoutUrl };
}

export async function confirmPayment(sessionId: string) {
  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { user: true },
  });
  if (!order) throw new AppError("Order not found", 404);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  await clearCart(order.userId);
  await sendOrderConfirmationEmail(
    order.user.email,
    order.orderNumber,
    order.total
  );

  return order;
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderById(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      user: { select: { firstName: true, lastName: true, email: true } },
      coupon: true,
    },
  });
  if (!order) throw new AppError("Order not found", 404);
  if (userId && order.userId !== userId) {
    throw new AppError("Accès refusé", 403);
  }
  return order;
}

export async function cancelOrder(orderId: string, userId: string) {
  const order = await getOrderById(orderId, userId);
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    throw new AppError("Cette commande ne peut pas être annulée", 400);
  }

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", paymentStatus: "REFUNDED" },
    });
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: true },
  });

  if (status === "SHIPPED") {
    const { sendShippingEmail } = await import("@/lib/email");
    await sendShippingEmail(order.user.email, order.orderNumber);
  }

  return order;
}

export async function getAdminOrders(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count(),
  ]);
  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAdminStats() {
  const [totalOrders, totalProducts, totalUsers, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    revenue: revenue._sum.total ?? 0,
  };
}
