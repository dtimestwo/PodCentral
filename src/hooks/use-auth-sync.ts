"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLibraryStore } from "@/stores/library-store";
import { useWalletStore } from "@/stores/wallet-store";

export function useAuthSync() {
  const { user } = useAuth();
  const setLibraryUserId = useLibraryStore((state) => state.setUserId);
  const setWalletUserId = useWalletStore((state) => state.setUserId);

  useEffect(() => {
    const userId = user?.id ?? null;
    setLibraryUserId(userId);
    setWalletUserId(userId);
  }, [user, setLibraryUserId, setWalletUserId]);
}
