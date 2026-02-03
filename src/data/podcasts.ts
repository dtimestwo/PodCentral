import { Podcast } from "@/lib/types";

export const podcasts: Podcast[] = [
  {
    id: "pc1",
    title: "Podcasting 2.0",
    author: "Adam Curry & Dave Jones",
    description:
      "Discussing the future of podcasting with the creators of the Podcast Index. New features, new apps, and the open podcast ecosystem.",
    image: "https://picsum.photos/seed/podcast2/400/400",
    categories: ["tech", "news"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 6,
    funding: [
      { url: "https://podcastindex.org/donate", message: "Support the Index" },
    ],
    value: {
      type: "lightning",
      method: "keysend",
      recipients: [
        { name: "Adam Curry", type: "host", address: "adam@getalby.com", split: 50 },
        { name: "Dave Jones", type: "host", address: "dave@getalby.com", split: 40 },
        { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
      ],
    },
    license: "CC BY 4.0",
    location: "Austin, TX",
  },
  {
    id: "pc2",
    title: "Tech Frontiers",
    author: "Sarah Chen",
    description:
      "Exploring cutting-edge technology, AI breakthroughs, and the future of human-computer interaction. Weekly deep dives with industry leaders.",
    image: "https://picsum.photos/seed/techfront/400/400",
    categories: ["tech", "science"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
    value: {
      type: "lightning",
      method: "keysend",
      recipients: [
        { name: "Sarah Chen", type: "host", address: "sarah@getalby.com", split: 90 },
        { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
      ],
    },
  },
  {
    id: "pc3",
    title: "The Comedy Hour",
    author: "Marcus Johnson",
    description:
      "Stand-up, sketches, and hilarious conversations with the funniest people on the planet. Warning: may cause involuntary laughter.",
    image: "https://picsum.photos/seed/comedy1/400/400",
    categories: ["comedy"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
  },
  {
    id: "pc4",
    title: "World Report Daily",
    author: "Elena Rodriguez",
    description:
      "Your daily briefing on global news, geopolitics, and the stories that shape our world. Balanced, thorough, and independent.",
    image: "https://picsum.photos/seed/worldnews/400/400",
    categories: ["news", "society"],
    locked: true,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
    funding: [
      { url: "https://example.com/donate", message: "Support independent journalism" },
    ],
  },
  {
    id: "pc5",
    title: "Open Source Jams",
    author: "Chris Taylor",
    description:
      "Celebrating music released under Creative Commons and open licenses. Discover new artists and support the open music movement.",
    image: "https://picsum.photos/seed/osmusic/400/400",
    categories: ["music"],
    locked: false,
    medium: "music",
    language: "en",
    episodeCount: 5,
    value: {
      type: "lightning",
      method: "keysend",
      recipients: [
        { name: "Chris Taylor", type: "host", address: "chris@getalby.com", split: 40 },
        { name: "Artists Fund", type: "wallet", address: "artists@getalby.com", split: 50 },
        { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
      ],
    },
  },
  {
    id: "pc6",
    title: "Mind & Body",
    author: "Aisha Patel",
    description:
      "Wellness, meditation, and the science of well-being. Practical tips for a healthier, happier life backed by research.",
    image: "https://picsum.photos/seed/mindbody/400/400",
    categories: ["health", "science"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
  },
  {
    id: "pc7",
    title: "Startup Stories",
    author: "James O'Brien",
    description:
      "Behind the scenes of building companies from zero to one. Founders share their real journeys — the wins, the failures, and the lessons.",
    image: "https://picsum.photos/seed/startups/400/400",
    categories: ["business", "tech"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
    value: {
      type: "lightning",
      method: "keysend",
      recipients: [
        { name: "James O'Brien", type: "host", address: "james@getalby.com", split: 90 },
        { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
      ],
    },
  },
  {
    id: "pc8",
    title: "History Unfolded",
    author: "Nina Kowalski",
    description:
      "Untold stories from history that shaped the modern world. Each episode is a journey through time with expert historians and primary sources.",
    image: "https://picsum.photos/seed/historyunf/400/400",
    categories: ["history", "education"],
    locked: false,
    medium: "podcast",
    language: "en",
    episodeCount: 5,
    license: "CC BY-NC 4.0",
    location: "London, UK",
  },
];

export function getPodcastById(id: string): Podcast | undefined {
  return podcasts.find((p) => p.id === id);
}

export function getPodcastsByCategory(categoryId: string): Podcast[] {
  return podcasts.filter((p) => p.categories.includes(categoryId));
}
