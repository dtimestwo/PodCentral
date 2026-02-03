import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon } from "lucide-react";
import { getEpisodeById } from "@/data/episodes";
import { getPodcastById } from "@/data/podcasts";
import { getChaptersByEpisodeId } from "@/data/chapters";
import { getTranscriptByEpisodeId } from "@/data/transcripts";
import { getCommentsByEpisodeId } from "@/data/comments";
import { getSoundbitesByEpisodeId } from "@/data/soundbites";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonTag } from "@/components/podcast/person-tag";
import { formatDurationFromSeconds, formatDate } from "@/lib/format";
import { EpisodePlayButton } from "./episode-play-button";
import { ChapterList } from "./chapter-list";
import { SoundbiteList } from "./soundbite-list";
import { ZapIcon } from "lucide-react";

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
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Episode Header */}
      <div className="flex gap-6">
        <Image
          src={episode.image || podcast.image}
          alt={episode.title}
          width={180}
          height={180}
          className="size-44 rounded-xl shadow-lg"
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

      {/* Tabbed Content */}
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          {chapters.length > 0 && (
            <TabsTrigger value="chapters">
              Chapters ({chapters.length})
            </TabsTrigger>
          )}
          {transcript.length > 0 && (
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          )}
          {comments.length > 0 && (
            <TabsTrigger value="comments">
              Comments ({comments.length})
            </TabsTrigger>
          )}
          {soundbites.length > 0 && (
            <TabsTrigger value="soundbites">
              Soundbites ({soundbites.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <p className="max-w-2xl text-sm leading-relaxed">
            {episode.description}
          </p>
        </TabsContent>

        {chapters.length > 0 && (
          <TabsContent value="chapters" className="mt-4">
            <ChapterList chapters={chapters} {...trackProps} />
          </TabsContent>
        )}

        {transcript.length > 0 && (
          <TabsContent value="transcript" className="mt-4">
            <div className="flex max-w-2xl flex-col gap-3">
              {transcript.map((seg) => (
                <div key={`${seg.startTime}-${seg.speaker}`} className="flex gap-3">
                  <span className="min-w-16 text-xs font-mono text-muted-foreground">
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
          </TabsContent>
        )}

        {comments.length > 0 && (
          <TabsContent value="comments" className="mt-4">
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
          </TabsContent>
        )}

        {soundbites.length > 0 && (
          <TabsContent value="soundbites" className="mt-4">
            <SoundbiteList soundbites={soundbites} {...trackProps} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
