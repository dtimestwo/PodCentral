"use client";

import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/lib/audio-store";
import type { Chapter, Soundbite } from "@/lib/types";
import { formatDurationFromSeconds } from "@/lib/format";

export function SoundbiteList({
  soundbites,
  episodeId,
  enclosureUrl,
  title,
  artist,
  artwork,
  duration,
  chapters,
}: {
  soundbites: Soundbite[];
  episodeId: string;
  enclosureUrl: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  chapters?: Chapter[];
}) {
  const setQueueAndPlay = useAudioStore((s) => s.setQueueAndPlay);
  const seek = useAudioStore((s) => s.seek);
  const currentTrack = useAudioStore((s) => s.currentTrack);

  const handlePlayClip = (startTime: number) => {
    const isCurrentEpisode = currentTrack?.id === episodeId;
    if (isCurrentEpisode) {
      seek(startTime);
    } else {
      setQueueAndPlay(
        [{ id: episodeId, url: enclosureUrl, title, artist, artwork, duration, chapters }],
        0
      );
      setTimeout(() => seek(startTime), 500);
    }
  };

  return (
    <div className="grid max-w-2xl grid-cols-2 gap-3">
      {soundbites.map((sb) => (
        <div
          key={sb.id}
          className="flex flex-col gap-1 rounded-lg border p-3"
        >
          <p className="text-sm font-medium">{sb.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDurationFromSeconds(sb.startTime)} &mdash;{" "}
            {formatDurationFromSeconds(sb.startTime + sb.duration)} (
            {sb.duration}s)
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => handlePlayClip(sb.startTime)}
          >
            <PlayIcon className="mr-1 size-3" fill="currentColor" /> Play Clip
          </Button>
        </div>
      ))}
    </div>
  );
}
