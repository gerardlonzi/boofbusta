import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }
    return apiSuccess({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
