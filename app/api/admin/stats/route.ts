import { requireAdmin } from "@/lib/auth/cookies";
import { getAdminStats } from "@/services/order.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminStats();
    return apiSuccess({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
