"use client";

import { memo } from "react";
import { PlayIcon, ClockIcon, ListPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAudioStore } from "@/lib/audio-store";
import type { Episode } from "@/lib/types";
import { formatDurationFromSeconds, formatDate } from "@/lib/format";
import Link from "next/link";

export const EpisodeRow = memo(function EpisodeRow({
  episode,
  podcastTitle,
  podcastImage,
  showPodcastName = false,
  chapterCount = 0,
}: {
  episode: Episode;
  podcastTitle?: string;
  podcastImage?: string;
  showPodcastName?: boolean;
  chapterCount?: number;
}) {
  const setQueueAndPlay = useAudioStore((s) => s.setQueueAndPlay);
  const addToQueue = useAudioStore((s) => s.addToQueue);

  const handlePlay = () => {
    setQueueAndPlay(
      [
        {
          id: episode.id,
          url: episode.enclosureUrl,
          title: episode.title,
          artist: podcastTitle || "",
          artwork: episode.image || podcastImage || "",
          duration: episode.duration,
        },
      ],
      0
    );
  };

  const handleAddToQueue = () => {
    addToQueue({
      id: episode.id,
      url: episode.enclosureUrl,
      title: episode.title,
      artist: podcastTitle || "",
      artwork: episode.image || podcastImage || "",
      duration: episode.duration,
    });
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent">
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 rounded-full"
        onClick={handlePlay}
        aria-label={`Play ${episode.title}`}
      >
        <PlayIcon className="size-4" fill="currentColor" />
      </Button>

      <div className="min-w-0 flex-1">
        <Link
          href={`/podcast/${episode.podcastId}/episode/${episode.id}`}
          className="block"
        >
          <p className="truncate text-sm font-medium hover:underline">
            {episode.isTrailer && (
              <Badge variant="outline" className="mr-2 text-xs">
                Trailer
              </Badge>
            )}
            {episode.season && episode.episode && (
              <span className="text-muted-foreground">
                S{episode.season}E{episode.episode}{" "}
              </span>
            )}
            {episode.title}
          </p>
        </Link>
        {showPodcastName && podcastTitle && (
          <p className="truncate text-xs text-muted-foreground">
            {podcastTitle}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(episode.datePublished)}</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            {formatDurationFromSeconds(episode.duration)}
          </span>
          {chapterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {chapterCount} chapters
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleAddToQueue} aria-label="Add to queue">
              <ListPlusIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to Queue</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
