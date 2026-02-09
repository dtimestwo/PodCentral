import { NextRequest } from "next/server";

/**
 * Validates that the request origin matches the host (CSRF protection)
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Same-origin requests may not have origin header
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Simple in-memory rate limiter factory
 * Note: This doesn't persist across serverless instances
 */
export function createRateLimiter(limit: number, windowMs: number = 60000) {
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= limit) {
      return true;
    }

    record.count++;
    return false;
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}
