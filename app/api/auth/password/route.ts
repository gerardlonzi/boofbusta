import { NextRequest } from "next/server";
import { forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth";
import { requestPasswordReset, resetPassword, verifyEmail } from "@/services/auth.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);
    await requestPasswordReset(input.email);
    return apiSuccess({ message: "Email envoyé si le compte existe" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);
    await resetPassword(input.token, input.password);
    return apiSuccess({ message: "Mot de passe réinitialisé" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) throw new Error("Token required");
    await verifyEmail(token);
    return apiSuccess({ message: "Email vérifié" });
  } catch (error) {
    return handleApiError(error);
  }
}
