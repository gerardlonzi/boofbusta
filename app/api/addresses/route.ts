import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/cookies";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/services/user.service";
import { addressSchema } from "@/validations/commerce";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const addresses = await getUserAddresses(session.userId);
    return apiSuccess({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = addressSchema.parse(body);
    const address = await createAddress(session.userId, input);
    return apiSuccess({ address }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { id, ...data } = body;
    const input = addressSchema.partial().parse(data);
    const address = await updateAddress(id, session.userId, input);
    return apiSuccess({ address });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) throw new Error("id required");
    await deleteAddress(id, session.userId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
