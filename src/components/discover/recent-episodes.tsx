"use client";

import { ClockIcon } from "lucide-react";
import { EpisodeRow } from "@/components/podcast/episode-row";

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

interface LocalPodcast {
  id: string;
  title: string;
  image: string;
}

export function RecentEpisodes({
  episodes,
  podcasts,
}: {
  episodes: LocalEpisode[];
  podcasts: LocalPodcast[];
}) {
  const podcastMap = new Map(podcasts.map((p) => [p.id, p]));

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <ClockIcon className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Recently Published</h2>
      </div>
      <div className="flex flex-col">
        {episodes.map((episode) => {
          const podcast = podcastMap.get(episode.podcastId);
          return (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              podcastTitle={podcast?.title}
              podcastImage={podcast?.image}
              showPodcastName
            />
          );
        })}
      </div>
    </section>
  );
}
