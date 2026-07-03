import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { isCloudinaryEnabled } from "@/lib/env";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    if (!isCloudinaryEnabled()) {
      return apiError("Cloudinary not configured. Add CLOUDINARY_* keys to .env", 503);
    }

    const body = await request.json();
    const { file, folder } = body;
    if (!file) return apiError("File required", 400);

    const result = await uploadImage(file, folder);
    return apiSuccess({ ...result }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const publicId = request.nextUrl.searchParams.get("publicId");
    if (!publicId) return apiError("publicId required", 400);
    await deleteImage(publicId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
