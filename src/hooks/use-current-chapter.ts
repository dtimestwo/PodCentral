import { useMemo } from "react";
import { useAudioStore } from "@/lib/audio-store";
import type { Chapter } from "@/lib/types";

/**
 * Finds the active chapter for the given time using binary search.
 * Chapters are sorted by startTime. The active chapter is the last one
 * whose startTime <= currentTime.
 */
function findChapter(
  chapters: Chapter[],
  currentTime: number
): Chapter | null {
  if (chapters.length === 0) return null;

  let low = 0;
  let high = chapters.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midStart = chapters[mid]!.startTime;

    if (midStart <= currentTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // high is now the index of the last chapter with startTime <= currentTime
  return high >= 0 ? chapters[high]! : null;
}

/**
 * Derives the current chapter from playback time and the track's chapters array.
 * Returns the active chapter and the artwork to display (chapter image or track fallback).
 * Only triggers re-renders when the active chapter changes, not on every time tick.
 */
export function useCurrentChapter() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const currentTime = useAudioStore((s) => s.currentTime);

  const chapters = (currentTrack?.chapters as Chapter[] | undefined) ?? [];
  const trackArtwork = currentTrack?.artwork;

  const chapter = useMemo(
    () => findChapter(chapters, currentTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-derive only when chapter boundary changes
    [chapters, Math.floor(currentTime)]
  );

  const artwork = chapter?.img || trackArtwork;

  return { chapter, artwork };
}
