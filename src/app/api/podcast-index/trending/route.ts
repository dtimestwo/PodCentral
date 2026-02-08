import { NextRequest, NextResponse } from "next/server";
import { getTrendingPodcasts } from "@/lib/podcast-index/client";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per window
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

  // Validate and sanitize inputs
  const rawMax = parseInt(searchParams.get("max") || "20", 10);
  const max = Math.min(100, Math.max(1, isNaN(rawMax) ? 20 : rawMax));

  const rawLang = searchParams.get("lang") || "en";
  const lang = rawLang.slice(0, 10).replace(/[^a-zA-Z-]/g, "") || "en";

  const rawCategories = searchParams.get("cat");
  const categories = rawCategories?.slice(0, 50).replace(/[^a-zA-Z0-9,-]/g, "") || undefined;

  try {
    const podcasts = await getTrendingPodcasts(max, lang, categories);

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
    console.error("Podcast Index trending error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending podcasts" },
      { status: 500 }
    );
  }
}
