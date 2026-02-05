import { TrendingUpIcon } from "lucide-react";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Podcast } from "@/lib/types";

export function TrendingSection({ podcasts }: { podcasts: Podcast[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <TrendingUpIcon className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Trending</h2>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="w-[180px] shrink-0">
              <PodcastCard podcast={podcast} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
