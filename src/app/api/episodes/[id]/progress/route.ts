import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: episodeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { progress } = body;

    if (typeof progress !== "number" || progress < 0) {
      return NextResponse.json(
        { error: "progress must be a non-negative number" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("listening_history")
      .upsert(
        {
          user_id: user.id,
          episode_id: episodeId,
          progress,
          last_played: new Date().toISOString(),
        },
        { onConflict: "user_id,episode_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: episodeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ progress: 0 });
  }

  const { data } = await supabase
    .from("listening_history")
    .select("progress, last_played")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .single();

  return NextResponse.json({
    progress: data?.progress ?? 0,
    lastPlayed: data?.last_played ?? null,
  });
}
