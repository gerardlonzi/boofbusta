import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { securityHeaders } from "@/lib/security";

const PROTECTED_PREFIXES = ["/account", "/checkout"];
const ADMIN_PREFIX = "/admin";
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let session = accessToken ? await verifyAccessToken(accessToken) : null;
  let shouldRefresh = false;

  if (!session && refreshToken) {
    session = await verifyRefreshToken(refreshToken);
    shouldRefresh = !!session;
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  async function withFreshCookies(response: NextResponse) {
    if (shouldRefresh && session && refreshToken) {
      const newAccessToken = await signAccessToken(session);
      return setAuthCookies(response, newAccessToken, refreshToken);
    }
    return response;
  }

  if ((isProtected || isAdmin) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return securityHeaders(await withFreshCookies(NextResponse.redirect(url)));
  }

  if (isAdmin && session?.role !== "ADMIN") {
    return securityHeaders(
      await withFreshCookies(NextResponse.redirect(new URL("/", request.url)))
    );
  }

  if (isAuthPage && session) {
    return securityHeaders(
      await withFreshCookies(NextResponse.redirect(new URL("/account", request.url)))
    );
  }

  return securityHeaders(await withFreshCookies(NextResponse.next()));
}

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
