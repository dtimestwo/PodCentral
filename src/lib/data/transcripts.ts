import { createClient } from "@/lib/supabase/server";
import type { TranscriptSegment } from "@/lib/types";

export async function getTranscriptByEpisodeId(episodeId: string): Promise<TranscriptSegment[]> {
  const supabase = await createClient();

  const { data: segments, error } = await supabase
    .from("transcript_segments")
    .select("*")
    .eq("episode_id", episodeId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching transcript:", error);
    return [];
  }

  return segments.map((seg: { start_time: number; end_time: number; speaker: string; text: string }) => ({
    startTime: seg.start_time,
    endTime: seg.end_time,
    speaker: seg.speaker,
    text: seg.text,
  }));
}
