"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ListMusicIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isError = useAudioStore((s) => s.isError);
  const errorMessage = useAudioStore((s) => s.errorMessage);
  const { chapter, artwork } = useCurrentChapter();

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/80",
        isExpanded ? "h-80" : "h-20"
      )}
    >
      {/* Expanded view with large artwork */}
      {isExpanded && (
        <div className="flex h-60 items-center gap-8 border-b px-8">
          {/* Large artwork */}
          <div className="relative shrink-0">
            {artwork ? (
              <Image
                src={artwork}
                alt={chapter?.title || currentTrack?.title || ""}
                width={200}
                height={200}
                className="size-48 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="size-48 rounded-xl bg-muted" />
            )}
          </div>

          {/* Track and chapter info */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {isError ? (
              <>
                <p className="flex items-center gap-2 text-lg font-semibold text-destructive">
                  <AlertCircleIcon className="size-5" />
                  Playback Error
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorMessage || "Unable to play this episode"}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {currentTrack?.title || "Nothing playing"}
                </p>
                <p className="text-lg text-muted-foreground">
                  {currentTrack?.artist || "Select an episode to play"}
                </p>
                {chapter && (
                  <div className="mt-2 rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm font-medium text-primary">
                      Now Playing Chapter
                    </p>
                    <p className="text-lg font-semibold">{chapter.title}</p>
                    {chapter.url && (
                      <a
                        href={chapter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLinkIcon className="size-3" />
                        Chapter Link
                      </a>
                    )}
                  </div>
                )}
                {currentTrack?.id && (
                  <Link
                    href={`/podcast/${(currentTrack as { podcastId?: string }).podcastId || ""}/episode/${currentTrack.id}`}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    View Episode Details →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Compact bar (always visible) */}
      <div className="flex h-20 items-center gap-4 px-4">
        {/* Left: Track info */}
        <div className="flex min-w-[200px] items-center gap-3">
          {!isExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                >
                  {artwork ? (
                    <Image
                      src={artwork}
                      alt={chapter?.title || currentTrack?.title || ""}
                      width={56}
                      height={56}
                      className="size-14 rounded-lg object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-muted" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Click to expand</TooltipContent>
            </Tooltip>
          )}
          <div className="min-w-0">
            {isError ? (
              <>
                <p className="flex items-center gap-1 truncate text-sm font-medium text-destructive">
                  <AlertCircleIcon className="size-4" />
                  Playback Error
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {errorMessage || "Unable to play this episode"}
                </p>
              </>
            ) : (
              <>
                <p className="truncate text-sm font-medium">
                  {currentTrack?.title || "Nothing playing"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {chapter?.title || currentTrack?.artist || "Select an episode to play"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Center: Controls + seek */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <AudioPlayerControlBar variant="compact" className="justify-center">
            <AudioPlayerControlGroup className="w-auto justify-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AudioPlayerSkipBack variant="ghost" size="icon" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Previous Track</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AudioPlayerRewind variant="ghost" size="icon" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Rewind 10s</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AudioPlayerPlay
                      variant="default"
                      size="icon"
                      className="size-9 rounded-full"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Play / Pause</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AudioPlayerFastForward variant="ghost" size="icon" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Forward 10s</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AudioPlayerSkipForward variant="ghost" size="icon" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Next Track</TooltipContent>
              </Tooltip>
            </AudioPlayerControlGroup>
          </AudioPlayerControlBar>
          <div className="flex w-full max-w-[600px] items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <AudioPlayerTimeDisplay className="min-w-10 text-xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Current Time</TooltipContent>
            </Tooltip>
            <AudioPlayerSeekBar />
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <AudioPlayerTimeDisplay remaining className="min-w-10 text-xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Time Remaining</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right: Volume + extras */}
        <div className="flex min-w-[200px] items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <AudioPlaybackSpeed />
              </span>
            </TooltipTrigger>
            <TooltipContent>Playback Speed</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <AudioPlayerVolume />
              </span>
            </TooltipTrigger>
            <TooltipContent>Volume</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Queue">
                <ListMusicIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Queue</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isExpanded ? "Collapse Player" : "Expand Player"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="size-4" />
                ) : (
                  <ChevronUpIcon className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isExpanded ? "Collapse" : "Now Playing"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
