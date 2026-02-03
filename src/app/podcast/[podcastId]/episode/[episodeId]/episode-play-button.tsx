"use client";

import { PlayIcon, ZapIcon, MessageSquareIcon, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAudioStore } from "@/lib/audio-store";

export function EpisodePlayButton({
  episodeId,
  enclosureUrl,
  title,
  artist,
  artwork,
  duration,
}: {
  episodeId: string;
  enclosureUrl: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
}) {
  const setQueueAndPlay = useAudioStore((s) => s.setQueueAndPlay);

  const handlePlay = () => {
    setQueueAndPlay(
      [{ id: episodeId, url: enclosureUrl, title, artist, artwork, duration }],
      0
    );
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button onClick={handlePlay}>
        <PlayIcon className="mr-1 size-4" fill="currentColor" /> Play Episode
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" disabled aria-label="Boost (coming soon)">
            <ZapIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" disabled aria-label="Comment (coming soon)">
            <MessageSquareIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" disabled aria-label="Share (coming soon)">
            <ShareIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
    </div>
  );
}
