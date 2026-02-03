import { Comment } from "@/lib/types";

export const commentsByEpisode: Record<string, Comment[]> = {
  ep1: [
    {
      id: "c1",
      author: "podcastfan42",
      authorAvatar: "https://i.pravatar.cc/150?u=podcastfan42",
      text: "Great episode! The value-for-value stats are incredible. Boosted 1000 sats!",
      timestamp: "2026-01-28T16:30:00Z",
      platform: "fountain",
      boostAmount: 1000,
      replies: [
        {
          id: "c1r1",
          author: "lightninglarry",
          authorAvatar: "https://i.pravatar.cc/150?u=lightninglarry",
          text: "Same! The growth is unreal. Podcasting 2.0 is the future.",
          timestamp: "2026-01-28T17:00:00Z",
          platform: "fountain",
          replies: [],
        },
      ],
    },
    {
      id: "c2",
      author: "@opensourcesam@mastodon.social",
      authorAvatar: "https://i.pravatar.cc/150?u=opensourcesam",
      text: "Love how the namespace keeps evolving while staying backwards compatible. Good engineering.",
      timestamp: "2026-01-28T18:15:00Z",
      platform: "mastodon",
      replies: [],
    },
    {
      id: "c3",
      author: "v4venthusiast",
      authorAvatar: "https://i.pravatar.cc/150?u=v4venthusiast",
      text: "Can you do a deep dive on how value time splits work? I'm a podcaster trying to set this up.",
      timestamp: "2026-01-29T09:00:00Z",
      platform: "podcastindex",
      replies: [
        {
          id: "c3r1",
          author: "davejones_pi",
          authorAvatar: "https://i.pravatar.cc/150?u=davejones",
          text: "Great idea! We'll cover that in an upcoming episode.",
          timestamp: "2026-01-29T10:30:00Z",
          platform: "podcastindex",
          replies: [],
        },
      ],
    },
    {
      id: "c4",
      author: "npub1abc...xyz",
      authorAvatar: "https://i.pravatar.cc/150?u=nostruser1",
      text: "Streaming sats while listening to this. The future of media is here. ⚡",
      timestamp: "2026-01-28T20:45:00Z",
      platform: "nostr",
      boostAmount: 500,
      replies: [],
    },
  ],
  ep7: [
    {
      id: "c5",
      author: "airesearcher",
      authorAvatar: "https://i.pravatar.cc/150?u=airesearcher",
      text: "Excellent breakdown of the current agent landscape. Finally someone separating signal from noise.",
      timestamp: "2026-01-27T14:00:00Z",
      platform: "mastodon",
      replies: [],
    },
    {
      id: "c6",
      author: "codemonkey99",
      authorAvatar: "https://i.pravatar.cc/150?u=codemonkey99",
      text: "Using AI coding agents daily now. They've genuinely changed my workflow. Boosted!",
      timestamp: "2026-01-27T15:30:00Z",
      platform: "fountain",
      boostAmount: 2000,
      replies: [
        {
          id: "c6r1",
          author: "skepticdev",
          authorAvatar: "https://i.pravatar.cc/150?u=skepticdev",
          text: "Which ones? I've tried a few and found them more hype than help.",
          timestamp: "2026-01-27T16:00:00Z",
          platform: "fountain",
          replies: [],
        },
      ],
    },
  ],
};

export function getCommentsByEpisodeId(episodeId: string): Comment[] {
  return commentsByEpisode[episodeId] || [];
}
