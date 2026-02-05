import { RadioIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { podcasts } from "@/data/podcasts";
import { getRecentEpisodes } from "@/data/episodes";
import { categories } from "@/data/categories";
import { getActiveLiveStreams } from "@/data/live-streams";
import { TrendingSection } from "@/components/discover/trending-section";
import { CategoryGrid } from "@/components/discover/category-grid";
import { RecentEpisodes } from "@/components/discover/recent-episodes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Home() {
  const recentEpisodes = getRecentEpisodes(8);
  const liveStreams = getActiveLiveStreams();
  const featured = podcasts.slice(0, 5);

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
              {liveStreams.map((s) => s.podcastTitle).join(", ")}
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
            {featured.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/podcast/${podcast.id}`}
                className="group flex w-[280px] shrink-0 items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
              >
                <Image
                  src={podcast.image}
                  alt={podcast.title}
                  width={64}
                  height={64}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{podcast.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{podcast.author}</p>
                  <p className="text-xs text-muted-foreground">{podcast.episodeCount} episodes</p>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Trending */}
      <TrendingSection podcasts={podcasts} />

      {/* Categories */}
      <CategoryGrid categories={categories} />

      {/* Recent Episodes */}
      <RecentEpisodes episodes={recentEpisodes} podcasts={podcasts} />
    </div>
  );
}
