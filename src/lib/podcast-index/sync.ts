import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPodcastByFeedId,
  getEpisodesByFeedId,
  type PodcastIndexPodcast,
  type PodcastIndexEpisode,
} from "./client";

interface SyncResult {
  success: boolean;
  podcastId?: string;
  episodesCreated?: number;
  episodesUpdated?: number;
  error?: string;
}

/**
 * Transform podcast data from Podcast Index API format to sync RPC format
 */
function transformPodcastForSync(podcast: PodcastIndexPodcast) {
  const categories = Object.keys(podcast.categories || {}).map((key) =>
    podcast.categories[key].toLowerCase().replace(/\s+/g, "")
  );

  return {
    podcast_index_id: podcast.id,
    title: podcast.title,
    author: podcast.author || podcast.ownerName,
    description: podcast.description,
    image: podcast.artwork || podcast.image,
    categories,
    locked: podcast.locked === 1,
    medium: "podcast",
    language: podcast.language || "en",
    episode_count: podcast.episodeCount,
    feed_url: podcast.url,
    funding: podcast.funding
      ? {
          url: podcast.funding.url,
          message: podcast.funding.message,
        }
      : null,
    value: podcast.value
      ? {
          model: {
            type: podcast.value.model.type,
            method: podcast.value.model.method,
          },
          destinations: podcast.value.destinations,
        }
      : null,
  };
}

/**
 * Transform episode data from Podcast Index API format to sync RPC format
 */
function transformEpisodeForSync(episode: PodcastIndexEpisode) {
  return {
    podcast_index_id: episode.id,
    title: episode.title,
    description: episode.description,
    date_published: new Date(episode.datePublished * 1000).toISOString(),
    duration: episode.duration,
    enclosure_url: episode.enclosureUrl,
    image: episode.image || null,
    season: episode.season,
    episode: episode.episode,
    is_trailer: episode.episodeType === "trailer",
    chapters_url: episode.chaptersUrl,
    transcript_url: episode.transcriptUrl,
    persons: episode.persons
      ? episode.persons.map((p) => ({
          name: p.name,
          role: p.role,
          group_name: p.group || null,
          img: p.img || null,
          href: p.href || null,
        }))
      : null,
    soundbite: episode.soundbite,
    soundbites: episode.soundbites,
    social_interact: episode.socialInteract
      ? episode.socialInteract.map((si) => ({
          uri: si.url,
          protocol: si.protocol,
          account_url: si.accountUrl,
        }))
      : null,
  };
}

/**
 * Sync a podcast and its episodes from Podcast Index to the database.
 * Uses PostgreSQL RPC functions to ensure all operations are atomic.
 */
