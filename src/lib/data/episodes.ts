import { createClient } from "@/lib/supabase/server";
import type { Episode, Person, SocialInteract, ValueConfig, ValueRecipient } from "@/lib/types";

export async function getEpisodesByPodcastId(podcastId: string): Promise<Episode[]> {
  const supabase = await createClient();

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(`
      *,
      episode_persons (
        persons (id, name, role, group_name, img, href)
      ),
      social_interact (uri, protocol, account_url),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .eq("podcast_id", podcastId)
    .order("date_published", { ascending: false });

  if (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }

  return episodes.map(mapDbEpisodeToApp);
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  const supabase = await createClient();

  const { data: episode, error } = await supabase
    .from("episodes")
    .select(`
      *,
      episode_persons (
        persons (id, name, role, group_name, img, href)
      ),
      social_interact (uri, protocol, account_url),
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
    console.error("Error fetching episode:", error);
    return null;
  }

  return mapDbEpisodeToApp(episode);
}

export async function getRecentEpisodes(limit = 10): Promise<Episode[]> {
  const supabase = await createClient();

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(`
      *,
      episode_persons (
        persons (id, name, role, group_name, img, href)
      ),
      social_interact (uri, protocol, account_url),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .order("date_published", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent episodes:", error);
    return [];
  }

  return episodes.map(mapDbEpisodeToApp);
}

export async function searchEpisodes(query: string): Promise<Episode[]> {
  const supabase = await createClient();

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(`
      *,
      episode_persons (
        persons (id, name, role, group_name, img, href)
      ),
      social_interact (uri, protocol, account_url),
      value_configs (
        id,
        type,
        method,
        value_recipients (name, type, address, split)
      )
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("date_published", { ascending: false });

  if (error) {
    console.error("Error searching episodes:", error);
    return [];
  }

  return episodes.map(mapDbEpisodeToApp);
}

// Helper to map database row to app type
interface DbEpisode {
  id: string;
  podcast_id: string;
  title: string;
  description: string;
  date_published: string;
  duration: number;
  enclosure_url: string;
  image: string | null;
  season: number | null;
  episode: number | null;
  is_trailer: boolean;
  episode_persons?: {
    persons: {
      id: string;
      name: string;
      role: string;
      group_name: string | null;
      img: string;
      href: string | null;
    };
  }[];
  social_interact?: {
    uri: string;
    protocol: string;
    account_url: string | null;
  }[];
  value_configs?: {
    id: string;
    type: string;
    method: string;
    value_recipients: { name: string; type: string; address: string; split: number }[];
  }[];
}

function mapDbEpisodeToApp(db: DbEpisode): Episode {
  const persons: Person[] = (db.episode_persons || []).map((ep) => ({
    id: ep.persons.id,
    name: ep.persons.name,
    role: ep.persons.role as Person["role"],
    group: ep.persons.group_name ?? undefined,
    img: ep.persons.img,
    href: ep.persons.href ?? undefined,
  }));

  const socialInteract: SocialInteract[] | undefined =
    db.social_interact?.map((si) => ({
      uri: si.uri,
      protocol: si.protocol as SocialInteract["protocol"],
      accountUrl: si.account_url ?? undefined,
    }));

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
    podcastId: db.podcast_id,
    title: db.title,
    description: db.description,
    datePublished: db.date_published,
    duration: db.duration,
    enclosureUrl: db.enclosure_url,
    image: db.image ?? undefined,
    season: db.season ?? undefined,
    episode: db.episode ?? undefined,
    isTrailer: db.is_trailer,
    persons,
    socialInteract: socialInteract?.length ? socialInteract : undefined,
    value,
  };
}
