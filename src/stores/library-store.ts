import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

interface HistoryEntry {
  episodeId: string;
  progress: number;
  lastPlayed: string;
}

interface LibraryStore {
  subscriptions: string[]; // podcast IDs
  history: HistoryEntry[];
  userId: string | null;
  isSyncing: boolean;
  hasHydrated: boolean;

  subscribe: (podcastId: string) => void;
  unsubscribe: (podcastId: string) => void;
  isSubscribed: (podcastId: string) => boolean;

  addToHistory: (episodeId: string, progress: number) => void;
  getProgress: (episodeId: string) => number;

  // Supabase sync methods
  setUserId: (userId: string | null) => void;
  loadFromServer: (userId: string) => Promise<void>;
  syncSubscriptionToServer: (podcastId: string, subscribe: boolean) => Promise<void>;
  syncProgressToServer: (episodeId: string, progress: number) => Promise<void>;

  // Hydration
  setHasHydrated: (state: boolean) => void;
}

export const useLibraryStore = create<LibraryStore>()(persist((set, get) => ({
  subscriptions: [],
  history: [],
  userId: null,
  isSyncing: false,
  hasHydrated: false,

  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

  subscribe: (podcastId) => {
    const { userId, syncSubscriptionToServer } = get();
    set((state) => ({
      subscriptions: state.subscriptions.includes(podcastId)
        ? state.subscriptions
        : [...state.subscriptions, podcastId],
    }));
    if (userId) {
      syncSubscriptionToServer(podcastId, true);
    }
  },

  unsubscribe: (podcastId) => {
    const { userId, syncSubscriptionToServer } = get();
    set((state) => ({
      subscriptions: state.subscriptions.filter((id) => id !== podcastId),
    }));
    if (userId) {
      syncSubscriptionToServer(podcastId, false);
    }
  },

  isSubscribed: (podcastId) => get().subscriptions.includes(podcastId),

  addToHistory: (episodeId, progress) => {
    const { userId, syncProgressToServer } = get();
    const MAX_HISTORY_SIZE = 500; // Limit history to prevent unbounded growth
    set((state) => {
      const existing = state.history.findIndex((h) => h.episodeId === episodeId);
      const entry: HistoryEntry = {
        episodeId,
        progress,
        lastPlayed: new Date().toISOString(),
      };
      let newHistory: HistoryEntry[];
      if (existing >= 0) {
        newHistory = [...state.history];
        newHistory[existing] = entry;
      } else {
        newHistory = [entry, ...state.history];
      }
      // Trim to max size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
      }
      return { history: newHistory };
    });
    if (userId) {
      syncProgressToServer(episodeId, progress);
    }
  },

  getProgress: (episodeId) => {
    const entry = get().history.find((h) => h.episodeId === episodeId);
    return entry?.progress ?? 0;
  },

  setUserId: (userId) => {
    set({ userId });
    if (userId) {
      get().loadFromServer(userId);
    }
  },

  loadFromServer: async (userId: string) => {
    set({ isSyncing: true });
    try {
      const supabase = createClient();

      // Load subscriptions
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("podcast_id")
        .eq("user_id", userId);

      // Load history
      const { data: history } = await supabase
        .from("listening_history")
        .select("episode_id, progress, last_played")
        .eq("user_id", userId)
        .order("last_played", { ascending: false });

      const currentState = get();

      // Merge server data with local data
      const serverSubIds = subscriptions?.map((s: { podcast_id: string }) => s.podcast_id) || [];
      const mergedSubs = [...new Set([...currentState.subscriptions, ...serverSubIds])];

      const serverHistory: HistoryEntry[] = (history || []).map((h: { episode_id: string; progress: number; last_played: string }) => ({
        episodeId: h.episode_id,
        progress: h.progress,
        lastPlayed: h.last_played,
      }));

      // Merge history (prefer more recent or higher progress)
      const historyMap = new Map<string, HistoryEntry>();
      for (const entry of [...currentState.history, ...serverHistory]) {
        const existing = historyMap.get(entry.episodeId);
        if (!existing ||
            new Date(entry.lastPlayed) > new Date(existing.lastPlayed) ||
            entry.progress > existing.progress) {
          historyMap.set(entry.episodeId, entry);
        }
      }

      set({
        subscriptions: mergedSubs,
        history: Array.from(historyMap.values()).sort(
          (a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
        ),
      });
    } catch (error) {
      console.error("Failed to load from server:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  syncSubscriptionToServer: async (podcastId: string, subscribe: boolean) => {
    const { userId } = get();
    if (!userId) return;

    try {
      const supabase = createClient();
      if (subscribe) {
        await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          podcast_id: podcastId,
        });
      } else {
        await supabase
          .from("user_subscriptions")
          .delete()
          .eq("user_id", userId)
          .eq("podcast_id", podcastId);
      }
    } catch (error) {
      console.error("Failed to sync subscription:", error);
    }
  },

  syncProgressToServer: async (episodeId: string, progress: number) => {
    const { userId } = get();
    if (!userId) return;

    try {
      const supabase = createClient();
      await supabase.from("listening_history").upsert(
        {
          user_id: userId,
          episode_id: episodeId,
          progress,
          last_played: new Date().toISOString(),
        },
        { onConflict: "user_id,episode_id" }
      );
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
  },
}), {
  name: "library-store",
  onRehydrateStorage: () => {
    return () => {
      // This callback runs after hydration completes
      // Use setTimeout to ensure store is fully initialized
      setTimeout(() => {
        useLibraryStore.setState({ hasHydrated: true });
      }, 0);
    };
  },
}));
