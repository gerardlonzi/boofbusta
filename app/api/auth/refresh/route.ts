/**
 * app/api/auth/refresh/route.ts
 *
 * Renouvelle l'access token depuis un refresh token valide.
 * Appelé par le client quand une requête retourne 401.
 *
 * - Lit le refresh token dans le cookie HTTP-only (jamais dans le body)
 * - Vérifie sa validité via verifyRefreshToken
 * - Émet un nouvel access token et le pose en cookie
 * - Retourne 401 si le refresh token est absent ou invalide → le client doit logout
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  signAccessToken,
} from "@/lib/auth/jwt";
import {
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { apiSuccess, handleApiError, AppError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      throw new AppError("Refresh token manquant", 401);
    }

    const session = await verifyRefreshToken(refreshToken);

    if (!session) {
      // Token invalide ou expiré → le client doit déconnecter l'utilisateur
      throw new AppError("Refresh token invalide ou expiré", 401);
    }

    // Émettre un nouvel access token (le refresh token reste inchangé)
    const newAccessToken = await signAccessToken(session);

    const response = NextResponse.json(
      apiSuccess({ refreshed: true }),
      { status: 200 }
    );

    return setAuthCookies(response, newAccessToken, refreshToken);
  } catch (error) {
    return handleApiError(error);
  }
}