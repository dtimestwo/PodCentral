export interface Podcast {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  categories: string[];
  funding?: { url: string; message: string }[];
  locked: boolean;
  medium: "podcast" | "music" | "video" | "audiobook";
  language: string;
  episodeCount: number;
  value?: ValueConfig;
  license?: string;
  location?: string;
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  datePublished: string;
  duration: number; // seconds
  enclosureUrl: string;
  image?: string;
  season?: number;
  episode?: number;
  isTrailer?: boolean;
  persons: Person[];
  socialInteract?: SocialInteract[];
  value?: ValueConfig;
}

export interface Chapter {
  startTime: number; // seconds
  endTime?: number;
  title: string;
  img?: string;
  url?: string;
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
}

export interface Person {
  id: string;
  name: string;
  role: "host" | "guest" | "editor" | "producer";
  group?: string;
  img: string;
  href?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  platform: "mastodon" | "fountain" | "podcastindex" | "nostr";
  boostAmount?: number;
  replies: Comment[];
}

export interface SocialInteract {
  uri: string;
  protocol: "activitypub" | "twitter" | "nostr";
  accountUrl?: string;
}

export interface LiveStream {
  id: string;
  podcastId: string;
  podcastTitle: string;
  podcastImage: string;
  title: string;
  status: "live" | "scheduled" | "ended";
  startTime: string;
  listenerCount: number;
  chat: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isBoost: boolean;
  boostAmount?: number;
}

export interface Soundbite {
  id: string;
  episodeId: string;
  startTime: number;
  duration: number;
  title: string;
}

export interface ValueConfig {
  type: "lightning";
  method: "keysend";
  recipients: ValueRecipient[];
}

export interface ValueRecipient {
  name: string;
  type: "wallet" | "host" | "guest" | "app";
  address: string;
  split: number; // percentage
}

export interface WalletTransaction {
  id: string;
  type: "boost" | "stream" | "topup";
  amount: number;
  recipient?: string;
  message?: string;
  timestamp: string;
  episodeTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
