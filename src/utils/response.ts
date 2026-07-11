import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { logger } from "../lib/logger";

export interface StandardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(data: T, statusCode = 200, meta?: StandardResponse["meta"]): NextResponse<StandardResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: statusCode }
  );
}

export function errorResponse(error: unknown): NextResponse<any> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
        ...(process.env.NODE_ENV !== "production" && {
          message: error.message,
          details: error.details || null,
          errorCode: error.code,
        }),
      },
      { status: error.statusCode }
    );
  }

  // Fallback for unexpected errors
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  logger.error("Unhandled API Error", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" ? "Internal Server Error" : errorMsg,
      },
      ...(process.env.NODE_ENV !== "production" && {
        message: errorMsg,
        details: errorStack || null,
        errorCode: "INTERNAL_SERVER_ERROR",
      }),
    },
    { status: 500 }
  );
}
