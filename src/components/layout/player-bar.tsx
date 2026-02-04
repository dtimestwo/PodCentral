"use client";

import Image from "next/image";
import { ListMusicIcon, ChevronUpIcon } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { useCurrentChapter } from "@/hooks/use-current-chapter";
import {
  AudioPlayerControlBar,
  AudioPlayerControlGroup,
  AudioPlayerPlay,
  AudioPlayerRewind,
  AudioPlayerFastForward,
  AudioPlayerSeekBar,
  AudioPlayerTimeDisplay,
  AudioPlayerVolume,
  AudioPlayerSkipBack,
  AudioPlayerSkipForward,
} from "@/components/audio/player";
import { AudioPlaybackSpeed } from "@/components/audio/playback-speed";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PlayerBar() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const { chapter, artwork } = useCurrentChapter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-20 items-center gap-4 px-4">
        {/* Left: Track info */}
        <div className="flex min-w-[200px] items-center gap-3">
          {artwork ? (
            <Image
              src={artwork}
              alt={chapter?.title || currentTrack?.title || ""}
              width={48}
              height={48}
              className="size-12 rounded-md object-cover"
            />
          ) : (
            <div className="size-12 rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {currentTrack?.title || "Nothing playing"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {chapter?.title || currentTrack?.artist || "Select an episode to play"}
            </p>
          </div>
        </div>

        {/* Center: Controls + seek */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <AudioPlayerControlBar variant="compact" className="justify-center">
            <AudioPlayerControlGroup className="w-auto justify-center gap-1">
              <AudioPlayerSkipBack variant="ghost" size="icon" />
              <AudioPlayerRewind variant="ghost" size="icon" />
              <AudioPlayerPlay
                variant="default"
                size="icon"
                className="size-9 rounded-full"
              />
              <AudioPlayerFastForward variant="ghost" size="icon" />
              <AudioPlayerSkipForward variant="ghost" size="icon" />
            </AudioPlayerControlGroup>
          </AudioPlayerControlBar>
          <div className="flex w-full max-w-[600px] items-center gap-2">
            <AudioPlayerTimeDisplay className="min-w-10 text-xs" />
            <AudioPlayerSeekBar />
            <AudioPlayerTimeDisplay remaining className="min-w-10 text-xs" />
          </div>
        </div>

        {/* Right: Volume + extras */}
        <div className="flex min-w-[200px] items-center justify-end gap-1">
          <AudioPlaybackSpeed />
          <AudioPlayerVolume />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <ListMusicIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Queue</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronUpIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Now Playing</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
