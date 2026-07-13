import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-response";
import type { AddressInput, CouponInput } from "@/validations/commerce";

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(userId: string, input: AddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return prisma.address.create({ data: { userId, ...input } });
}

export async function updateAddress(
  id: string,
  userId: string,
  input: Partial<AddressInput>
) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError("Address not found", 404);

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return prisma.address.update({ where: { id }, data: input });
}

export async function deleteAddress(id: string, userId: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError("Address not found", 404);
  return prisma.address.delete({ where: { id } });
}

export async function createCoupon(input: CouponInput) {
  const existing = await prisma.coupon.findUnique({
    where: { code: input.code },
  });
  if (existing) throw new AppError("promotion code already exist", 409);
  return prisma.coupon.create({ data: input });
}

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  return prisma.coupon.update({ where: { id }, data: input });
}

export async function deleteCoupon(id: string) {
  return prisma.coupon.delete({ where: { id } });
}

export async function getUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);
  return { users, pagination: { page, limit, total } };
}

export async function updateUserRole(id: string, role: "ADMIN" | "CUSTOMER") {
  return prisma.user.update({ where: { id }, data: { role } });
}

export async function toggleUserActive(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
}

export async function updateProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
    },
  });
}
