import { NextRequest } from "next/server";
import { requireSession, requireAdmin } from "@/lib/auth/cookies";
import { getOrderById } from "@/services/order.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const isAdmin = session.role === "ADMIN";
    const order = await getOrderById(id, isAdmin ? undefined : session.userId);
    return apiSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
