import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon, ChevronDownIcon, ZapIcon } from "lucide-react";
import { getEpisodeById } from "@/data/episodes";
import { getPodcastById } from "@/data/podcasts";
import { getChaptersByEpisodeId } from "@/data/chapters";
import { getTranscriptByEpisodeId } from "@/data/transcripts";
import { getCommentsByEpisodeId } from "@/data/comments";
import { getSoundbitesByEpisodeId } from "@/data/soundbites";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PersonTag } from "@/components/podcast/person-tag";
import { formatDurationFromSeconds, formatDate } from "@/lib/format";
import { EpisodePlayButton } from "./episode-play-button";
import { ChapterList } from "./chapter-list";
import { SoundbiteList } from "./soundbite-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ podcastId: string; episodeId: string }>;
}) {
  const { podcastId, episodeId } = await params;

  const episode = getEpisodeById(episodeId);
  const podcast = getPodcastById(podcastId);

  if (!episode || !podcast) notFound();

  const chapters = getChaptersByEpisodeId(episodeId);
  const transcript = getTranscriptByEpisodeId(episodeId);
  const comments = getCommentsByEpisodeId(episodeId);
  const soundbites = getSoundbitesByEpisodeId(episodeId);

  const trackProps = {
    episodeId: episode.id,
    enclosureUrl: episode.enclosureUrl,
    title: episode.title,
    artist: podcast.title,
    artwork: episode.image || podcast.image,
    duration: episode.duration,
    chapters,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Episode Header */}
      <div className="flex gap-6">
        <Image
          src={episode.image || podcast.image}
          alt={episode.title}
          width={200}
          height={200}
          className="size-48 rounded-xl shadow-lg"
        />
        <div className="flex flex-col justify-end gap-2">
          <Link
            href={`/podcast/${podcast.id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {podcast.title}
          </Link>
          <h1 className="text-2xl font-bold">{episode.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(episode.datePublished)}</span>
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {formatDurationFromSeconds(episode.duration)}
            </span>
            {episode.season && episode.episode && (
              <Badge variant="outline">
                S{episode.season}E{episode.episode}
              </Badge>
            )}
          </div>
          <EpisodePlayButton {...trackProps} />
        </div>
      </div>

      {/* Persons */}
      {episode.persons.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {episode.persons.map((person) => (
            <PersonTag key={person.id} person={person} />
          ))}
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="max-w-2xl text-sm leading-relaxed">
          {episode.description}
        </p>
      </div>

      {/* Chapters */}
      {chapters.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Chapters ({chapters.length})
          </h2>
          <ChapterList {...trackProps} />
        </div>
      )}

      {/* Soundbites */}
      {soundbites.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Soundbites ({soundbites.length})
          </h2>
          <SoundbiteList soundbites={soundbites} {...trackProps} />
        </div>
      )}

      {/* Transcript — Collapsible */}
      {transcript.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex max-w-2xl flex-col gap-3 pt-2">
              {transcript.map((seg) => (
                <div key={`${seg.startTime}-${seg.speaker}`} className="flex gap-3">
                  <span className="min-w-16 font-mono text-xs text-muted-foreground">
                    {formatDurationFromSeconds(seg.startTime)}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-primary">
                      {seg.speaker}
                    </span>
                    <p className="text-sm">{seg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div>
          <Separator className="mb-4" />
          <h2 className="mb-3 text-lg font-semibold">
            Comments ({comments.length})
          </h2>
          <div className="flex max-w-2xl flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Image
                  src={comment.authorAvatar}
                  alt={comment.author}
                  width={32}
                  height={32}
                  className="size-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {comment.platform}
                    </Badge>
                    {comment.boostAmount && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs text-yellow-500"
                      >
                        <ZapIcon className="size-3" /> {comment.boostAmount}{" "}
                        sats
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  {comment.replies.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3 border-l-2 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Image
                            src={reply.authorAvatar}
                            alt={reply.author}
                            width={24}
                            height={24}
                            className="size-6 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">
                                {reply.author}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {reply.platform}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-sm">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
