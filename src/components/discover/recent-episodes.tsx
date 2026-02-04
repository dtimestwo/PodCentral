import { ClockIcon } from "lucide-react";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { getChaptersByEpisodeId } from "@/data/chapters";
import type { Episode, Podcast } from "@/lib/types";

export function RecentEpisodes({
  episodes,
  podcasts,
}: {
  episodes: Episode[];
  podcasts: Podcast[];
}) {
  const podcastMap = new Map(podcasts.map((p) => [p.id, p]));

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <ClockIcon className="size-5 text-muted-foreground" />
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
              chapters={getChaptersByEpisodeId(episode.id)}
              chapterCount={getChaptersByEpisodeId(episode.id).length}
            />
          );
        })}
      </div>
    </section>
  );
}
