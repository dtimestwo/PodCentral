import { createClient } from "@/lib/supabase/server";
import type { Soundbite } from "@/lib/types";

export async function getSoundbitesByEpisodeId(episodeId: string): Promise<Soundbite[]> {
  const supabase = await createClient();

  const { data: soundbites, error } = await supabase
    .from("soundbites")
    .select("*")
    .eq("episode_id", episodeId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching soundbites:", error);
    return [];
  }

  return soundbites.map((sb: { id: string; episode_id: string; start_time: number; duration: number; title: string }) => ({
    id: sb.id,
    episodeId: sb.episode_id,
    startTime: sb.start_time,
    duration: sb.duration,
    title: sb.title,
  }));
}
