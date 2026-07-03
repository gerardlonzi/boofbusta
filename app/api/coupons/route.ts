import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/user.service";
import { couponSchema } from "@/validations/commerce";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await getCoupons();
    return apiSuccess({ coupons });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = couponSchema.parse(body);
    const coupon = await createCoupon(input);
    return apiSuccess({ coupon }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const { id, ...data } = await request.json();
    const input = couponSchema.partial().parse(data);
    const coupon = await updateCoupon(id, input);
    return apiSuccess({ coupon });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) throw new Error("id required");
    await deleteCoupon(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
