import { NextRequest } from "next/server";
import { requireSession, requireAdmin } from "@/lib/auth/cookies";
import {
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  updateOrderStatus,
} from "@/services/order.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const isAdmin = request.nextUrl.searchParams.get("admin") === "true";

    if (isAdmin) {
      await requireAdmin();
      const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
      const result = await getAdminOrders(page);
      return apiSuccess(result);
    }

    const session = await requireSession();
    const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const result = await getUserOrders(session.userId, page);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, status } = body;

    if (action === "cancel") {
      const session = await requireSession();
      const order = await cancelOrder(orderId, session.userId);
      return apiSuccess({ order });
    }

    if (action === "updateStatus") {
      await requireAdmin();
      const order = await updateOrderStatus(orderId, status);
      return apiSuccess({ order });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return handleApiError(error);
  }
}
