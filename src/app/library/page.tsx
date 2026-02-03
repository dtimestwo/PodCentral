"use client";

import { useMemo } from "react";
import { LibraryIcon, ListMusicIcon, ClockIcon, DownloadIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { useLibraryStore } from "@/stores/library-store";
import { podcasts } from "@/data/podcasts";
import { episodes } from "@/data/episodes";
import { getChaptersByEpisodeId } from "@/data/chapters";
import { useAudioStore } from "@/lib/audio-store";

export default function LibraryPage() {
  const subscriptions = useLibraryStore((s) => s.subscriptions);
  const history = useLibraryStore((s) => s.history);
  const queue = useAudioStore((s) => s.queue);

  const subscribedPodcasts = useMemo(
    () => podcasts.filter((p) => subscriptions.includes(p.id)),
    [subscriptions]
  );

  const podcastMap = useMemo(
    () => new Map(podcasts.map((p) => [p.id, p])),
    []
  );
  const episodeMap = useMemo(
    () => new Map(episodes.map((e) => [e.id, e])),
    []
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
          {subscribedPodcasts.length > 0 ? (
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
                if (!episode) return null;
                const podcast = podcastMap.get(episode.podcastId);
                return (
                  <EpisodeRow
                    key={`${trackId}-${i}`}
                    episode={episode}
                    podcastTitle={podcast?.title}
                    podcastImage={podcast?.image}
                    showPodcastName
                    chapterCount={getChaptersByEpisodeId(episode.id).length}
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
          {history.length > 0 ? (
            <div className="flex flex-col">
              {history.map((entry) => {
                const episode = episodeMap.get(entry.episodeId);
                if (!episode) return null;
                const podcast = podcastMap.get(episode.podcastId);
                return (
                  <EpisodeRow
                    key={entry.episodeId}
                    episode={episode}
                    podcastTitle={podcast?.title}
                    podcastImage={podcast?.image}
                    showPodcastName
                    chapterCount={getChaptersByEpisodeId(episode.id).length}
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
              This feature will be available when a database is connected
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
