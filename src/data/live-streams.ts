import { LiveStream } from "@/lib/types";

export const liveStreams: LiveStream[] = [
  {
    id: "ls1",
    podcastId: "pc1",
    podcastTitle: "Podcasting 2.0",
    podcastImage: "https://picsum.photos/seed/podcast2/400/400",
    title: "LIVE: Namespace Working Group Meeting",
    status: "live",
    startTime: "2026-02-01T14:00:00Z",
    listenerCount: 342,
    chat: [
      { id: "cm1", author: "listener1", text: "Great discussion on the new tags!", timestamp: "2026-02-01T14:05:00Z", isBoost: false },
      { id: "cm2", author: "boostking", text: "Let's go! ⚡", timestamp: "2026-02-01T14:06:00Z", isBoost: true, boostAmount: 500 },
      { id: "cm3", author: "devfan", text: "Will there be a recording?", timestamp: "2026-02-01T14:07:00Z", isBoost: false },
      { id: "cm4", author: "satoshi", text: "Boosting for the value splits discussion", timestamp: "2026-02-01T14:08:00Z", isBoost: true, boostAmount: 2100 },
      { id: "cm5", author: "podlover", text: "The ActivityPub integration is amazing", timestamp: "2026-02-01T14:10:00Z", isBoost: false },
    ],
  },
  {
    id: "ls2",
    podcastId: "pc5",
    podcastTitle: "Open Source Jams",
    podcastImage: "https://picsum.photos/seed/osmusic/400/400",
    title: "Friday Night Live Music Session",
    status: "live",
    startTime: "2026-01-31T20:00:00Z",
    listenerCount: 128,
    chat: [
      { id: "cm6", author: "musicfan", text: "Love this track! 🎵", timestamp: "2026-01-31T20:30:00Z", isBoost: false },
      { id: "cm7", author: "ccmusic", text: "Who's the artist?", timestamp: "2026-01-31T20:31:00Z", isBoost: false },
      { id: "cm8", author: "chrisT", text: "This is Flavio Concini from Pixabay Music", timestamp: "2026-01-31T20:32:00Z", isBoost: false },
    ],
  },
  {
    id: "ls3",
    podcastId: "pc7",
    podcastTitle: "Startup Stories",
    podcastImage: "https://picsum.photos/seed/startups/400/400",
    title: "AMA: Ask a Founder Anything",
    status: "scheduled",
    startTime: "2026-02-03T18:00:00Z",
    listenerCount: 0,
    chat: [],
  },
];

export function getLiveStreams(): LiveStream[] {
  return liveStreams;
}

export function getActiveLiveStreams(): LiveStream[] {
  return liveStreams.filter((s) => s.status === "live");
}
