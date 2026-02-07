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

export async function syncPodcastFromIndex(feedId: number): Promise<SyncResult> {
  try {
    // Fetch podcast from Podcast Index
    const podcast = await getPodcastByFeedId(feedId);
    if (!podcast) {
      return { success: false, error: "Podcast not found in Podcast Index" };
    }

    // Fetch episodes
    const episodes = await getEpisodesByFeedId(feedId);

    // Sync to Supabase
    const supabase = createAdminClient();

    // Upsert podcast
    const categories = Object.keys(podcast.categories || {}).map((key) =>
      podcast.categories[key].toLowerCase().replace(/\s+/g, "")
    );

    const { data: podcastData, error: podcastError } = await supabase
      .from("podcasts")
      .upsert(
        {
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
        },
        { onConflict: "podcast_index_id" }
      )
      .select("id")
      .single();

    if (podcastError) {
      return { success: false, error: `Failed to upsert podcast: ${podcastError.message}` };
    }

    const podcastId = podcastData.id;

    // Sync funding if present (with error handling)
    if (podcast.funding) {
      const { error: fundingError } = await supabase.from("podcast_funding").upsert(
        {
          podcast_id: podcastId,
          url: podcast.funding.url,
          message: podcast.funding.message,
        },
        { onConflict: "podcast_id" }
      );
      if (fundingError) {
        console.error("Failed to sync funding:", fundingError);
      }
    }

    // Sync value config if present (with error handling)
    if (podcast.value) {
      const { data: valueConfig, error: valueError } = await supabase
        .from("value_configs")
        .upsert(
          {
            podcast_id: podcastId,
            type: podcast.value.model.type,
            method: podcast.value.model.method,
          },
          { onConflict: "podcast_id" }
        )
        .select("id")
        .single();

      if (valueError) {
        console.error("Failed to sync value config:", valueError);
      } else if (valueConfig && podcast.value.destinations) {
        // Delete existing recipients and insert new ones
        const { error: deleteError } = await supabase
          .from("value_recipients")
          .delete()
          .eq("value_config_id", valueConfig.id);

        if (deleteError) {
          console.error("Failed to delete old recipients:", deleteError);
        }

        const { error: insertError } = await supabase.from("value_recipients").insert(
          podcast.value.destinations.map((dest) => ({
            value_config_id: valueConfig.id,
            name: dest.name,
            type: dest.type,
            address: dest.address,
            split: dest.split,
          }))
        );

        if (insertError) {
          console.error("Failed to insert recipients:", insertError);
        }
      }
    }

    // Sync episodes using batch operations to eliminate N+1 queries
    let episodesCreated = 0;
    let episodesUpdated = 0;

    // Get all existing episodes for this podcast in one query
    const episodeIndexIds = episodes.map((e) => e.id);
    const { data: existingEpisodes } = await supabase
      .from("episodes")
      .select("id, podcast_index_id")
      .in("podcast_index_id", episodeIndexIds);

    const existingMap = new Map(
      (existingEpisodes || []).map((e) => [e.podcast_index_id, e.id])
    );

    // Separate episodes into updates and inserts
    const toUpdate: { id: string; data: Record<string, unknown> }[] = [];
    const toInsert: Record<string, unknown>[] = [];
    const episodeMetadata: Map<number, PodcastIndexEpisode> = new Map();

    for (const episode of episodes) {
      episodeMetadata.set(episode.id, episode);
      const episodeData = {
        podcast_id: podcastId,
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
      };

      const existingId = existingMap.get(episode.id);
      if (existingId) {
        toUpdate.push({ id: existingId, data: episodeData });
      } else {
        toInsert.push(episodeData);
      }
    }

    // Batch update existing episodes
    for (const { id, data } of toUpdate) {
      const { error } = await supabase.from("episodes").update(data).eq("id", id);
      if (!error) episodesUpdated++;
    }

    // Batch insert new episodes
    if (toInsert.length > 0) {
      const { data: insertedEpisodes, error: insertError } = await supabase
        .from("episodes")
        .insert(toInsert)
        .select("id, podcast_index_id");

      if (!insertError && insertedEpisodes) {
        episodesCreated = insertedEpisodes.length;

        // Batch sync related data for new episodes
        const soundbitesToInsert: Record<string, unknown>[] = [];
        const socialInteractToInsert: Record<string, unknown>[] = [];

        for (const inserted of insertedEpisodes) {
          const originalEpisode = episodeMetadata.get(inserted.podcast_index_id);
          if (!originalEpisode) continue;

          // Collect persons for batch sync
          if (originalEpisode.persons) {
            try {
              await syncEpisodePersons(supabase, inserted.id, originalEpisode.persons);
            } catch (e) {
              console.error(`Failed to sync persons for episode ${inserted.id}:`, e);
            }
          }

          // Sync chapters if URL is available
          if (originalEpisode.chaptersUrl) {
            await syncChapters(supabase, inserted.id, originalEpisode.chaptersUrl);
          }

          // Sync transcript if URL is available
          if (originalEpisode.transcriptUrl) {
            await syncTranscript(supabase, inserted.id, originalEpisode.transcriptUrl);
          }

          // Collect soundbites
          if (originalEpisode.soundbites) {
            for (const sb of originalEpisode.soundbites) {
              soundbitesToInsert.push({
                episode_id: inserted.id,
                start_time: sb.startTime,
                duration: sb.duration,
                title: sb.title,
              });
            }
          } else if (originalEpisode.soundbite) {
            soundbitesToInsert.push({
              episode_id: inserted.id,
              start_time: originalEpisode.soundbite.startTime,
              duration: originalEpisode.soundbite.duration,
              title: originalEpisode.soundbite.title,
            });
          }

          // Collect social interact
          if (originalEpisode.socialInteract) {
            for (const si of originalEpisode.socialInteract) {
              socialInteractToInsert.push({
                episode_id: inserted.id,
                uri: si.url,
                protocol: si.protocol,
                account_url: si.accountUrl,
              });
            }
          }
        }

        // Batch insert soundbites with error handling
        if (soundbitesToInsert.length > 0) {
          const { error } = await supabase.from("soundbites").insert(soundbitesToInsert);
          if (error) console.error("Failed to insert soundbites:", error);
        }

        // Batch insert social interact with error handling
        if (socialInteractToInsert.length > 0) {
          const { error } = await supabase.from("social_interact").insert(socialInteractToInsert);
          if (error) console.error("Failed to insert social_interact:", error);
        }
      }
    }

    // Update episode count
    await supabase
      .from("podcasts")
      .update({ episode_count: episodes.length })
      .eq("id", podcastId);

    return {
      success: true,
      podcastId,
      episodesCreated,
      episodesUpdated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function syncEpisodePersons(
  supabase: ReturnType<typeof createAdminClient>,
  episodeId: string,
  persons: NonNullable<PodcastIndexEpisode["persons"]>
) {
  for (const person of persons) {
    // Upsert person
    const { data: personData } = await supabase
      .from("persons")
      .upsert(
        {
          name: person.name,
          role: mapPersonRole(person.role),
          group_name: person.group || null,
          img: person.img || `https://i.pravatar.cc/150?u=${encodeURIComponent(person.name)}`,
          href: person.href || null,
        },
        { onConflict: "name,role" }
      )
      .select("id")
      .single();

    if (personData) {
      // Link to episode
      await supabase
        .from("episode_persons")
        .upsert(
          { episode_id: episodeId, person_id: personData.id },
          { onConflict: "episode_id,person_id" }
        );
    }
  }
}

function mapPersonRole(role: string): "host" | "guest" | "editor" | "producer" {
  const roleLower = role.toLowerCase();
  if (roleLower.includes("host")) return "host";
  if (roleLower.includes("guest")) return "guest";
  if (roleLower.includes("editor")) return "editor";
  if (roleLower.includes("producer")) return "producer";
  return "guest"; // default
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

async function syncChapters(
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

    // Delete existing chapters for this episode
    await supabase.from("chapters").delete().eq("episode_id", episodeId);

    // Insert new chapters
    const chapters = data.chapters.map((ch) => ({
      episode_id: episodeId,
      start_time: ch.startTime,
      end_time: ch.endTime || null,
      title: ch.title,
      img: ch.img || null,
      url: ch.url || null,
    }));

    await supabase.from("chapters").insert(chapters);
  } catch (e) {
    console.error(`Failed to sync chapters for episode ${episodeId}:`, e);
  }
}

// Parse VTT/SRT transcript format
function parseTranscript(content: string, format: string): { startTime: number; endTime: number; speaker: string | null; text: string }[] {
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
      const timestampMatch = trimmed.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
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

        currentStart = parseInt(timestampMatch[1]) * 3600 + parseInt(timestampMatch[2]) * 60 + parseInt(timestampMatch[3]) + parseInt(timestampMatch[4]) / 1000;
        currentEnd = parseInt(timestampMatch[5]) * 3600 + parseInt(timestampMatch[6]) * 60 + parseInt(timestampMatch[7]) + parseInt(timestampMatch[8]) / 1000;
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

async function syncTranscript(
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

    // Delete existing transcript segments for this episode
    await supabase.from("transcript_segments").delete().eq("episode_id", episodeId);

    // Insert new transcript segments
    const toInsert = segments.map((seg) => ({
      episode_id: episodeId,
      start_time: seg.startTime,
      end_time: seg.endTime,
      speaker: seg.speaker,
      text: seg.text,
    }));

    await supabase.from("transcript_segments").insert(toInsert);
  } catch (e) {
    console.error(`Failed to sync transcript for episode ${episodeId}:`, e);
  }
}
