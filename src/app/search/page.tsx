"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { podcasts } from "@/data/podcasts";
import { episodes } from "@/data/episodes";
import { getChaptersByEpisodeId } from "@/data/chapters";
import { categories } from "@/data/categories";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [query, setQuery] = useState("");

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === categoryParam),
    [categoryParam]
  );

  const filteredPodcasts = useMemo(() => {
    let results = podcasts;
    if (activeCategory) {
      results = results.filter((p) =>
        p.categories.some((c) => c.toLowerCase() === activeCategory.name.toLowerCase())
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categories.some((c) => c.includes(q))
      );
    }
    return results;
  }, [query, activeCategory]);

  const filteredEpisodes = useMemo(() => {
    let results = episodes;
    if (activeCategory) {
      const categoryPodcastIds = new Set(
        podcasts
          .filter((p) => p.categories.some((c) => c.toLowerCase() === activeCategory.name.toLowerCase()))
          .map((p) => p.id)
      );
      results = results.filter((e) => categoryPodcastIds.has(e.podcastId));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return query.trim() || activeCategory ? results : results.slice(0, 15);
  }, [query, activeCategory]);

  const podcastMap = useMemo(
    () => new Map(podcasts.map((p) => [p.id, p])),
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search podcasts, episodes, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-base"
          />
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
          <TabsTrigger value="podcasts">
            Podcasts ({filteredPodcasts.length})
          </TabsTrigger>
          <TabsTrigger value="episodes">
            Episodes ({filteredEpisodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts" className="mt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
          {filteredPodcasts.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No podcasts found for &quot;{query}&quot;
            </p>
          )}
        </TabsContent>

        <TabsContent value="episodes" className="mt-4">
          <div className="flex flex-col">
            {filteredEpisodes.map((episode) => {
              const podcast = podcastMap.get(episode.podcastId);
              return (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  podcastTitle={podcast?.title}
                  podcastImage={podcast?.image}
                  showPodcastName
                  chapters={getChaptersByEpisodeId(episode.id)}
                  chapterCount={getChaptersByEpisodeId(episode.id).length}
                />
              );
            })}
          </div>
          {filteredEpisodes.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No episodes found for &quot;{query}&quot;
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
