import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: { message, code } },
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.message, error.statusCode, error.code);
  }
  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat()[0];
    return NextResponse.json(
      {
        success: false,
        error: {
          message: typeof firstMessage === "string" ? firstMessage : "Validation failed",
          code: "VALIDATION_ERROR",
          details: fieldErrors,
        },
      },
      { status: 422 }
    );
  }
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return apiError("Unauthorized", 401);
    if (error.message === "Forbidden") return apiError("Forbidden", 403);
  }
  console.error("[API Error]", error);
  return apiError("Internal server error", 500, "INTERNAL_ERROR");
}
