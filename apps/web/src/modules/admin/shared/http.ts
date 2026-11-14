import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {ZodError, type ZodType} from "zod";
import {requireAdmin, type StaffIdentity, type StaffRole} from "@/lib/admin";

/** Domain failure with an HTTP mapping. Thrown by services, rendered by `staffRoute`. */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/** JSON response that serialises bigint (paise) as decimal strings and is never cacheable. */
export function jsonResponse(body: unknown, status = 200): NextResponse {
  return new NextResponse(JSON.stringify(body, (_k, v) => (typeof v === "bigint" ? v.toString() : v)), {
    status,
    headers: {"Content-Type": "application/json", "Cache-Control": "no-store"}
  });
}

export const errorResponse = (status: number, code: string, message: string, details?: unknown): NextResponse =>
  jsonResponse({error: {code, message, ...(details === undefined ? {} : {details})}}, status);

/**
 * Body reader with a CSRF-hardening content-type requirement: a cross-site HTML form cannot send application/json.
 */
export async function readJson(req: Request): Promise<unknown> {
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    throw new ApiError(415, "JSON_REQUIRED", "Content-Type must be application/json.");
  }
  try { return await req.json(); } catch { throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON."); }
}

/** Validates with zod and converts failures to a 422 listing the offending paths (never echoing values). */
export function parse<T>(schema: ZodType<T>, raw: unknown): T {
  const r = schema.safeParse(raw);
  if (!r.success) throw new ApiError(422, "VALIDATION_FAILED", "Request failed validation.", r.error.issues.map(i => ({path: i.path.join("."), message: i.message})));
  return r.data;
}

export type RouteCtx<P> = {req: Request; staff: StaffIdentity; params: P};

/**
 * Controller wrapper. Every admin API goes through the staff gate (active AdminUser + allowed role) BEFORE any body parsing
 * or database work, then maps domain/Prisma failures to stable error codes. Database outage => 503, never a fake success.
 */
export function staffRoute<P = Record<string, never>>(roles: readonly StaffRole[], handler: (ctx: RouteCtx<P>) => Promise<Response>) {
  return async (req: Request, routeCtx: {params: Promise<P>}): Promise<Response> => {
    let staff: StaffIdentity | null;
    try { staff = await requireAdmin(roles); } catch { return errorResponse(503, "DB_UNAVAILABLE", "Staff authorisation could not be verified. No action was taken."); }
    if (!staff) return errorResponse(403, "FORBIDDEN", "Forbidden.");
    try {
      const params = (routeCtx?.params ? await routeCtx.params : {}) as P;
      return await handler({req, staff, params});
    } catch (e) {
      if (e instanceof ApiError) return errorResponse(e.status, e.code, e.message, e.details);
      if (e instanceof ZodError) return errorResponse(422, "VALIDATION_FAILED", "Request failed validation.");
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") return errorResponse(409, "CONFLICT", "A record with these unique values already exists.");
        if (e.code === "P2025") return errorResponse(404, "NOT_FOUND", "Record not found.");
      }
      if (e instanceof Prisma.PrismaClientInitializationError || e instanceof Prisma.PrismaClientRustPanicError) {
        return errorResponse(503, "DB_UNAVAILABLE", "Database unavailable. No change was made.");
      }
      console.error("admin route failure", e instanceof Error ? e.name : "unknown");
      return errorResponse(500, "INTERNAL", "Unexpected error. No change was claimed.");
    }
  };
}

