import Image from "next/image";
import { notFound } from "next/navigation";
import {
  LockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  ScaleIcon,
  ZapIcon,
  ChevronDownIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { stripHtml } from "@/lib/html";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { PersonTag } from "@/components/podcast/person-tag";
import { SubscribeButton } from "./subscribe-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DbPodcast {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string | null;
  categories: string[];
  locked: boolean;
  medium: string;
  language: string;
  episode_count: number;
  license: string | null;
  location: string | null;
  feed_url: string | null;
  podcast_funding: { url: string; message: string }[];
  value_configs: {
    id: string;
    type: string;
    method: string;
    value_recipients: { name: string; type: string; address: string; split: number }[];
  }[];
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
  season: number | null;
  episode: number | null;
  is_trailer: boolean;
}

interface DbChapter {
  id: string;
  episode_id: string;
  title: string;
  start_time: number;
  end_time: number | null;
}

interface DbPerson {
  id: string;
  name: string;
  role: string;
  img: string | null;
  href: string | null;
}

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ podcastId: string }>;
}) {
  const { podcastId } = await params;
  const supabase = await createClient();

  // Fetch podcast with funding and value config
  const { data: podcast, error: podcastError } = await supabase
    .from("podcasts")
    .select(`
      *,
      podcast_funding (url, message),
      value_configs (
        id, type, method,
        value_recipients (name, type, address, split)
      )
    `)
    .eq("id", podcastId)
    .single();

  if (podcastError || !podcast) {
    notFound();
  }

  const dbPodcast = podcast as DbPodcast;

  // Fetch episodes with pagination (limit to first 50 for performance)
  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("podcast_id", podcastId)
    .order("date_published", { ascending: false })
    .limit(50);

  const dbEpisodes = (episodes || []) as DbEpisode[];

  // Fetch chapters for all episodes
  const episodeIds = dbEpisodes.map((e) => e.id);
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .in("episode_id", episodeIds);

  const dbChapters = (chapters || []) as DbChapter[];
  const chaptersByEpisode: Record<string, { title: string; startTime: number; endTime?: number }[]> = {};
  dbChapters.forEach((ch) => {
    if (!chaptersByEpisode[ch.episode_id]) chaptersByEpisode[ch.episode_id] = [];
    chaptersByEpisode[ch.episode_id].push({
      title: ch.title,
      startTime: ch.start_time,
      endTime: ch.end_time || undefined,
    });
  });

  // Fetch persons for episodes
  const { data: episodePersons } = await supabase
    .from("episode_persons")
    .select("episode_id, persons(*)")
    .in("episode_id", episodeIds);

  const uniquePersons = new Map<string, DbPerson>();
  (episodePersons || []).forEach((ep: { episode_id: string; persons: DbPerson }) => {
    if (ep.persons) {
      uniquePersons.set(ep.persons.id, ep.persons);
    }
  });
  const podcastPersons = Array.from(uniquePersons.values());

  // Map to app types
  const mappedEpisodes = dbEpisodes.map((e) => ({
    id: e.id,
    podcastId: e.podcast_id,
    title: e.title,
    description: e.description,
    datePublished: e.date_published,
    duration: e.duration,
    enclosureUrl: e.enclosure_url,
    image: e.image || undefined,
    season: e.season || undefined,
    episode: e.episode || undefined,
    isTrailer: e.is_trailer,
  }));

  const trailer = mappedEpisodes.find((e) => e.isTrailer);
  const regularEpisodes = mappedEpisodes.filter((e) => !e.isTrailer);

  const valueConfig = dbPodcast.value_configs?.[0];
  const value = valueConfig && valueConfig.value_recipients?.length > 0
    ? {
        type: valueConfig.type as "lightning",
        method: valueConfig.method as "keysend",
        recipients: valueConfig.value_recipients.map((r) => ({
          name: r.name,
          type: r.type,
          address: r.address,
          split: r.split,
        })),
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={dbPodcast.image || "https://picsum.photos/seed/podcast/400/400"}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-15 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        <div className="relative flex gap-6 p-8">
          <Image
            src={dbPodcast.image || "https://picsum.photos/seed/podcast/400/400"}
            alt={dbPodcast.title}
            width={220}
            height={220}
            priority
            className="size-52 rounded-xl shadow-2xl"
          />
          <div className="flex flex-col justify-end gap-3">
            <div className="flex items-center gap-2">
              {dbPodcast.medium !== "podcast" && (
                <Badge variant="secondary" className="capitalize">
                  {dbPodcast.medium}
                </Badge>
              )}
              {dbPodcast.locked && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <LockIcon className="size-3" /> Locked
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold">{dbPodcast.title}</h1>
            <p className="text-lg text-muted-foreground">{dbPodcast.author}</p>
            <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">
              {stripHtml(dbPodcast.description)}
            </p>
            <div className="flex items-center gap-3">
              <SubscribeButton podcastId={dbPodcast.id} />
              {value && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-500/30 text-yellow-500"
                >
                  <ZapIcon className="size-3" /> Value4Value
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {dbPodcast.episode_count} episodes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Persons */}
      {podcastPersons.length > 0 && (
        <div className="flex flex-wrap gap-3 px-6">
          {podcastPersons.map((person) => (
            <PersonTag
              key={person.id}
              person={{
                id: person.id,
                name: person.name,
                role: person.role as "host" | "guest" | "editor" | "producer",
                img: person.img || `https://i.pravatar.cc/150?u=${person.name}`,
                href: person.href || undefined,
              }}
            />
          ))}
        </div>
      )}

      {/* Episodes */}
      <section className="px-6">
        <h2 className="mb-3 text-lg font-semibold">Episodes</h2>
        {trailer && (() => {
          const trailerChapters = chaptersByEpisode[trailer.id] || [];
          return (
            <>
              <EpisodeRow
                episode={trailer}
                podcastTitle={dbPodcast.title}
                podcastImage={dbPodcast.image || undefined}
                chapters={trailerChapters}
                chapterCount={trailerChapters.length}
              />
              <Separator className="my-2" />
            </>
          );
        })()}
        <div className="flex flex-col">
          {regularEpisodes.map((episode) => {
            const episodeChapters = chaptersByEpisode[episode.id] || [];
            return (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                podcastTitle={dbPodcast.title}
                podcastImage={dbPodcast.image || undefined}
                chapters={episodeChapters}
                chapterCount={episodeChapters.length}
              />
            );
          })}
        </div>
        {regularEpisodes.length === 0 && !trailer && (
          <p className="py-8 text-center text-muted-foreground">
            No episodes available yet
          </p>
        )}
      </section>

      {/* About — Collapsible */}
      <section className="px-6 pb-6">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2">
            <h2 className="text-lg font-semibold">About</h2>
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-w-2xl space-y-4 pt-2">
              <p className="text-sm leading-relaxed">{stripHtml(dbPodcast.description)}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-muted-foreground">{dbPodcast.language}</p>
                </div>
                <div>
                  <p className="font-medium">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {(dbPodcast.categories || []).map((c) => (
                      <Badge key={c} variant="secondary" className="capitalize">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                {dbPodcast.license && (
                  <div>
                    <p className="flex items-center gap-1 font-medium">
                      <ScaleIcon className="size-3" /> License
                    </p>
                    <p className="text-muted-foreground">{dbPodcast.license}</p>
                  </div>
                )}
                {dbPodcast.location && (
                  <div>
                    <p className="flex items-center gap-1 font-medium">
                      <MapPinIcon className="size-3" /> Location
                    </p>
                    <p className="text-muted-foreground">{dbPodcast.location}</p>
                  </div>
                )}
              </div>
              {dbPodcast.podcast_funding && dbPodcast.podcast_funding.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Funding</p>
                    <div className="flex flex-col gap-2">
                      {dbPodcast.podcast_funding.map((f) => {
                        const isValidUrl = f.url.startsWith("https://") || f.url.startsWith("http://");
                        if (!isValidUrl) return null;
                        return (
                          <a
                            key={f.url}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLinkIcon className="size-3" />
                            {f.message}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Value info inline */}
              {value && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Value Splits</p>
                    <p className="mb-3 text-sm text-muted-foreground">
                      This podcast supports Value-for-Value via Lightning payments.
                    </p>
                    <div className="flex flex-col gap-2">
                      {value.recipients.map((r) => (
                        <div
                          key={`${r.type}-${r.name}-${r.address}`}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {r.type}
                            </Badge>
                            <span className="text-sm font-medium">{r.name}</span>
                          </div>
                          <span className="font-mono text-sm font-semibold">
                            {r.split}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
