import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPodcastFromIndex } from "@/lib/podcast-index/sync";
import { isValidOrigin, createRateLimiter, getClientIP } from "@/lib/api/middleware";

// Rate limiter: 10 requests per minute
const isRateLimited = createRateLimiter(10, 60000);

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  // Authentication required
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to add podcasts" },
      { status: 401 }
    );
  }

  // Rate limiting
  const ip = getClientIP(request);
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
