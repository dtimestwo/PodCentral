import { createClient } from "@/lib/supabase/server";
import type { WalletTransaction } from "@/lib/types";

// ============================================
// USER PROFILE
// ============================================

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
  };
}

export async function updateUserProfile(
  userId: string,
  updates: { displayName?: string; avatarUrl?: string }
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: updates.displayName,
      avatar_url: updates.avatarUrl,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    return false;
  }

  return true;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function getUserSubscriptions(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("podcast_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }

  return data.map((s: { podcast_id: string }) => s.podcast_id);
}

export async function subscribeToPodcast(userId: string, podcastId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .insert({ user_id: userId, podcast_id: podcastId });

  if (error) {
    // Ignore duplicate key errors
    if (error.code === "23505") return true;
    console.error("Error subscribing:", error);
    return false;
  }

  return true;
}

export async function unsubscribeFromPodcast(userId: string, podcastId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("podcast_id", podcastId);

  if (error) {
    console.error("Error unsubscribing:", error);
    return false;
  }

  return true;
}

export async function isSubscribed(userId: string, podcastId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("podcast_id")
    .eq("user_id", userId)
    .eq("podcast_id", podcastId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// ============================================
// LISTENING HISTORY
// ============================================

export interface HistoryEntry {
  episodeId: string;
  progress: number;
  lastPlayed: string;
}

export async function getListeningHistory(userId: string): Promise<HistoryEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listening_history")
    .select("episode_id, progress, last_played")
    .eq("user_id", userId)
    .order("last_played", { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  return data.map((h: { episode_id: string; progress: number; last_played: string }) => ({
    episodeId: h.episode_id,
    progress: h.progress,
    lastPlayed: h.last_played,
  }));
}

export async function updateProgress(
  userId: string,
  episodeId: string,
  progress: number
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("listening_history")
    .upsert(
      {
        user_id: userId,
        episode_id: episodeId,
        progress,
        last_played: new Date().toISOString(),
      },
      { onConflict: "user_id,episode_id" }
    );

  if (error) {
    console.error("Error updating progress:", error);
    return false;
  }

  return true;
}

export async function getProgress(userId: string, episodeId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listening_history")
    .select("progress")
    .eq("user_id", userId)
    .eq("episode_id", episodeId)
    .single();

  if (error) {
    return 0;
  }

  return data.progress;
}

// ============================================
// WALLET
// ============================================

export interface UserWallet {
  balance: number;
  streamingRate: number;
}

export async function getUserWallet(userId: string): Promise<UserWallet | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_wallets")
    .select("balance, streaming_rate")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching wallet:", error);
    return null;
  }

  return {
    balance: data.balance,
    streamingRate: data.streaming_rate,
  };
}

export async function updateWalletBalance(userId: string, newBalance: number): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_wallets")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }

  return true;
}

export async function setStreamingRate(userId: string, rate: number): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_wallets")
    .update({ streaming_rate: rate })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating streaming rate:", error);
    return false;
  }

  return true;
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  interface DbWalletTransaction {
    id: string;
    type: string;
    amount: number;
    recipient: string | null;
    message: string | null;
    created_at: string;
    episode_title: string | null;
  }
  return data.map((tx: DbWalletTransaction) => ({
    id: tx.id,
    type: tx.type as WalletTransaction["type"],
    amount: tx.amount,
    recipient: tx.recipient ?? undefined,
    message: tx.message ?? undefined,
    timestamp: tx.created_at,
    episodeTitle: tx.episode_title ?? undefined,
  }));
}

export async function addWalletTransaction(
  userId: string,
  type: WalletTransaction["type"],
  amount: number,
  recipient?: string,
  message?: string,
  episodeTitle?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type,
    amount,
    recipient,
    message,
    episode_title: episodeTitle,
  });

  if (error) {
    console.error("Error adding transaction:", error);
    return false;
  }

  return true;
}

// Combined function to send a boost (deduct balance + record transaction)
export async function sendBoost(
  userId: string,
  amount: number,
  recipient: string,
  message?: string,
  episodeTitle?: string
): Promise<boolean> {
  const wallet = await getUserWallet(userId);
  if (!wallet || wallet.balance < amount) {
    return false;
  }

  const newBalance = wallet.balance - amount;
  const balanceUpdated = await updateWalletBalance(userId, newBalance);
  if (!balanceUpdated) return false;

  return addWalletTransaction(userId, "boost", -amount, recipient, message, episodeTitle);
}

// Combined function to stream sats
export async function streamSats(
  userId: string,
  amount: number,
  episodeTitle?: string
): Promise<boolean> {
  const wallet = await getUserWallet(userId);
  if (!wallet || wallet.balance < amount) {
    return false;
  }

  const newBalance = wallet.balance - amount;
  const balanceUpdated = await updateWalletBalance(userId, newBalance);
  if (!balanceUpdated) return false;

  return addWalletTransaction(userId, "stream", -amount, undefined, undefined, episodeTitle);
}

// Combined function to top up wallet
export async function topUpWallet(userId: string, amount: number): Promise<boolean> {
  const wallet = await getUserWallet(userId);
  if (!wallet) return false;

  const newBalance = wallet.balance + amount;
  const balanceUpdated = await updateWalletBalance(userId, newBalance);
  if (!balanceUpdated) return false;

  return addWalletTransaction(userId, "topup", amount);
}
