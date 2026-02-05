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
import { getPodcastById } from "@/data/podcasts";
import { getEpisodesByPodcastId } from "@/data/episodes";
import { persons } from "@/data/persons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EpisodeRow } from "@/components/podcast/episode-row";
import { PersonTag } from "@/components/podcast/person-tag";
import { SubscribeButton } from "./subscribe-button";
import { getChaptersByEpisodeId } from "@/data/chapters";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ podcastId: string }>;
}) {
  const { podcastId } = await params;
  const podcast = getPodcastById(podcastId);
  if (!podcast) notFound();

  const episodes = getEpisodesByPodcastId(podcastId);
  const trailer = episodes.find((e) => e.isTrailer);
  const regularEpisodes = episodes.filter((e) => !e.isTrailer);

  // Get unique persons from all episodes
  const podcastPersonIds = new Set<string>();
  episodes.forEach((ep) => ep.persons.forEach((p) => podcastPersonIds.add(p.id)));
  const podcastPersons = persons.filter((p) => podcastPersonIds.has(p.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={podcast.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-15 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        <div className="relative flex gap-6 p-8">
          <Image
            src={podcast.image}
            alt={podcast.title}
            width={220}
            height={220}
            priority
            className="size-52 rounded-xl shadow-2xl"
          />
          <div className="flex flex-col justify-end gap-3">
            <div className="flex items-center gap-2">
              {podcast.medium !== "podcast" && (
                <Badge variant="secondary" className="capitalize">
                  {podcast.medium}
                </Badge>
              )}
              {podcast.locked && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <LockIcon className="size-3" /> Locked
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold">{podcast.title}</h1>
            <p className="text-lg text-muted-foreground">{podcast.author}</p>
            <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">
              {podcast.description}
            </p>
            <div className="flex items-center gap-3">
              <SubscribeButton podcastId={podcast.id} />
              {podcast.value && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-500/30 text-yellow-500"
                >
                  <ZapIcon className="size-3" /> Value4Value
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {podcast.episodeCount} episodes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Persons */}
      {podcastPersons.length > 0 && (
        <div className="flex flex-wrap gap-3 px-6">
          {podcastPersons.map((person) => (
            <PersonTag key={person.id} person={person} />
          ))}
        </div>
      )}

      {/* Episodes */}
      <div className="px-6">
        <h2 className="mb-3 text-lg font-semibold">Episodes</h2>
        {trailer && (
          <>
            <EpisodeRow
              key={trailer.id}
              episode={trailer}
              podcastTitle={podcast.title}
              podcastImage={podcast.image}
              chapters={getChaptersByEpisodeId(trailer.id)}
              chapterCount={getChaptersByEpisodeId(trailer.id).length}
            />
            <Separator className="my-2" />
          </>
        )}
        <div className="flex flex-col">
          {regularEpisodes.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              podcastTitle={podcast.title}
              podcastImage={podcast.image}
              chapters={getChaptersByEpisodeId(episode.id)}
              chapterCount={getChaptersByEpisodeId(episode.id).length}
            />
          ))}
        </div>
      </div>

      {/* About — Collapsible */}
      <div className="px-6 pb-6">
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2">
            <h2 className="text-lg font-semibold">About</h2>
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-w-2xl space-y-4 pt-2">
              <p className="text-sm leading-relaxed">{podcast.description}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-muted-foreground">{podcast.language}</p>
                </div>
                <div>
                  <p className="font-medium">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {podcast.categories.map((c) => (
                      <Badge key={c} variant="secondary" className="capitalize">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                {podcast.license && (
                  <div>
                    <p className="flex items-center gap-1 font-medium">
                      <ScaleIcon className="size-3" /> License
                    </p>
                    <p className="text-muted-foreground">{podcast.license}</p>
                  </div>
                )}
                {podcast.location && (
                  <div>
                    <p className="flex items-center gap-1 font-medium">
                      <MapPinIcon className="size-3" /> Location
                    </p>
                    <p className="text-muted-foreground">{podcast.location}</p>
                  </div>
                )}
              </div>
              {podcast.funding && podcast.funding.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Funding</p>
                    <div className="flex flex-col gap-2">
                      {podcast.funding.map((f, i) => (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLinkIcon className="size-3" />
                          {f.message}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Value info inline */}
              {podcast.value && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Value Splits</p>
                    <p className="mb-3 text-sm text-muted-foreground">
                      This podcast supports Value-for-Value via Lightning payments.
                    </p>
                    <div className="flex flex-col gap-2">
                      {podcast.value.recipients.map((r, i) => (
                        <div
                          key={i}
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
      </div>
    </div>
  );
}
