import Image from "next/image";
import Link from "next/link";
import { LockIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PodcastCardProps {
  id: string;
  title: string;
  author: string;
  image: string;
  locked?: boolean;
  medium?: string;
}

export function PodcastCard({ podcast }: { podcast: PodcastCardProps }) {
  return (
    <Link href={`/podcast/${podcast.id}`}>
      <Card className="group overflow-hidden border-0 bg-transparent shadow-none transition-colors hover:bg-accent">
        <CardContent className="p-3">
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg">
            <Image
              src={podcast.image}
              alt={podcast.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            {podcast.locked && (
              <div className="absolute right-2 top-2 rounded-full bg-background/80 p-1">
                <LockIcon className="size-3" />
              </div>
            )}
            {podcast.medium !== "podcast" && (
              <Badge
                variant="secondary"
                className="absolute bottom-2 left-2 text-xs capitalize"
              >
                {podcast.medium}
              </Badge>
            )}
          </div>
          <h3 className="truncate text-sm font-semibold">{podcast.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {podcast.author}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
