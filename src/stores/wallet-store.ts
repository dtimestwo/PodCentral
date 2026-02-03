import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletTransaction } from "@/lib/types";

interface WalletStore {
  balance: number;
  streamingRate: number;
  transactions: WalletTransaction[];

  sendBoost: (amount: number, recipient: string, message?: string, episodeTitle?: string) => void;
  streamSats: (amount: number, episodeTitle?: string) => void;
  topUp: (amount: number) => void;
  setStreamingRate: (rate: number) => void;
}

export const useWalletStore = create<WalletStore>()(persist((set) => ({
  balance: 50000, // start with 50k sats for demo
  streamingRate: 100, // 100 sats per minute
  transactions: [
    {
      id: "tx-init",
      type: "topup",
      amount: 50000,
      timestamp: "2026-01-30T10:00:00Z",
    },
  ],

  sendBoost: (amount, recipient, message, episodeTitle) => {
    if (amount <= 0) return;
    set((state) => ({
      balance: Math.max(0, state.balance - amount),
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: "boost",
          amount: -amount,
          recipient,
          message,
          episodeTitle,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ],
    }));
  },

  streamSats: (amount, episodeTitle) => {
    if (amount <= 0) return;
    set((state) => ({
      balance: Math.max(0, state.balance - amount),
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: "stream",
          amount: -amount,
          episodeTitle,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ],
    }));
  },

  topUp: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      balance: state.balance + amount,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: "topup",
          amount,
          timestamp: new Date().toISOString(),
        },
        ...state.transactions,
      ],
    }));
  },

  setStreamingRate: (rate) => {
    if (rate < 0) return;
    set({ streamingRate: rate });
  },
}), { name: "wallet-store" }));
