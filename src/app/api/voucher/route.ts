import { NextRequest } from "next/server";
import { voucherService } from "@/services/voucher.service";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/utils/errors";
import { UserRole, VoucherStatus } from "@prisma/client";

async function getAuthContext(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const token = parts[1];
  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role as UserRole,
    username: payload.username,
  };
}

/**
 * GET /api/voucher
 * List reward vouchers with query filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const merchantId = searchParams.get("merchantId") || undefined;

    const statusParam = searchParams.get("status");
    const status =
      statusParam === "AVAILABLE" || statusParam === "OUT_OF_STOCK" || statusParam === "EXPIRED"
        ? (statusParam as VoucherStatus)
        : undefined;

    const minPointCost = searchParams.get("minPointCost") ? parseInt(searchParams.get("minPointCost")!, 10) : undefined;
    const maxPointCost = searchParams.get("maxPointCost") ? parseInt(searchParams.get("maxPointCost")!, 10) : undefined;

    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder =
      sortOrderParam === "asc" || sortOrderParam === "desc" ? (sortOrderParam as "asc" | "desc") : undefined;

    const result = await voucherService.listVouchers({
      page,
      limit,
      search,
      categoryId,
      merchantId,
      status,
      minPointCost,
      maxPointCost,
      sortBy,
      sortOrder,
    });

    return successResponse(result.vouchers, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/voucher
 * Creates a new voucher (UMKM/Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await voucherService.createVoucher(user.id, user.role, body);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
