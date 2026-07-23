import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import {
  calculateCartTotals,
  applyCoupon,
} from "@/lib/commerce/totals";
import { AppError } from "@/lib/api-response";
import { isStripeEnabled } from "@/lib/env";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { getCart } from "./cart.service";
import type { CheckoutInput } from "@/validations/commerce";

export async function createOrder(
  userId: string,
  input: CheckoutInput
) {
  const cart = await getCart(userId);

  if (cart.items.length === 0) {
    throw new AppError("Panier vide", 400);
  }

  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE") {
      throw new AppError(
        `${item.product.name} n'est plus disponible`,
        400
      );
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(
        `Stock insuffisant pour ${item.product.name}`,
        400
      );
    }
  }

  let couponId: string | undefined;
  let discount = 0;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: input.couponCode.toUpperCase(),
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError("Coupon invalide", 400);
    }

    if (
      coupon.expiresAt &&
      coupon.expiresAt < new Date()
    ) {
      throw new AppError("Coupon expiré", 400);
    }

    if (
      coupon.maxUses &&
      coupon.usedCount >= coupon.maxUses
    ) {
      throw new AppError(
        "Coupon épuisé",
        400
      );
    }

    if (
      coupon.minPurchase &&
      cart.totals.subtotal < coupon.minPurchase
    ) {
      throw new AppError(
        "Montant minimum non atteint",
        400
      );
    }

    discount = applyCoupon(
      cart.totals.subtotal,
      coupon.type,
      coupon.value
    );

    couponId = coupon.id;
  }

  const totals = calculateCartTotals(
    cart.items.map((item) => ({
      price: item.product.price,
      quantity: item.quantity,
    })),
    discount
  );

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,

      userId,

      subtotal: totals.subtotal,

      tax: totals.tax,

      shipping: totals.shipping,

      discount: totals.discount,

      total: totals.total,

      paymentMethod:
        input.paymentMethod === "bitcoin"
          ? "BITCOIN"
          : "STRIPE",

      status: "PENDING",

      paymentStatus: "PENDING",

      shippingAddress:
        input.shippingAddress,

      billingAddress:
        input.billingAddress ??
        input.shippingAddress,

      shippingMethod:
        input.shippingMethod,

      couponId,

      notes: input.notes,

      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,

          name: item.product.name,

          price: item.product.price,

          quantity: item.quantity,

          image:
            item.product.images[0] ?? null,
        })),
      },
    },

    include: {
      user: true,
      items: true,
    },
  });

  /**
   * STRIPE
   */

  if (
    input.paymentMethod === "stripe" &&
    isStripeEnabled()
  ) {
    const session =
      await createCheckoutSession({
        orderId: order.id,

        orderNumber:
          order.orderNumber,

        customerEmail:
          order.user.email,

        items: order.items.map((item) => ({
          name: item.name,

          price: item.price,

          quantity: item.quantity,

          image:
            item.image ?? undefined,
        })),
      });

    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        stripeSessionId:
          session.id,
      },
    });

    return {
      order,

      paymentMethod: "stripe",

      checkoutUrl:
        session.url,
    };
  }

  /**
   * BITCOIN
   */

  if (
    input.paymentMethod ===
    "bitcoin"
  ) {
    return {
      order,

      paymentMethod:
        "bitcoin",

      checkoutUrl:
        `/checkout/bitcoin/${order.id}`,
    };
  }

  return {
    order,

    paymentMethod:
      "offline",

    checkoutUrl: null,
  };
}

export async function confirmOrderPayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus === "PAID") {
    return order;
  }

  await prisma.$transaction(async (tx) => {
    // Décrémenter le stock seulement maintenant
    for (const item of order.items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Compter le coupon comme utilisé
    if (order.couponId) {
      await tx.coupon.update({
        where: {
          id: order.couponId,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });
  });

  await clearCart(order.userId);

  await sendOrderConfirmationEmail(
    order.user.email,
    order.orderNumber,
    order.total
  );

  return prisma.order.findUnique({
    where: {
      id: order.id,
    },
    include: {
      items: true,
      user: true,
    },
  });
}


export async function confirmStripePayment(sessionId: string) {
  const order = await prisma.order.findFirst({
    where: {
      stripeSessionId: sessionId,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return confirmOrderPayment(order.id);
}


export async function getUserOrders(
  userId: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
        bitcoinPayment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOrderById(
  orderId: string,
  userId?: string
) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
            },
          },
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      coupon: true,
      bitcoinPayment: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (userId && order.userId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return order;
}

export async function cancelOrder(
  orderId: string,
  userId: string
) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  if (
    order.status !== "PENDING" &&
    order.status !== "CONFIRMED"
  ) {
    throw new AppError(
      "This order cannot be cancelled",
      400
    );
  }

  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELLED",
    },
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

export async function getAdminOrders(
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
        bitcoinPayment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count(),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminStats() {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    revenue,
  ] = await Promise.all([
    prisma.order.count(),

    prisma.product.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    revenue: revenue._sum.total ?? 0,
  };
}