import { NextRequest } from "next/server";
import { loginSchema } from "@/validations/auth";
import { loginUser } from "@/services/auth.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth/cookies";
import { rateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(input);

    const response = apiSuccess({ user: result.user });
    return setAuthCookies(response, result.accessToken, result.refreshToken);
  } catch (error) {
    return handleApiError(error);
  }
}
