import { RadioIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { podcasts } from "@/data/podcasts";
import { getRecentEpisodes } from "@/data/episodes";
import { categories } from "@/data/categories";
import { getActiveLiveStreams } from "@/data/live-streams";
import { TrendingSection } from "@/components/discover/trending-section";
import { CategoryGrid } from "@/components/discover/category-grid";
import { RecentEpisodes } from "@/components/discover/recent-episodes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const recentEpisodes = getRecentEpisodes(8);
  const liveStreams = getActiveLiveStreams();
  const featured = podcasts[0];

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

      {/* Featured Podcast Hero */}
      <section className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <Image
            src={featured.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        </div>
        <div className="relative flex items-center gap-6 p-8">
          <Image
            src={featured.image}
            alt={featured.title}
            width={200}
            height={200}
            priority
            className="size-48 rounded-xl shadow-2xl"
          />
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit">
              Featured
            </Badge>
            <h1 className="text-3xl font-bold">{featured.title}</h1>
            <p className="text-sm text-muted-foreground">{featured.author}</p>
            <p className="line-clamp-2 max-w-lg text-sm text-muted-foreground">
              {featured.description}
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/podcast/${featured.id}`}>View Podcast</Link>
              </Button>
              {featured.value && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="text-yellow-500">⚡</span> Value Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>
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
