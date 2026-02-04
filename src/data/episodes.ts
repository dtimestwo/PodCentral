import { Episode } from "@/lib/types";

// Public domain audio samples for playback testing
const AUDIO_SAMPLES = [
  "https://cdn.pixabay.com/audio/2024/10/21/audio_78251ef8e3.mp3",
  "https://cdn.pixabay.com/audio/2024/02/28/audio_60f7a54400.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
];

function audioUrl(index: number): string {
  return AUDIO_SAMPLES[index % AUDIO_SAMPLES.length];
}

export const episodes: Episode[] = [
  // Podcasting 2.0 (pc1) - 6 episodes
  {
    id: "ep1",
    podcastId: "pc1",
    title: "The State of Podcasting 2.0 in 2026",
    description:
      "Adam and Dave review the massive growth of Podcasting 2.0 features, new apps, and the expanding namespace. Plus, a look at value-for-value adoption.",
    datePublished: "2026-01-28T14:00:00Z",
    duration: 4200,
    enclosureUrl: audioUrl(0),
    image: "https://picsum.photos/seed/ep1/400/400",
    season: 3,
    episode: 45,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
    ],
    socialInteract: [{ uri: "https://podcastindex.social/@pc20/123", protocol: "activitypub" }],
    value: {
      type: "lightning",
      method: "keysend",
      recipients: [
        { name: "Adam Curry", type: "host", address: "adam@getalby.com", split: 50 },
        { name: "Dave Jones", type: "host", address: "dave@getalby.com", split: 40 },
        { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
      ],
    },
  },
  {
    id: "ep2",
    podcastId: "pc1",
    title: "Chapters, Transcripts, and the Reading Experience",
    description:
      "Deep dive into how chapters and transcripts transform the podcast listening experience. We demo the latest implementations across apps.",
    datePublished: "2026-01-21T14:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(1),
    season: 3,
    episode: 44,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
      { id: "p5", name: "Elena Rodriguez", role: "guest", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },
  {
    id: "ep3",
    podcastId: "pc1",
    title: "Value4Value: Lightning Payments Hit Mainstream",
    description:
      "The boostagram economy is thriving. We break down how podcasters are earning sats and how apps are integrating Lightning payments.",
    datePublished: "2026-01-14T14:00:00Z",
    duration: 3900,
    enclosureUrl: audioUrl(2),
    season: 3,
    episode: 43,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
    ],
  },
  {
    id: "ep4",
    podcastId: "pc1",
    title: "Live Podcasting and the Chat Revolution",
    description:
      "Live streaming is the next frontier for podcasting. We discuss the technical challenges and the social dynamics of real-time podcast audiences.",
    datePublished: "2026-01-07T14:00:00Z",
    duration: 3300,
    enclosureUrl: audioUrl(3),
    season: 3,
    episode: 42,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
    ],
  },
  {
    id: "ep5",
    podcastId: "pc1",
    title: "Cross-App Comments via ActivityPub",
    description:
      "The social layer of podcasting is here. How ActivityPub enables comments that work across every Podcasting 2.0 app.",
    datePublished: "2025-12-31T14:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(4),
    season: 3,
    episode: 41,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
    ],
  },
  {
    id: "ep6",
    podcastId: "pc1",
    title: "Trailer: Welcome to Podcasting 2.0",
    description:
      "An introduction to the show and what we cover — the open podcast ecosystem, new features, and the people building the future of podcasting.",
    datePublished: "2025-01-01T00:00:00Z",
    duration: 180,
    enclosureUrl: audioUrl(0),
    isTrailer: true,
    persons: [
      { id: "p1", name: "Adam Curry", role: "host", img: "https://i.pravatar.cc/150?u=adamcurry" },
      { id: "p2", name: "Dave Jones", role: "host", img: "https://i.pravatar.cc/150?u=davejones" },
    ],
  },

  // Tech Frontiers (pc2)
  {
    id: "ep7",
    podcastId: "pc2",
    title: "AI Agents Are Changing Everything",
    description:
      "From coding assistants to autonomous research, AI agents are reshaping how we work. Sarah explores what's real vs hype.",
    datePublished: "2026-01-27T10:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(1),
    image: "https://picsum.photos/seed/ep7/400/400",
    persons: [
      { id: "p3", name: "Sarah Chen", role: "host", img: "https://i.pravatar.cc/150?u=sarachen" },
      { id: "p7", name: "Aisha Patel", role: "guest", img: "https://i.pravatar.cc/150?u=aishap" },
    ],
  },
  {
    id: "ep8",
    podcastId: "pc2",
    title: "The Open Web Fights Back",
    description: "RSS, ActivityPub, and decentralized protocols are seeing a renaissance. Is the open web winning?",
    datePublished: "2026-01-20T10:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p3", name: "Sarah Chen", role: "host", img: "https://i.pravatar.cc/150?u=sarachen" },
    ],
  },
  {
    id: "ep9",
    podcastId: "pc2",
    title: "Spatial Computing Beyond the Headset",
    description: "AR glasses, spatial audio, and ambient computing — the post-headset future is taking shape.",
    datePublished: "2026-01-13T10:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p3", name: "Sarah Chen", role: "host", img: "https://i.pravatar.cc/150?u=sarachen" },
    ],
  },
  {
    id: "ep10",
    podcastId: "pc2",
    title: "Quantum Computing: Year of the Breakthrough",
    description: "2026 may be the year quantum advantage becomes practical. We interview leading researchers.",
    datePublished: "2026-01-06T10:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p3", name: "Sarah Chen", role: "host", img: "https://i.pravatar.cc/150?u=sarachen" },
      { id: "p9", name: "Nina Kowalski", role: "guest", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep11",
    podcastId: "pc2",
    title: "The Rise of Local-First Software",
    description: "Sync engines, CRDTs, and building apps that work offline-first. The local-first movement is here to stay.",
    datePublished: "2025-12-30T10:00:00Z",
    duration: 2100,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p3", name: "Sarah Chen", role: "host", img: "https://i.pravatar.cc/150?u=sarachen" },
    ],
  },

  // The Comedy Hour (pc3)
  {
    id: "ep12",
    podcastId: "pc3",
    title: "New Year, Same Terrible Resolutions",
    description: "Marcus roasts the worst New Year's resolutions and interviews comedian Nina Kowalski about her tour.",
    datePublished: "2026-01-26T18:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p4", name: "Marcus Johnson", role: "host", img: "https://i.pravatar.cc/150?u=marcusj" },
      { id: "p9", name: "Nina Kowalski", role: "guest", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep13",
    podcastId: "pc3",
    title: "Tech Bros Try Cooking",
    description: "The funniest videos of tech founders attempting to cook, plus stand-up bits about Silicon Valley culture.",
    datePublished: "2026-01-19T18:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p4", name: "Marcus Johnson", role: "host", img: "https://i.pravatar.cc/150?u=marcusj" },
    ],
  },
  {
    id: "ep14",
    podcastId: "pc3",
    title: "Awkward Family Dinners Vol. 3",
    description: "Listener stories about the most awkward family dinners of the holiday season.",
    datePublished: "2026-01-12T18:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p4", name: "Marcus Johnson", role: "host", img: "https://i.pravatar.cc/150?u=marcusj" },
    ],
  },
  {
    id: "ep15",
    podcastId: "pc3",
    title: "The Year in Memes: 2025 Edition",
    description: "A comprehensive, deeply unnecessary review of every major meme from 2025.",
    datePublished: "2026-01-05T18:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p4", name: "Marcus Johnson", role: "host", img: "https://i.pravatar.cc/150?u=marcusj" },
    ],
  },
  {
    id: "ep16",
    podcastId: "pc3",
    title: "Holiday Travel Horror Stories",
    description: "Airports, in-laws, and lost luggage. The funniest (and most painful) holiday travel tales from listeners.",
    datePublished: "2025-12-29T18:00:00Z",
    duration: 3300,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p4", name: "Marcus Johnson", role: "host", img: "https://i.pravatar.cc/150?u=marcusj" },
    ],
  },

  // World Report Daily (pc4)
  {
    id: "ep17",
    podcastId: "pc4",
    title: "Global Trade Shifts in 2026",
    description: "How new trade agreements and tariff changes are reshaping the global economy.",
    datePublished: "2026-01-29T06:00:00Z",
    duration: 1800,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p5", name: "Elena Rodriguez", role: "host", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },
  {
    id: "ep18",
    podcastId: "pc4",
    title: "Climate Summit Recap",
    description: "Key takeaways from the latest climate summit. What was agreed, what wasn't, and what happens next.",
    datePublished: "2026-01-22T06:00:00Z",
    duration: 1500,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p5", name: "Elena Rodriguez", role: "host", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },
  {
    id: "ep19",
    podcastId: "pc4",
    title: "Election Watch: Super Tuesday Preview",
    description: "Analysis of the upcoming primary elections and what the polls are telling us.",
    datePublished: "2026-01-15T06:00:00Z",
    duration: 2100,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p5", name: "Elena Rodriguez", role: "host", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },
  {
    id: "ep20",
    podcastId: "pc4",
    title: "Space Race 2.0: Moon Base Progress",
    description: "Updates on the international effort to build permanent lunar habitats.",
    datePublished: "2026-01-08T06:00:00Z",
    duration: 1200,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p5", name: "Elena Rodriguez", role: "host", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },
  {
    id: "ep21",
    podcastId: "pc4",
    title: "Year in Review: 2025's Biggest Stories",
    description: "The defining events of 2025 and their lasting impact on the world stage.",
    datePublished: "2026-01-01T06:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p5", name: "Elena Rodriguez", role: "host", img: "https://i.pravatar.cc/150?u=elenar" },
    ],
  },

  // Open Source Jams (pc5)
  {
    id: "ep22",
    podcastId: "pc5",
    title: "Lo-Fi Beats for Open Minds",
    description: "A curated selection of the best lo-fi and chillhop tracks released under Creative Commons this month.",
    datePublished: "2026-01-25T20:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p8", name: "Chris Taylor", role: "host", img: "https://i.pravatar.cc/150?u=christaylor" },
    ],
  },
  {
    id: "ep23",
    podcastId: "pc5",
    title: "Indie Electronic Discoveries",
    description: "Electronic artists who are pushing boundaries and releasing their work freely. 10 tracks you need to hear.",
    datePublished: "2026-01-18T20:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p8", name: "Chris Taylor", role: "host", img: "https://i.pravatar.cc/150?u=christaylor" },
    ],
  },
  {
    id: "ep24",
    podcastId: "pc5",
    title: "Acoustic Sessions Vol. 12",
    description: "Beautiful acoustic performances from independent artists around the world.",
    datePublished: "2026-01-11T20:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p8", name: "Chris Taylor", role: "host", img: "https://i.pravatar.cc/150?u=christaylor" },
    ],
  },
  {
    id: "ep25",
    podcastId: "pc5",
    title: "World Music Without Borders",
    description: "From West African beats to Scandinavian folk, open-license world music that transcends geography.",
    datePublished: "2026-01-04T20:00:00Z",
    duration: 3300,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p8", name: "Chris Taylor", role: "host", img: "https://i.pravatar.cc/150?u=christaylor" },
    ],
  },
  {
    id: "ep26",
    podcastId: "pc5",
    title: "Best of 2025: Open Music Awards",
    description: "Our picks for the best Creative Commons music released in 2025 across all genres.",
    datePublished: "2025-12-28T20:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p8", name: "Chris Taylor", role: "host", img: "https://i.pravatar.cc/150?u=christaylor" },
    ],
  },

  // Mind & Body (pc6)
  {
    id: "ep27",
    podcastId: "pc6",
    title: "The Science of Sleep Optimization",
    description: "New research on circadian rhythms, sleep stages, and practical tips for better rest.",
    datePublished: "2026-01-24T08:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p7", name: "Aisha Patel", role: "host", img: "https://i.pravatar.cc/150?u=aishap" },
    ],
  },
  {
    id: "ep28",
    podcastId: "pc6",
    title: "Breathwork for Beginners",
    description: "A guided introduction to breathing techniques that reduce stress and improve focus.",
    datePublished: "2026-01-17T08:00:00Z",
    duration: 1800,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p7", name: "Aisha Patel", role: "host", img: "https://i.pravatar.cc/150?u=aishap" },
    ],
  },
  {
    id: "ep29",
    podcastId: "pc6",
    title: "Nutrition Myths Debunked",
    description: "A registered dietitian joins to bust common nutrition myths with actual science.",
    datePublished: "2026-01-10T08:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p7", name: "Aisha Patel", role: "host", img: "https://i.pravatar.cc/150?u=aishap" },
      { id: "p9", name: "Nina Kowalski", role: "guest", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep30",
    podcastId: "pc6",
    title: "Movement as Medicine",
    description: "How regular movement (not just exercise) transforms physical and mental health.",
    datePublished: "2026-01-03T08:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p7", name: "Aisha Patel", role: "host", img: "https://i.pravatar.cc/150?u=aishap" },
    ],
  },
  {
    id: "ep31",
    podcastId: "pc6",
    title: "Digital Detox: A 7-Day Challenge",
    description: "Aisha shares her experience with a full week of reduced screen time and the surprising results.",
    datePublished: "2025-12-27T08:00:00Z",
    duration: 2100,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p7", name: "Aisha Patel", role: "host", img: "https://i.pravatar.cc/150?u=aishap" },
    ],
  },

  // Startup Stories (pc7)
  {
    id: "ep32",
    podcastId: "pc7",
    title: "From Side Project to $10M ARR",
    description: "The founder of a developer tools company shares how a weekend project became a venture-backed startup.",
    datePublished: "2026-01-23T12:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p6", name: "James O'Brien", role: "host", img: "https://i.pravatar.cc/150?u=jamesobrien" },
      { id: "p3", name: "Sarah Chen", role: "guest", img: "https://i.pravatar.cc/150?u=sarachen" },
    ],
  },
  {
    id: "ep33",
    podcastId: "pc7",
    title: "Bootstrapping vs. VC: The Real Tradeoffs",
    description: "Two founders debate the merits of bootstrapping versus taking venture capital.",
    datePublished: "2026-01-16T12:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p6", name: "James O'Brien", role: "host", img: "https://i.pravatar.cc/150?u=jamesobrien" },
    ],
  },
  {
    id: "ep34",
    podcastId: "pc7",
    title: "The Pivot That Saved Our Company",
    description: "When your original idea fails, how do you find the pivot that works? Three founders share their stories.",
    datePublished: "2026-01-09T12:00:00Z",
    duration: 3300,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p6", name: "James O'Brien", role: "host", img: "https://i.pravatar.cc/150?u=jamesobrien" },
    ],
  },
  {
    id: "ep35",
    podcastId: "pc7",
    title: "Hiring Your First 10 Employees",
    description: "The make-or-break decisions of early hiring. What to look for and what to avoid.",
    datePublished: "2026-01-02T12:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(4),
    persons: [
      { id: "p6", name: "James O'Brien", role: "host", img: "https://i.pravatar.cc/150?u=jamesobrien" },
    ],
  },
  {
    id: "ep36",
    podcastId: "pc7",
    title: "Lessons from Failure: Shutting Down Gracefully",
    description: "Not every startup succeeds. A founder shares the painful but valuable lessons of closing a company.",
    datePublished: "2025-12-26T12:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p6", name: "James O'Brien", role: "host", img: "https://i.pravatar.cc/150?u=jamesobrien" },
    ],
  },

  // History Unfolded (pc8)
  {
    id: "ep37",
    podcastId: "pc8",
    title: "The Library of Alexandria: What Really Happened",
    description: "Separating myth from reality about the destruction of the ancient world's greatest library.",
    datePublished: "2026-01-22T16:00:00Z",
    duration: 3600,
    enclosureUrl: audioUrl(4),
    image: "https://picsum.photos/seed/ep37/400/400",
    persons: [
      { id: "p9", name: "Nina Kowalski", role: "host", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep38",
    podcastId: "pc8",
    title: "The Forgotten Women of Computing",
    description: "The untold stories of women who built the foundations of computer science long before Silicon Valley.",
    datePublished: "2026-01-15T16:00:00Z",
    duration: 3000,
    enclosureUrl: audioUrl(0),
    persons: [
      { id: "p9", name: "Nina Kowalski", role: "host", img: "https://i.pravatar.cc/150?u=ninak" },
      { id: "p3", name: "Sarah Chen", role: "guest", img: "https://i.pravatar.cc/150?u=sarachen" },
    ],
  },
  {
    id: "ep39",
    podcastId: "pc8",
    title: "Silk Road: The Original Internet",
    description: "How the ancient Silk Road connected civilizations and shaped global culture centuries before the web.",
    datePublished: "2026-01-08T16:00:00Z",
    duration: 2700,
    enclosureUrl: audioUrl(1),
    persons: [
      { id: "p9", name: "Nina Kowalski", role: "host", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep40",
    podcastId: "pc8",
    title: "The Moon Landing Nobody Talks About",
    description: "Beyond Apollo 11: the lesser-known lunar missions and their groundbreaking discoveries.",
    datePublished: "2026-01-01T16:00:00Z",
    duration: 3300,
    enclosureUrl: audioUrl(2),
    persons: [
      { id: "p9", name: "Nina Kowalski", role: "host", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
  {
    id: "ep41",
    podcastId: "pc8",
    title: "Pompeii: A Day in the Life Before the Eruption",
    description: "Archaeological evidence reveals what daily life was actually like in Pompeii before Vesuvius changed everything.",
    datePublished: "2025-12-25T16:00:00Z",
    duration: 2400,
    enclosureUrl: audioUrl(3),
    persons: [
      { id: "p9", name: "Nina Kowalski", role: "host", img: "https://i.pravatar.cc/150?u=ninak" },
    ],
  },
];

export function getEpisodesByPodcastId(podcastId: string): Episode[] {
  return episodes.filter((e) => e.podcastId === podcastId);
}

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find((e) => e.id === id);
}

export function getRecentEpisodes(limit = 10): Episode[] {
  return [...episodes]
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, limit);
}
