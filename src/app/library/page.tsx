"use client";

import { useMemo, useEffect, useState } from "react";
import { LibraryIcon, ListMusicIcon, ClockIcon, DownloadIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { useLibraryStore } from "@/stores/library-store";
import { useAudioStore } from "@/lib/audio-store";
import { createClient } from "@/lib/supabase/client";
import type { Chapter } from "@/lib/types";

interface LocalPodcast {
  id: string;
  title: string;
  author: string;
  image: string;
}

interface LocalEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  datePublished: string;
  duration: number;
  enclosureUrl: string;
  image?: string;
}

export default function LibraryPage() {
  const subscriptions = useLibraryStore((s) => s.subscriptions);
  const history = useLibraryStore((s) => s.history);
  const hasHydrated = useLibraryStore((s) => s.hasHydrated);
  const queue = useAudioStore((s) => s.queue);

  const [podcasts, setPodcasts] = useState<LocalPodcast[]>([]);
  const [episodes, setEpisodes] = useState<LocalEpisode[]>([]);
  const [chaptersByEpisode, setChaptersByEpisode] = useState<Record<string, Chapter[]>>({});
  const [loading, setLoading] = useState(true);

  // Fetch subscribed podcasts and history episodes from Supabase
  useEffect(() => {
    // Wait for Zustand store to hydrate from localStorage
    if (!hasHydrated) {
      return;
    }

    async function fetchData() {
      // Filter to only valid UUIDs (Supabase IDs are UUIDs, filter out old dummy IDs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validSubscriptions = subscriptions.filter(id => uuidRegex.test(id));
      const validHistoryIds = history.map(h => h.episodeId).filter(id => uuidRegex.test(id));

      if (validSubscriptions.length === 0 && validHistoryIds.length === 0) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Fetch subscribed podcasts
      if (validSubscriptions.length > 0) {
        const { data: podcastData } = await supabase
          .from("podcasts")
          .select("id, title, author, image")
          .in("id", validSubscriptions);

        if (podcastData) {
          setPodcasts(
            podcastData.map((p: { id: string; title: string; author: string; image: string | null }) => ({
              id: p.id,
              title: p.title,
              author: p.author,
              image: p.image || "https://picsum.photos/seed/podcast/400/400",
            }))
          );
        }
      }

      // Fetch history episodes
      if (validHistoryIds.length > 0) {
        const { data: episodeData } = await supabase
          .from("episodes")
          .select("id, podcast_id, title, description, date_published, duration, enclosure_url, image")
          .in("id", validHistoryIds);

        if (episodeData) {
          setEpisodes(
            episodeData.map((e: {
              id: string;
              podcast_id: string;
              title: string;
              description: string;
              date_published: string;
              duration: number;
              enclosure_url: string;
              image: string | null;
            }) => ({
              id: e.id,
              podcastId: e.podcast_id,
              title: e.title,
              description: e.description,
              datePublished: e.date_published,
              duration: e.duration,
              enclosureUrl: e.enclosure_url,
              image: e.image || undefined,
            }))
          );

          // Fetch chapters for these episodes
          const { data: chapters } = await supabase
            .from("chapters")
            .select("id, episode_id, title, start_time, end_time")
            .in("episode_id", validHistoryIds);

          if (chapters) {
            const byEpisode: Record<string, Chapter[]> = {};
            chapters.forEach((ch: { episode_id: string; title: string; start_time: number; end_time: number | null }) => {
              if (!byEpisode[ch.episode_id]) byEpisode[ch.episode_id] = [];
              byEpisode[ch.episode_id].push({
                title: ch.title,
                startTime: ch.start_time,
                endTime: ch.end_time || undefined,
              });
            });
            setChaptersByEpisode(byEpisode);
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [subscriptions, history, hasHydrated]);

  const subscribedPodcasts = useMemo(
    () => podcasts.filter((p) => subscriptions.includes(p.id)),
    [podcasts, subscriptions]
  );

  const podcastMap = useMemo(
    () => new Map(podcasts.map((p) => [p.id, p])),
    [podcasts]
  );
  const episodeMap = useMemo(
    () => new Map(episodes.map((e) => [e.id, e])),
    [episodes]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <LibraryIcon className="size-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Your subscriptions, queue, and listening history
          </p>
        </div>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">
            Subscriptions ({subscribedPodcasts.length})
          </TabsTrigger>
          <TabsTrigger value="queue">
            Queue ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({history.length})
          </TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          {!hasHydrated || loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : subscribedPodcasts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {subscribedPodcasts.map((podcast) => (
                <PodcastCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              No subscriptions yet. Browse podcasts and hit Subscribe.
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          {queue.length > 0 ? (
            <div className="flex flex-col">
              {queue.map((track, i) => {
                const trackId = typeof track.id === "string" ? track.id : String(track.id ?? "");
                const episode = episodeMap.get(trackId);
                if (!episode) {
                  // For queue items not in our fetched episodes, show minimal info
                  return (
                    <div key={`${trackId}-${i}`} className="flex items-center gap-3 rounded-lg px-3 py-2">
                      <span className="text-sm">{track.title}</span>
                    </div>
                  );
                }
                const podcast = podcastMap.get(episode.podcastId);
                const chapters = chaptersByEpisode[episode.id] || [];
                return (
                  <EpisodeRow
                    key={`${trackId}-${i}`}
                    episode={episode}
                    podcastTitle={podcast?.title}
                    podcastImage={podcast?.image}
                    showPodcastName
                    chapters={chapters}
                    chapterCount={chapters.length}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <ListMusicIcon className="size-8" />
              <p>Your queue is empty</p>
              <p className="text-xs">
                Add episodes to your queue from any episode or podcast page
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {!hasHydrated || loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : history.length > 0 ? (
            <div className="flex flex-col">
              {history.map((entry) => {
                const episode = episodeMap.get(entry.episodeId);
                if (!episode) return null;
                const podcast = podcastMap.get(episode.podcastId);
                const chapters = chaptersByEpisode[episode.id] || [];
                return (
                  <EpisodeRow
                    key={entry.episodeId}
                    episode={episode}
                    podcastTitle={podcast?.title}
                    podcastImage={podcast?.image}
                    showPodcastName
                    chapters={chapters}
                    chapterCount={chapters.length}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <ClockIcon className="size-8" />
              <p>No listening history yet</p>
              <p className="text-xs">
                Episodes you play will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="downloads" className="mt-4">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <DownloadIcon className="size-8" />
            <p>Downloads coming soon</p>
            <p className="text-xs">
              Offline playback will be available in a future update
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
