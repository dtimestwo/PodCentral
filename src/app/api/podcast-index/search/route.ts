import { NextRequest, NextResponse } from "next/server";
import { searchPodcasts } from "@/lib/podcast-index/client";

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

    return NextResponse.json({ podcasts: results });
  } catch (error) {
    console.error("Podcast Index search error:", error);
    return NextResponse.json(
      { error: "Failed to search podcasts" },
      { status: 500 }
    );
  }
}
