"use client";

import Image from "next/image";
import { useAudioStore } from "@/lib/audio-store";
import type { Chapter } from "@/lib/types";
import { formatDurationFromSeconds } from "@/lib/format";

export function ChapterList({
  chapters,
  episodeId,
  enclosureUrl,
  title,
  artist,
  artwork,
  duration,
}: {
  chapters: Chapter[];
  episodeId: string;
  enclosureUrl: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
}) {
  const setQueueAndPlay = useAudioStore((s) => s.setQueueAndPlay);
  const seek = useAudioStore((s) => s.seek);
  const currentTrack = useAudioStore((s) => s.currentTrack);

  const handleChapterClick = (startTime: number) => {
    const isCurrentEpisode = currentTrack?.id === episodeId;
    if (isCurrentEpisode) {
      seek(startTime);
    } else {
      setQueueAndPlay(
        [{ id: episodeId, url: enclosureUrl, title, artist, artwork, duration }],
        0
      );
      // Seek after a short delay to allow the track to load
      setTimeout(() => seek(startTime), 500);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {chapters.map((chapter) => (
        <button
          key={chapter.startTime}
          className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
          onClick={() => handleChapterClick(chapter.startTime)}
        >
          {chapter.img ? (
            <Image
              src={chapter.img}
              alt={chapter.title}
              width={48}
              height={48}
              className="size-12 rounded-md object-cover"
            />
          ) : (
            <div className="size-12 rounded-md bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{chapter.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDurationFromSeconds(chapter.startTime)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
