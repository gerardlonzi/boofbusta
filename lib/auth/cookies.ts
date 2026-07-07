import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { JwtPayload } from "@/types/auth";
import { verifyAccessToken, verifyRefreshToken } from "./jwt";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    return verifyRefreshToken(refreshToken);
  }

  return null;
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<JwtPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
