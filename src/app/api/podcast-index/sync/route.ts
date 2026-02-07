import { NextRequest, NextResponse } from "next/server";
import { syncPodcastFromIndex } from "@/lib/podcast-index/sync";

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// Helper to verify origin for CSRF protection
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) return true; // Same-origin requests may not have origin header

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { feedId } = body;

    if (!feedId || typeof feedId !== "number") {
      return NextResponse.json(
        { error: "feedId is required and must be a number" },
        { status: 400 }
      );
    }

    // Validate feedId is a reasonable positive integer
    if (feedId <= 0 || feedId > Number.MAX_SAFE_INTEGER || !Number.isInteger(feedId)) {
      return NextResponse.json(
        { error: "Invalid feedId" },
        { status: 400 }
      );
    }

    const result = await syncPodcastFromIndex(feedId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      podcastId: result.podcastId,
      episodesCreated: result.episodesCreated,
      episodesUpdated: result.episodesUpdated,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to sync podcast" },
      { status: 500 }
    );
  }
}