export async function syncPodcastFromIndex(feedId: number): Promise<SyncResult> {
  try {
    // 1. Fetch podcast from Podcast Index
    const podcast = await getPodcastByFeedId(feedId);
    if (!podcast) {
      return { success: false, error: "Podcast not found in Podcast Index" };
    }

    // 2. Fetch episodes
    const episodes = await getEpisodesByFeedId(feedId);

    // 3. Transform to JSON format for RPC
    const podcastData = transformPodcastForSync(podcast);
    const episodeData = episodes.map(transformEpisodeForSync);

    // 4. Call atomic RPC function for core sync
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("sync_podcast_from_api", {
      p_podcast: podcastData,
      p_episodes: episodeData,
    });

    if (error) {
      return { success: false, error: `Sync failed: ${error.message}` };
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.podcast_id) {
      return { success: false, error: "Sync returned no podcast ID" };
    }

    // 5. Sync external resources (chapters, transcripts) after main transaction
    // These require fetching from external URLs and can fail independently
    await syncExternalResources(supabase, result.podcast_id, episodes);

    return {
      success: true,
      podcastId: result.podcast_id,
      episodesCreated: result.episodes_created,
      episodesUpdated: result.episodes_updated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sync external resources (chapters, transcripts) that require HTTP fetches.
 * These are done after the main sync transaction since they can fail independently.
 */
async function syncExternalResources(
  supabase: ReturnType<typeof createAdminClient>,
  podcastId: string,
  episodes: PodcastIndexEpisode[]
) {
  // Get episode IDs from database to map podcast_index_id to UUID
  const { data: dbEpisodes } = await supabase
    .from("episodes")
    .select("id, podcast_index_id")
    .eq("podcast_id", podcastId);

  if (!dbEpisodes) return;

  const episodeMap = new Map(
    dbEpisodes.map((e) => [e.podcast_index_id, e.id])
  );

  // Sync chapters and transcripts for each episode
  for (const episode of episodes) {
    const episodeId = episodeMap.get(episode.id);
    if (!episodeId) continue;

    // Sync chapters if URL is available
    if (episode.chaptersUrl) {
      await syncChaptersAtomic(supabase, episodeId, episode.chaptersUrl);
    }

    // Sync transcript if URL is available
    if (episode.transcriptUrl) {
      await syncTranscriptAtomic(supabase, episodeId, episode.transcriptUrl);
    }
  }
}

// Podcast Namespace Chapters JSON format
interface ChaptersJson {
  version: string;
  chapters: {
    startTime: number;
    endTime?: number;
    title: string;
    img?: string;
    url?: string;
  }[];
}

/**
 * Fetch chapters from URL and sync atomically using RPC
 */
async function syncChaptersAtomic(
  supabase: ReturnType<typeof createAdminClient>,
  episodeId: string,
  chaptersUrl: string
) {
  try {
    const response = await fetch(chaptersUrl, {
      headers: { "User-Agent": "PodCentral/1.0" },
    });
    if (!response.ok) return;

    const data: ChaptersJson = await response.json();
    if (!data.chapters || data.chapters.length === 0) return;

    // Transform to RPC format
    const chapters = data.chapters.map((ch) => ({
      start_time: ch.startTime,
      end_time: ch.endTime || null,
      title: ch.title,
      img: ch.img || null,
      url: ch.url || null,
    }));

    // Use RPC for atomic delete+insert
    await supabase.rpc("sync_episode_chapters", {
      p_episode_id: episodeId,
      p_chapters: chapters,
    });
  } catch (e) {
    console.error(`Failed to sync chapters for episode ${episodeId}:`, e);
  }
}

// Parse VTT/SRT transcript format
function parseTranscript(
  content: string,
  format: string
): { startTime: number; endTime: number; speaker: string | null; text: string }[] {
  const segments: { startTime: number; endTime: number; speaker: string | null; text: string }[] = [];

  if (format === "application/json" || format === "application/json+podcast-transcript") {
    // JSON transcript format
    try {
      const data = JSON.parse(content);
      const entries = data.segments || data.cues || data;
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          segments.push({
            startTime: entry.startTime || entry.start || 0,
            endTime: entry.endTime || entry.end || entry.startTime + 5,
            speaker: entry.speaker || null,
            text: entry.body || entry.text || "",
          });
        }
      }
    } catch {
      // Failed to parse JSON transcript
    }
  } else {
    // VTT/SRT format
    const lines = content.split("\n");
    let currentStart = 0;
    let currentEnd = 0;
    let currentText = "";
    let currentSpeaker: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse timestamp line (VTT: "00:00:00.000 --> 00:00:05.000" or SRT: "00:00:00,000 --> 00:00:05,000")
      const timestampMatch = trimmed.match(
        /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/
      );
      if (timestampMatch) {
        // Save previous segment if exists
        if (currentText) {
          segments.push({
            startTime: currentStart,
            endTime: currentEnd,
            speaker: currentSpeaker,
            text: currentText.trim(),
          });
          currentText = "";
          currentSpeaker = null;
        }

        currentStart =
          parseInt(timestampMatch[1]) * 3600 +
          parseInt(timestampMatch[2]) * 60 +
          parseInt(timestampMatch[3]) +
          parseInt(timestampMatch[4]) / 1000;
        currentEnd =
          parseInt(timestampMatch[5]) * 3600 +
          parseInt(timestampMatch[6]) * 60 +
          parseInt(timestampMatch[7]) +
          parseInt(timestampMatch[8]) / 1000;
        continue;
      }

      // Check for speaker tag <v Speaker Name>
      const speakerMatch = trimmed.match(/<v\s+([^>]+)>/);
      if (speakerMatch) {
        currentSpeaker = speakerMatch[1];
        currentText += trimmed.replace(/<v\s+[^>]+>/, "").replace(/<\/v>/, "") + " ";
        continue;
      }

      // Skip VTT header and numeric cue identifiers
      if (trimmed === "WEBVTT" || /^\d+$/.test(trimmed) || trimmed === "") {
        continue;
      }

      // Regular text line
      currentText += trimmed + " ";
    }

    // Save last segment
    if (currentText) {
      segments.push({
        startTime: currentStart,
        endTime: currentEnd,
        speaker: currentSpeaker,
        text: currentText.trim(),
      });
    }
  }

  return segments;
}

/**
 * Fetch transcript from URL and sync atomically using RPC
 */
async function syncTranscriptAtomic(
  supabase: ReturnType<typeof createAdminClient>,
  episodeId: string,
  transcriptUrl: string
) {
  try {
    const response = await fetch(transcriptUrl, {
      headers: { "User-Agent": "PodCentral/1.0" },
    });
    if (!response.ok) return;

    const contentType = response.headers.get("content-type") || "";
    const content = await response.text();

    const segments = parseTranscript(content, contentType);
    if (segments.length === 0) return;

    // Transform to RPC format
    const segmentData = segments.map((seg) => ({
      start_time: Math.floor(seg.startTime),
      end_time: Math.floor(seg.endTime),
      speaker: seg.speaker || "",
      text: seg.text,
    }));

    // Use RPC for atomic delete+insert
    await supabase.rpc("sync_episode_transcript", {
      p_episode_id: episodeId,
      p_segments: segmentData,
    });
  } catch (e) {
    console.error(`Failed to sync transcript for episode ${episodeId}:`, e);
  }
}
