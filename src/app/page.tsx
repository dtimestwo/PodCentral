import { RadioIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Revalidate home page data every 5 minutes
export const revalidate = 300;
import { TrendingSection } from "@/components/discover/trending-section";
import { CategoryGrid } from "@/components/discover/category-grid";
import { RecentEpisodes } from "@/components/discover/recent-episodes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DbPodcast {
  id: string;
  title: string;
  author: string;
  image: string | null;
  episode_count: number;
}

interface DbEpisode {
  id: string;
  podcast_id: string;
  title: string;
  description: string;
  date_published: string;
  duration: number;
  enclosure_url: string;
  image: string | null;
}

interface DbCategory {
  id: string;
  name: string;
}

interface DbLiveStream {
  id: string;
  title: string;
  status: string;
  podcast_title: string;
}

export default async function Home() {
  const supabase = await createClient();

  // Fetch data in parallel
  const [podcastsRes, episodesRes, categoriesRes, liveStreamsRes] = await Promise.all([
    supabase
      .from("podcasts")
      .select("id, title, author, image, episode_count")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("episodes")
      .select("id, podcast_id, title, description, date_published, duration, enclosure_url, image")
      .order("date_published", { ascending: false })
      .limit(8),
    supabase
      .from("categories")
      .select("id, name")
      .order("name"),
    supabase
      .from("live_streams")
      .select("id, title, status, podcast_title")
      .eq("status", "live"),
  ]);

  const podcasts = (podcastsRes.data || []) as DbPodcast[];
  const episodes = (episodesRes.data || []) as DbEpisode[];
  const categories = (categoriesRes.data || []) as DbCategory[];
  const liveStreams = (liveStreamsRes.data || []) as DbLiveStream[];

  const featured = podcasts.slice(0, 5);

  // Map to app types
  const mappedPodcasts = podcasts.map((p) => ({
    id: p.id,
    title: p.title,
    author: p.author,
    image: p.image || "https://picsum.photos/seed/podcast/400/400",
    episodeCount: p.episode_count,
  }));

  const mappedEpisodes = episodes.map((e) => ({
    id: e.id,
    podcastId: e.podcast_id,
    title: e.title,
    description: e.description,
    datePublished: e.date_published,
    duration: e.duration,
    enclosureUrl: e.enclosure_url,
    image: e.image || undefined,
  }));

  const mappedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Live Now Banner */}
      {liveStreams.length > 0 && (
        <Link href="/live">
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 transition-colors hover:bg-red-500/10">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-red-500" />
            </span>
            <RadioIcon className="size-4 text-red-500" />
            <span className="text-sm font-medium">
              {liveStreams.length} live {liveStreams.length === 1 ? "stream" : "streams"} now
            </span>
            <span className="text-xs text-muted-foreground">
              {liveStreams.map((s) => s.podcast_title).join(", ")}
            </span>
          </div>
        </Link>
      )}

      {/* Featured — compact horizontal row */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <StarIcon className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Featured</h2>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {featured.map((podcast, index) => (
              <Link
                key={podcast.id}
                href={`/podcast/${podcast.id}`}
                className="group flex w-[280px] shrink-0 items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
              >
                <Image
                  src={podcast.image || "https://picsum.photos/seed/podcast/400/400"}
                  alt={podcast.title}
                  width={64}
                  height={64}
                  priority={index === 0}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{podcast.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{podcast.author}</p>
                  <p className="text-xs text-muted-foreground">{podcast.episode_count} episodes</p>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Trending */}
      <TrendingSection podcasts={mappedPodcasts} />

      {/* Categories */}
      <CategoryGrid categories={mappedCategories} />

      {/* Recent Episodes */}
      <RecentEpisodes episodes={mappedEpisodes} podcasts={mappedPodcasts} />
    </div>
  );
}
