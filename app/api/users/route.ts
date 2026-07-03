import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { getUsers, updateUserRole, toggleUserActive } from "@/services/user.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const result = await getUsers(page);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const { id, action, role } = await request.json();

    if (action === "toggleActive") {
      const user = await toggleUserActive(id);
      return apiSuccess({ user });
    }

    if (action === "updateRole") {
      const user = await updateUserRole(id, role);
      return apiSuccess({ user });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return handleApiError(error);
  }
}
