import { NextRequest, NextResponse } from "next/server";
import { getTrendingPodcasts } from "@/lib/podcast-index/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const max = parseInt(searchParams.get("max") || "20", 10);
  const lang = searchParams.get("lang") || "en";
  const categories = searchParams.get("cat") || undefined;

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

    return NextResponse.json({ podcasts: results });
  } catch (error) {
    console.error("Podcast Index trending error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending podcasts" },
      { status: 500 }
    );
  }
}
