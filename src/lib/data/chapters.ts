import { createClient } from "@/lib/supabase/server";
import type { Chapter } from "@/lib/types";

export async function getChaptersByEpisodeId(episodeId: string): Promise<Chapter[]> {
  const supabase = await createClient();

  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("episode_id", episodeId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }

  return chapters.map((ch: { start_time: number; end_time: number | null; title: string; img: string | null; url: string | null }) => ({
    startTime: ch.start_time,
    endTime: ch.end_time ?? undefined,
    title: ch.title,
    img: ch.img ?? undefined,
    url: ch.url ?? undefined,
  }));
}
