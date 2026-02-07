import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon, ChevronDownIcon, ZapIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersonTag } from "@/components/podcast/person-tag";
import { formatDurationFromSeconds, formatDate } from "@/lib/format";
import { stripHtml } from "@/lib/html";
import { EpisodePlayButton } from "./episode-play-button";
import { ChapterList } from "./chapter-list";
import { SoundbiteList } from "./soundbite-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
}

interface DbPodcast {
  id: string;
  title: string;
  image: string | null;
}

interface DbChapter {
  id: string;
  title: string;
  start_time: number;
  end_time: number | null;
  img: string | null;
  url: string | null;
}

interface DbTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number | null;
  speaker: string | null;
  text: string;
}

interface DbComment {
  id: string;
  author: string;
  author_avatar: string | null;
  text: string;
  platform: string;
  boost_amount: number | null;
  created_at: string;
  parent_id: string | null;
}

interface DbSoundbite {
  id: string;
  title: string;
  start_time: number;
  duration: number;
}

interface DbPerson {
  id: string;
  name: string;
  role: string;
  img: string | null;
  href: string | null;
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ podcastId: string; episodeId: string }>;
}) {
  const { podcastId, episodeId } = await params;
  const supabase = await createClient();

  // Fetch episode and podcast in parallel
  const [episodeRes, podcastRes] = await Promise.all([
    supabase
      .from("episodes")
      .select("*")
      .eq("id", episodeId)
      .single(),
    supabase
      .from("podcasts")
      .select("id, title, image")
      .eq("id", podcastId)
      .single(),
  ]);

  if (episodeRes.error || !episodeRes.data || podcastRes.error || !podcastRes.data) {
    notFound();
  }

  const episode = episodeRes.data as DbEpisode;
  const podcast = podcastRes.data as DbPodcast;

  // Fetch related data in parallel
  const [chaptersRes, transcriptRes, commentsRes, soundbitesRes, personsRes] = await Promise.all([
    supabase
      .from("chapters")
      .select("id, title, start_time, end_time, img, url")
      .eq("episode_id", episodeId)
      .order("start_time"),
    supabase
      .from("transcript_segments")
      .select("id, start_time, end_time, speaker, text")
      .eq("episode_id", episodeId)
      .order("start_time"),
    supabase
      .from("comments")
      .select("id, author, author_avatar, text, platform, boost_amount, created_at, parent_id")
      .eq("episode_id", episodeId)
      .order("created_at", { ascending: false }),
    supabase
      .from("soundbites")
      .select("id, title, start_time, duration")
      .eq("episode_id", episodeId)
      .order("start_time"),
    supabase
      .from("episode_persons")
      .select("persons(*)")
      .eq("episode_id", episodeId),
  ]);

  const chapters = (chaptersRes.data || []) as DbChapter[];
  const transcript = (transcriptRes.data || []) as DbTranscriptSegment[];
  const allComments = (commentsRes.data || []) as DbComment[];
  const soundbites = (soundbitesRes.data || []) as DbSoundbite[];
  const persons = (personsRes.data || []).map((ep: { persons: DbPerson }) => ep.persons).filter(Boolean) as DbPerson[];

  // Build comment tree (top-level comments with replies)
  const topLevelComments = allComments.filter((c) => !c.parent_id);
  const commentReplies = new Map<string, DbComment[]>();
  allComments.filter((c) => c.parent_id).forEach((reply) => {
    const existing = commentReplies.get(reply.parent_id!) || [];
    existing.push(reply);
    commentReplies.set(reply.parent_id!, existing);
  });

  // Map chapters to app format
  const mappedChapters = chapters.map((ch) => ({
    title: ch.title,
    startTime: ch.start_time,
    endTime: ch.end_time || undefined,
    img: ch.img || undefined,
    url: ch.url || undefined,
  }));

  const trackProps = {
    podcastId: podcast.id,
    episodeId: episode.id,
    enclosureUrl: episode.enclosure_url,
    title: episode.title,
    artist: podcast.title,
    artwork: episode.image || podcast.image || "https://picsum.photos/seed/podcast/400/400",
    duration: episode.duration,
    chapters: mappedChapters,
  };

  // Map soundbites to app format
  const mappedSoundbites = soundbites.map((sb) => ({
    id: sb.id,
    title: sb.title,
    startTime: sb.start_time,
    duration: sb.duration,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Episode Header */}
      <div className="flex gap-6">
        <Image
          src={episode.image || podcast.image || "https://picsum.photos/seed/podcast/400/400"}
          alt={episode.title}
          width={200}
          height={200}
          priority
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
            <span>{formatDate(episode.date_published)}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-1">
                  <ClockIcon className="size-3" />
                  {formatDurationFromSeconds(episode.duration)}
                </span>
              </TooltipTrigger>
              <TooltipContent>Episode Duration</TooltipContent>
            </Tooltip>
            {episode.season && episode.episode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Badge variant="outline">
                      S{episode.season}E{episode.episode}
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Season {episode.season}, Episode {episode.episode}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <EpisodePlayButton {...trackProps} />
        </div>
      </div>

      {/* Persons */}
      {persons.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {persons.map((person) => (
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

      {/* Description */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Description</h2>
        <p className="max-w-2xl text-sm leading-relaxed">
          {stripHtml(episode.description)}
        </p>
      </section>

      {/* Chapters */}
      {chapters.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Chapters ({chapters.length})
          </h2>
          <ChapterList {...trackProps} />
        </section>
      )}

      {/* Transcript — Collapsible */}
      {transcript.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2 hover:bg-accent rounded-lg px-2 -mx-2">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex max-w-2xl flex-col gap-3 pt-2">
              {transcript.map((seg) => (
                <div key={seg.id} className="flex gap-3">
                  <span className="min-w-16 font-mono text-xs text-muted-foreground">
                    {formatDurationFromSeconds(seg.start_time)}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-primary">
                      {seg.speaker || "Speaker"}
                    </span>
                    <p className="text-sm">{seg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Soundbites */}
      {soundbites.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Soundbites ({soundbites.length})
          </h2>
          <SoundbiteList soundbites={mappedSoundbites} {...trackProps} />
        </section>
      )}

      {/* Comments */}
      {topLevelComments.length > 0 && (
        <section>
          <Separator className="mb-4" />
          <h2 className="mb-3 text-lg font-semibold">
            Comments ({allComments.length})
          </h2>
          <div className="flex max-w-2xl flex-col gap-4">
            {topLevelComments.map((comment) => {
              const replies = commentReplies.get(comment.id) || [];
              return (
                <div key={comment.id} className="flex gap-3">
                  <Image
                    src={comment.author_avatar || `https://i.pravatar.cc/150?u=${comment.author}`}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {comment.platform}
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Comment from {comment.platform}</TooltipContent>
                      </Tooltip>
                      {comment.boost_amount && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1 text-xs text-yellow-500"
                              >
                                <ZapIcon className="size-3" /> {comment.boost_amount}{" "}
                                sats
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Boosted with {comment.boost_amount} sats (Value4Value)
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{comment.text}</p>
                    {replies.length > 0 && (
                      <div className="mt-3 flex flex-col gap-3 border-l-2 pl-4">
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Image
                              src={reply.author_avatar || `https://i.pravatar.cc/150?u=${reply.author}`}
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs capitalize"
                                      >
                                        {reply.platform}
                                      </Badge>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Reply from {reply.platform}</TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="mt-0.5 text-sm">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
