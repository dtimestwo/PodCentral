// Re-export all data access functions

export {
  getPodcasts,
  getPodcastById,
  getPodcastsByCategory,
  searchPodcasts,
} from "./podcasts";

export {
  getEpisodesByPodcastId,
  getEpisodeById,
  getRecentEpisodes,
  searchEpisodes,
} from "./episodes";

export { getChaptersByEpisodeId } from "./chapters";

export { getTranscriptByEpisodeId } from "./transcripts";

export { getCommentsByEpisodeId, addComment } from "./comments";

export { getSoundbitesByEpisodeId } from "./soundbites";

export { getCategories, getCategoryById } from "./categories";

export {
  // User Profile
  getUserProfile,
  updateUserProfile,
  type UserProfile,
  // Subscriptions
  getUserSubscriptions,
  subscribeToPodcast,
  unsubscribeFromPodcast,
  isSubscribed,
  // History
  getListeningHistory,
  updateProgress,
  getProgress,
  type HistoryEntry,
  // Wallet
  getUserWallet,
  updateWalletBalance,
  setStreamingRate,
  getWalletTransactions,
  addWalletTransaction,
  sendBoost,
  streamSats,
  topUpWallet,
  type UserWallet,
} from "./user";
