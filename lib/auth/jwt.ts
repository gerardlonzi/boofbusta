import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import type { JwtPayload } from "@/types/auth";

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

function getAccessSecret() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

function getRefreshSecret() {
  return new TextEncoder().encode(env.JWT_REFRESH_SECRET ?? env.JWT_SECRET);
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
