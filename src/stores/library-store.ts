import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LibraryStore {
  subscriptions: string[]; // podcast IDs
  history: { episodeId: string; progress: number; lastPlayed: string }[];

  subscribe: (podcastId: string) => void;
  unsubscribe: (podcastId: string) => void;
  isSubscribed: (podcastId: string) => boolean;

  addToHistory: (episodeId: string, progress: number) => void;
  getProgress: (episodeId: string) => number;
}

export const useLibraryStore = create<LibraryStore>()(persist((set, get) => ({
  subscriptions: ["pc1", "pc2", "pc5"], // pre-subscribed for demo
  history: [],

  subscribe: (podcastId) =>
    set((state) => ({
      subscriptions: state.subscriptions.includes(podcastId)
        ? state.subscriptions
        : [...state.subscriptions, podcastId],
    })),

  unsubscribe: (podcastId) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((id) => id !== podcastId),
    })),

  isSubscribed: (podcastId) => get().subscriptions.includes(podcastId),

  addToHistory: (episodeId, progress) =>
    set((state) => {
      const existing = state.history.findIndex((h) => h.episodeId === episodeId);
      const entry = {
        episodeId,
        progress,
        lastPlayed: new Date().toISOString(),
      };
      if (existing >= 0) {
        const updated = [...state.history];
        updated[existing] = entry;
        return { history: updated };
      }
      return { history: [entry, ...state.history] };
    }),

  getProgress: (episodeId) => {
    const entry = get().history.find((h) => h.episodeId === episodeId);
    return entry?.progress || 0;
  },
}), { name: "library-store" }));
