import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/api-response";
import { generateToken } from "@/lib/utils";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import type { RegisterInput, LoginInput } from "@/validations/auth";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });
  if (existing) {
    throw new AppError("Email ou nom d'utilisateur déjà utilisé", 409);
  }

  const verifyToken = generateToken();
  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      verifyToken,
    },
  });

  await Promise.all([
    prisma.cart.create({ data: { userId: user.id } }),
    prisma.wishlist.create({ data: { userId: user.id } }),
    sendWelcomeEmail(user.email, user.firstName),
    sendVerificationEmail(user.email, verifyToken),
  ]);

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "CUSTOMER",
  };

  return {
    user: sanitizeUser(user),
    accessToken: await signAccessToken(payload),
    refreshToken: await signRefreshToken(payload),
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new AppError("Identifiants invalides", 401);
  }

  const valid = await verifyPassword(input.password, user.password);
  if (!valid) {
    throw new AppError("Identifiants invalides", 401);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "CUSTOMER",
  };

  return {
    user: sanitizeUser(user),
    accessToken: await signAccessToken(payload),
    refreshToken: await signRefreshToken(payload),
  };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) throw new AppError("Token invalide", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const resetToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExp: new Date(Date.now() + 3600_000),
    },
  });
  await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  });
  if (!user) throw new AppError("Token invalide ou expiré", 400);

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    },
  });
}

function sanitizeUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatar: string | null;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    avatar: user.avatar,
  };
}
