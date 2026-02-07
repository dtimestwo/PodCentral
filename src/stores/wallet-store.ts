import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { WalletTransaction } from "@/lib/types";

interface WalletStore {
  balance: number;
  streamingRate: number;
  transactions: WalletTransaction[];
  userId: string | null;
  isSyncing: boolean;

  sendBoost: (amount: number, recipient: string, message?: string, episodeTitle?: string) => void;
  streamSats: (amount: number, episodeTitle?: string) => void;
  topUp: (amount: number) => void;
  setStreamingRate: (rate: number) => void;

  // Supabase sync methods
  setUserId: (userId: string | null) => void;
  loadFromServer: (userId: string) => Promise<void>;
  syncToServer: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>()(persist((set, get) => ({
  balance: 50000,
  streamingRate: 100,
  transactions: [],
  userId: null,
  isSyncing: false,

  sendBoost: (amount, recipient, message, episodeTitle) => {
    if (amount <= 0) return;
    const { userId, balance, syncToServer } = get();
    const MAX_TRANSACTIONS = 1000; // Limit transactions to prevent unbounded growth

    // Check balance before deducting (optimistic update with validation)
    if (amount > balance) return;

    set((state) => {
      const newTransactions = [
        {
          id: `tx-${Date.now()}`,
          type: "boost" as const,
          amount: -amount,
          recipient,
          message,
          episodeTitle,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ].slice(0, MAX_TRANSACTIONS); // Trim to max size

      return {
        balance: Math.max(0, state.balance - amount),
        transactions: newTransactions,
      };
    });

    if (userId) {
      syncToServer();
    }
  },

  streamSats: (amount, episodeTitle) => {
    if (amount <= 0) return;
    const { userId, balance, syncToServer } = get();
    const MAX_TRANSACTIONS = 1000;

    if (amount > balance) return;

    set((state) => {
      const newTransactions = [
        {
          id: `tx-${Date.now()}`,
          type: "stream" as const,
          amount: -amount,
          episodeTitle,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ].slice(0, MAX_TRANSACTIONS);

      return {
        balance: Math.max(0, state.balance - amount),
        transactions: newTransactions,
      };
    });

    if (userId) {
      syncToServer();
    }
  },

  topUp: (amount) => {
    if (amount <= 0) return;
    const { userId, syncToServer } = get();
    const MAX_TRANSACTIONS = 1000;

    set((state) => {
      const newTransactions = [
        {
          id: `tx-${Date.now()}`,
          type: "topup" as const,
          amount,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ].slice(0, MAX_TRANSACTIONS);

      return {
        balance: state.balance + amount,
        transactions: newTransactions,
      };
    });

    if (userId) {
      syncToServer();
    }
  },

  setStreamingRate: (rate) => {
    if (rate < 0) return;
    const { userId } = get();
    set({ streamingRate: rate });

    if (userId) {
      const supabase = createClient();
      supabase
        .from("user_wallets")
        .update({ streaming_rate: rate })
        .eq("user_id", userId)
        .then();
    }
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

      // Load wallet
      const { data: wallet } = await supabase
        .from("user_wallets")
        .select("balance, streaming_rate")
        .eq("user_id", userId)
        .single();

      // Load transactions
      const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (wallet) {
        set({
          balance: wallet.balance,
          streamingRate: wallet.streaming_rate,
        });
      }

      if (transactions) {
        interface DbTx {
          id: string;
          type: string;
          amount: number;
          recipient: string | null;
          message: string | null;
          created_at: string;
          episode_title: string | null;
        }
        set({
          transactions: transactions.map((tx: DbTx) => ({
            id: tx.id,
            type: tx.type as WalletTransaction["type"],
            amount: tx.amount,
            recipient: tx.recipient ?? undefined,
            message: tx.message ?? undefined,
            timestamp: tx.created_at,
            episodeTitle: tx.episode_title ?? undefined,
          })),
        });
      }
    } catch (error) {
      console.error("Failed to load wallet from server:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  syncToServer: async () => {
    const { userId, balance, transactions } = get();
    if (!userId) return;

    try {
      const supabase = createClient();

      // Update balance
      await supabase
        .from("user_wallets")
        .update({ balance })
        .eq("user_id", userId);

      // Sync latest transaction
      const latestTx = transactions[0];
      if (latestTx && latestTx.id.startsWith("tx-")) {
        await supabase.from("wallet_transactions").insert({
          user_id: userId,
          type: latestTx.type,
          amount: latestTx.amount,
          recipient: latestTx.recipient,
          message: latestTx.message,
          episode_title: latestTx.episodeTitle,
        });
      }
    } catch (error) {
      console.error("Failed to sync wallet to server:", error);
    }
  },
}), { name: "wallet-store" }));
