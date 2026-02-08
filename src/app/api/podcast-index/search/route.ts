import { NextRequest, NextResponse } from "next/server";
import { searchPodcasts } from "@/lib/podcast-index/client";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
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

// Sanitize search query to prevent injection attacks
function sanitizeQuery(query: string): string {
  // Trim and limit length
  let sanitized = query.trim().slice(0, 200);
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
  // Remove potentially dangerous characters for API calls
  sanitized = sanitized.replace(/[<>'";&|`$\\]/g, "");
  return sanitized;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get("q");

  if (!rawQuery) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const query = sanitizeQuery(rawQuery);

  if (query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const podcasts = await searchPodcasts(query);

    // Map to simplified format
    const results = podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.author || p.ownerName,
      description: p.description,
      image: p.artwork || p.image,
      episodeCount: p.episodeCount,
      language: p.language,
      categories: Object.values(p.categories || {}),
    }));

    return NextResponse.json(
      { podcasts: results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Podcast Index search error:", error);
    return NextResponse.json(
      { error: "Failed to search podcasts" },
      { status: 500 }
    );
  }
}
