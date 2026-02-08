"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchIcon, XIcon, Loader2, Globe, Database, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { createClient } from "@/lib/supabase/client";
import { stripHtml } from "@/lib/html";
import { sanitizeSearchQuery } from "@/lib/validation";
import type { Chapter } from "@/lib/types";

// Local types that match what we fetch from DB (subset of full types)
interface LocalPodcast {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  episodeCount: number;
  language: string;
  categories: string[];
  podcastIndexId?: number | null;
}

interface LocalEpisode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  datePublished: string;
  duration: number;
  enclosureUrl: string;
  image?: string;
  episode?: number;
}

interface LocalCategory {
  id: string;
  name: string;
}

interface PodcastIndexResult {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  episodeCount: number;
  language: string;
  categories: string[];
  // Local state for sync status
  syncing?: boolean;
  synced?: boolean;
  syncedPodcastId?: string;
  syncError?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Local database results
  const [podcasts, setPodcasts] = useState<LocalPodcast[]>([]);
  const [episodes, setEpisodes] = useState<LocalEpisode[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [chaptersByEpisode, setChaptersByEpisode] = useState<Record<string, Chapter[]>>({});

  // Podcast Index results
  const [podcastIndexResults, setPodcastIndexResults] = useState<PodcastIndexResult[]>([]);
  const [searchingIndex, setSearchingIndex] = useState(false);

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<LocalCategory | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load categories and find active category
  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (data) {
        const cats = data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }));
        setCategories(cats);
        if (categoryParam) {
          setActiveCategory(cats.find((c: LocalCategory) => c.id === categoryParam) || null);
        }
      }
    }
    loadCategories();
  }, [categoryParam]);

  // Search local database
  useEffect(() => {
    async function searchLocal() {
      setLoading(true);
      const supabase = createClient();

      // Build podcast query
      let podcastQuery = supabase
        .from("podcasts")
        .select("id, title, author, description, image, episode_count, language, categories, podcast_index_id");

      const safeQuery = sanitizeSearchQuery(debouncedQuery);
      if (safeQuery) {
        podcastQuery = podcastQuery.or(
          `title.ilike.%${safeQuery}%,author.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        );
      }

      // Build episode query
      let episodeQuery = supabase
        .from("episodes")
        .select("id, podcast_id, title, description, date_published, duration, enclosure_url, image, episode")
        .order("date_published", { ascending: false })
        .limit(50);

      if (safeQuery) {
        episodeQuery = episodeQuery.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        );
      }

      const [podcastRes, episodeRes] = await Promise.all([
        podcastQuery,
        episodeQuery,
      ]);

      if (podcastRes.data) {
        const mapped = podcastRes.data.map((p: {
          id: string;
          title: string;
          author: string;
          description: string;
          image: string | null;
          episode_count: number;
          language: string;
          categories: string[];
          podcast_index_id: number | null;
        }) => ({
          id: p.id,
          title: p.title,
          author: p.author,
          description: p.description,
          image: p.image || "",
          episodeCount: p.episode_count,
          language: p.language,
          categories: p.categories || [],
          podcastIndexId: p.podcast_index_id,
        }));

        // Filter by category if needed
        if (activeCategory) {
          setPodcasts(mapped.filter((p: LocalPodcast) =>
            p.categories.some((c: string) => c.toLowerCase() === activeCategory.name.toLowerCase())
          ));
        } else {
          setPodcasts(mapped);
        }
      }

      if (episodeRes.data) {
        const mapped = episodeRes.data.map((e: {
          id: string;
          podcast_id: string;
          title: string;
          description: string;
          date_published: string;
          duration: number;
          enclosure_url: string;
          image: string | null;
          episode: number | null;
        }) => ({
          id: e.id,
          podcastId: e.podcast_id,
          title: e.title,
          description: e.description,
          datePublished: e.date_published,
          duration: e.duration,
          enclosureUrl: e.enclosure_url,
          image: e.image || undefined,
          episode: e.episode || undefined,
        }));

        // Filter by category podcasts if needed
        if (activeCategory && podcastRes.data) {
          const categoryPodcastIds = new Set(
            podcastRes.data
              .filter((p: { categories: string[] }) =>
                p.categories?.some((c: string) => c.toLowerCase() === activeCategory.name.toLowerCase())
              )
              .map((p: { id: string }) => p.id)
          );
          setEpisodes(mapped.filter((e: LocalEpisode) => categoryPodcastIds.has(e.podcastId)));
        } else {
          setEpisodes(mapped);
        }

        // Load chapters for episodes
        const episodeIds = mapped.map((e: LocalEpisode) => e.id);
        if (episodeIds.length > 0) {
          const { data: chapters } = await supabase
            .from("chapters")
            .select("id, episode_id, title, start_time, end_time")
            .in("episode_id", episodeIds);

          if (chapters) {
            const byEpisode: Record<string, Chapter[]> = {};
            chapters.forEach((ch: { id: string; episode_id: string; title: string; start_time: number; end_time: number | null }) => {
              if (!byEpisode[ch.episode_id]) byEpisode[ch.episode_id] = [];
              byEpisode[ch.episode_id].push({
                title: ch.title,
                startTime: ch.start_time,
                endTime: ch.end_time || undefined,
              });
            });
            setChaptersByEpisode(byEpisode);
          }
        }
      }

      setLoading(false);
    }

    searchLocal();
  }, [debouncedQuery, activeCategory]);

  // Search Podcast Index API
  const searchPodcastIndex = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setPodcastIndexResults([]);
      return;
    }

    setSearchingIndex(true);
    try {
      const res = await fetch(`/api/podcast-index/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setPodcastIndexResults(data.podcasts || []);
      }
    } catch (error) {
      console.error("Podcast Index search error:", error);
    } finally {
      setSearchingIndex(false);
    }
  }, [debouncedQuery]);

  // Auto-search Podcast Index when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      searchPodcastIndex();
    } else {
      setPodcastIndexResults([]);
    }
  }, [debouncedQuery, searchPodcastIndex]);

  // Sync podcast from Podcast Index to local database
  const syncPodcast = async (podcastIndexId: number) => {
    // Update local state to show syncing
    setPodcastIndexResults(prev => prev.map(p =>
      p.id === podcastIndexId ? { ...p, syncing: true, syncError: undefined } : p
    ));

    try {
      const res = await fetch("/api/podcast-index/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId: podcastIndexId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update state to show success
        setPodcastIndexResults(prev => prev.map(p =>
          p.id === podcastIndexId ? { ...p, syncing: false, synced: true, syncedPodcastId: data.podcastId } : p
        ));
        return data.podcastId;
      } else {
        // Show error
        setPodcastIndexResults(prev => prev.map(p =>
          p.id === podcastIndexId ? { ...p, syncing: false, syncError: data.error || "Failed to add podcast" } : p
        ));
      }
    } catch (error) {
      console.error("Failed to sync podcast:", error);
      setPodcastIndexResults(prev => prev.map(p =>
        p.id === podcastIndexId ? { ...p, syncing: false, syncError: "Network error" } : p
      ));
    }
    return null;
  };

  // Navigate to synced podcast
  const goToPodcast = (podcastId: string) => {
    router.push(`/podcast/${podcastId}`);
  };

  // Handle clicking on a Podcast Index result - sync if needed, then navigate
  const handlePodcastIndexClick = async (podcast: PodcastIndexResult) => {
    // If already synced, go directly to the podcast page
    if (podcast.synced && podcast.syncedPodcastId) {
      goToPodcast(podcast.syncedPodcastId);
      return;
    }

    // Sync the podcast first
    const podcastId = await syncPodcast(podcast.id);
    if (podcastId) {
      goToPodcast(podcastId);
    }
  };

  const podcastMap = new Map(podcasts.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">
            Search podcasts and episodes
          </label>
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Search podcasts, episodes, or discover new shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-base"
          />
          {(loading || searchingIndex) && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {activeCategory && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              {activeCategory.name}
              <a href="/search" className="ml-1 hover:text-foreground">
                <XIcon className="size-3" />
              </a>
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="podcasts">
        <TabsList>
          <TabsTrigger value="podcasts" className="gap-2">
            <Database className="size-3" />
            Library ({podcasts.length})
          </TabsTrigger>
          <TabsTrigger value="episodes">
            Episodes ({episodes.length})
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Globe className="size-3" />
            Discover ({podcastIndexResults.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts" className="mt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {podcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
          {!loading && podcasts.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              {query ? `No podcasts found for "${query}"` : "No podcasts in library"}
            </p>
          )}
        </TabsContent>

        <TabsContent value="episodes" className="mt-4">
          <div className="flex flex-col">
            {episodes.map((episode) => {
              const podcast = podcastMap.get(episode.podcastId);
              const chapters = chaptersByEpisode[episode.id] || [];
              return (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  podcastTitle={podcast?.title}
                  podcastImage={podcast?.image}
                  showPodcastName
                  chapters={chapters}
                  chapterCount={chapters.length}
                />
              );
            })}
          </div>
          {!loading && episodes.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              {query ? `No episodes found for "${query}"` : "No episodes available"}
            </p>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-4">
          {!debouncedQuery.trim() ? (
            <p className="py-12 text-center text-muted-foreground">
              Enter a search term to discover podcasts from the Podcast Index
            </p>
          ) : searchingIndex ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {podcastIndexResults.map((podcast) => (
                  <button
                    key={podcast.id}
                    onClick={() => handlePodcastIndexClick(podcast)}
                    disabled={podcast.syncing}
                    className={`flex gap-4 rounded-lg border p-4 text-left transition-colors ${
                      podcast.synced ? "border-green-500/50 bg-green-500/5" : "hover:bg-muted/50"
                    } ${podcast.syncing ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                  >
                    <img
                      src={podcast.image || "/placeholder-podcast.png"}
                      alt={podcast.title}
                      className="size-20 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/podcast/200/200";
                      }}
                    />
                    <div className="flex flex-1 flex-col gap-2 min-w-0">
                      <h3 className="font-semibold line-clamp-1">{podcast.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {podcast.author}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {stripHtml(podcast.description)}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {podcast.episodeCount} episodes
                        </Badge>
                        {podcast.syncError && (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="size-3" />
                            {podcast.syncError}
                          </span>
                        )}
                        {podcast.syncing && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            Adding to library...
                          </span>
                        )}
                        {podcast.synced && (
                          <Badge variant="secondary" className="gap-1 text-xs text-green-600">
                            <Check className="size-3" />
                            In Library
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {podcastIndexResults.length === 0 && (
                <p className="py-12 text-center text-muted-foreground">
                  No podcasts found on Podcast Index for &quot;{debouncedQuery}&quot;
                </p>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
