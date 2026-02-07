import { createClient } from "@/lib/supabase/server";
import type { Podcast, ValueConfig, ValueRecipient } from "@/lib/types";

export async function getPodcasts(): Promise<Podcast[]> {
  const supabase = await createClient();

  const { data: podcasts, error } = await supabase
    .from("podcasts")
    .select(`
      *,
      podcast_funding (url, message),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching podcasts:", error);
    return [];
  }

  return podcasts.map(mapDbPodcastToApp);
}

export async function getPodcastById(id: string): Promise<Podcast | null> {
  const supabase = await createClient();

  const { data: podcast, error } = await supabase
    .from("podcasts")
    .select(`
      *,
      podcast_funding (url, message),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching podcast:", error);
    return null;
  }

  return mapDbPodcastToApp(podcast);
}

export async function getPodcastsByCategory(categoryId: string): Promise<Podcast[]> {
  const supabase = await createClient();

  const { data: podcasts, error } = await supabase
    .from("podcasts")
    .select(`
      *,
      podcast_funding (url, message),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .contains("categories", [categoryId])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching podcasts by category:", error);
    return [];
  }

  return podcasts.map(mapDbPodcastToApp);
}

export async function searchPodcasts(query: string): Promise<Podcast[]> {
  const supabase = await createClient();

  const { data: podcasts, error } = await supabase
    .from("podcasts")
    .select(`
      *,
      podcast_funding (url, message),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching podcasts:", error);
    return [];
  }

  return podcasts.map(mapDbPodcastToApp);
}

// Helper to map database row to app type
interface DbPodcast {
  id: string;
  podcast_index_id: number | null;
  title: string;
  author: string;
  description: string;
  image: string;
  categories: string[];
  locked: boolean;
  medium: "podcast" | "music" | "video" | "audiobook";
  language: string;
  episode_count: number;
  license: string | null;
  location: string | null;
  podcast_funding?: { url: string; message: string }[];
  value_configs?: {
    id: string;
    type: string;
    method: string;
    value_recipients: { name: string; type: string; address: string; split: number }[];
  }[];
}

function mapDbPodcastToApp(db: DbPodcast): Podcast {
  const valueConfig = db.value_configs?.[0];
  let value: ValueConfig | undefined;

  if (valueConfig && valueConfig.value_recipients?.length > 0) {
    value = {
      type: valueConfig.type as "lightning",
      method: valueConfig.method as "keysend",
      recipients: valueConfig.value_recipients.map((r) => ({
        name: r.name,
        type: r.type as ValueRecipient["type"],
        address: r.address,
        split: r.split,
      })),
    };
  }

  return {
    id: db.id,
    title: db.title,
    author: db.author,
    description: db.description,
    image: db.image,
    categories: db.categories,
    locked: db.locked,
    medium: db.medium,
    language: db.language,
    episodeCount: db.episode_count,
    license: db.license ?? undefined,
    location: db.location ?? undefined,
    funding: db.podcast_funding?.map((f) => ({ url: f.url, message: f.message })),
    value,
  };
}
