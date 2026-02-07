"use client";

import { PlayIcon, ZapIcon, MessageSquareIcon, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/lib/audio-store";
import type { Chapter } from "@/lib/types";

export function EpisodePlayButton({
  podcastId,
  episodeId,
  enclosureUrl,
  title,
  artist,
  artwork,
  duration,
  chapters,
}: {
  podcastId: string;
  episodeId: string;
  enclosureUrl: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  chapters?: Chapter[];
}) {
  const setQueueAndPlay = useAudioStore((s) => s.setQueueAndPlay);

  const handlePlay = () => {
    setQueueAndPlay(
      [{ id: episodeId, podcastId, url: enclosureUrl, title, artist, artwork, duration, chapters }],
      0
    );
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={handlePlay} title="Start playing this episode">
        <PlayIcon className="mr-1 size-4" fill="currentColor" /> Play Episode
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Boost (coming soon)"
        title="Send sats to the creator (coming soon)"
      >
        <ZapIcon className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Comment (coming soon)"
        title="Leave a comment (coming soon)"
      >
        <MessageSquareIcon className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Share (coming soon)"
        title="Share this episode (coming soon)"
      >
        <ShareIcon className="size-4" />
      </Button>
    </div>
  );
}
