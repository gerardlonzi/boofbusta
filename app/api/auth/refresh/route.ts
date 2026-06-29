import { NextRequest } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { REFRESH_TOKEN_COOKIE, setAuthCookies } from "@/lib/auth/cookies";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return apiError("Unauthorized", 401);

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) return apiError("Invalid refresh token", 401);

    const accessToken = await signAccessToken(payload);
    const response = apiSuccess({ refreshed: true });
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    return handleApiError(error);
  }
}
