import crypto from "crypto";

const API_BASE = "https://api.podcastindex.org/api/1.0";

interface PodcastIndexConfig {
  apiKey: string;
  apiSecret: string;
}

function getConfig(): PodcastIndexConfig {
  const apiKey = process.env.PODCAST_INDEX_API_KEY;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Podcast Index API credentials not configured");
  }

  return { apiKey, apiSecret };
}

function getAuthHeaders(config: PodcastIndexConfig): HeadersInit {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash("sha1")
    .update(config.apiKey + config.apiSecret + apiHeaderTime)
    .digest("hex");

  return {
    "X-Auth-Date": apiHeaderTime.toString(),
    "X-Auth-Key": config.apiKey,
    Authorization: hash,
    "User-Agent": "PodCentral/1.0",
  };
}

async function fetchPodcastIndex<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const config = getConfig();
  const url = new URL(`${API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(config),
  });

  if (!response.ok) {
    throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PodcastIndexPodcast {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  inPollingQueue: number;
  priority: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId: number | null;
  generator: string;
  language: string;
  type: number;
  dead: number;
  chash: string;
  episodeCount: number;
  crawlErrors: number;
  parseErrors: number;
  categories: Record<string, string>;
  locked: number;
  imageUrlHash: number;
  newestItemPubdate: number;
  funding?: {
    url: string;
    message: string;
  };
  value?: {
    model: {
      type: string;
      method: string;
    };
    destinations: {
      name: string;
      address: string;
      type: string;
      split: number;
    }[];
  };
}

export interface PodcastIndexEpisode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode: number | null;
  episodeType: string;
  season: number | null;
  image: string;
  feedItunesId: number | null;
  feedImage: string;
  feedId: number;
  feedLanguage: string;
  feedDead: number;
  feedDuplicateOf: number | null;
  chaptersUrl: string | null;
  transcriptUrl: string | null;
  soundbite: {
    startTime: number;
    duration: number;
    title: string;
  } | null;
  soundbites?: {
    startTime: number;
    duration: number;
    title: string;
  }[];
  persons?: {
    id: number;
    name: string;
    role: string;
    group: string;
    href: string;
    img: string;
  }[];
  socialInteract?: {
    url: string;
    protocol: string;
    accountId: string;
    accountUrl: string;
  }[];
  value?: {
    model: {
      type: string;
      method: string;
    };
    destinations: {
      name: string;
      address: string;
      type: string;
      split: number;
    }[];
  };
}

interface SearchResponse {
  status: string;
  feeds: PodcastIndexPodcast[];
  count: number;
  query: string;
  description: string;
}

interface PodcastByIdResponse {
  status: string;
  feed: PodcastIndexPodcast;
  query: {
    id: string;
  };
  description: string;
}

interface EpisodesResponse {
  status: string;
  items: PodcastIndexEpisode[];
  count: number;
  query: string;
  description: string;
}

interface TrendingResponse {
  status: string;
  feeds: PodcastIndexPodcast[];
  count: number;
  max: number;
  since: number;
  description: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export async function searchPodcasts(query: string): Promise<PodcastIndexPodcast[]> {
  const response = await fetchPodcastIndex<SearchResponse>("/search/byterm", {
    q: query,
  });
  return response.feeds || [];
}

export async function getPodcastByFeedId(feedId: number): Promise<PodcastIndexPodcast | null> {
  try {
    const response = await fetchPodcastIndex<PodcastByIdResponse>("/podcasts/byfeedid", {
      id: feedId.toString(),
    });
    return response.feed || null;
  } catch {
    return null;
  }
}

export async function getPodcastByFeedUrl(feedUrl: string): Promise<PodcastIndexPodcast | null> {
  try {
    const response = await fetchPodcastIndex<{ feed: PodcastIndexPodcast }>("/podcasts/byfeedurl", {
      url: feedUrl,
    });
    return response.feed || null;
  } catch {
    return null;
  }
}

export async function getEpisodesByFeedId(
  feedId: number,
  max = 100
): Promise<PodcastIndexEpisode[]> {
  const response = await fetchPodcastIndex<EpisodesResponse>("/episodes/byfeedid", {
    id: feedId.toString(),
    max: max.toString(),
  });
  return response.items || [];
}

export async function getTrendingPodcasts(
  max = 20,
  lang = "en",
  categories?: string
): Promise<PodcastIndexPodcast[]> {
  const params: Record<string, string> = {
    max: max.toString(),
    lang,
  };

  if (categories) {
    params.cat = categories;
  }

  const response = await fetchPodcastIndex<TrendingResponse>("/podcasts/trending", params);
  return response.feeds || [];
}

export async function getRecentPodcasts(max = 20): Promise<PodcastIndexPodcast[]> {
  const response = await fetchPodcastIndex<{ feeds: PodcastIndexPodcast[] }>("/recent/feeds", {
    max: max.toString(),
  });
  return response.feeds || [];
}

export async function getEpisodeById(episodeId: number): Promise<PodcastIndexEpisode | null> {
  try {
    const response = await fetchPodcastIndex<{ episode: PodcastIndexEpisode }>("/episodes/byid", {
      id: episodeId.toString(),
      fulltext: "true",
    });
    return response.episode || null;
  } catch {
    return null;
  }
}
