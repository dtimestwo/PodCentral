"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  RadioIcon,
  UsersIcon,
  ZapIcon,
  SendIcon,
  CalendarIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveStream {
  id: string;
  title: string;
  podcastTitle: string;
  podcastImage: string;
  status: "live" | "scheduled";
  listenerCount: number;
  scheduledStart?: string;
  chat: ChatMessage[];
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isBoost: boolean;
  boostAmount?: number;
}

function LiveBadge() {
  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-100 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-red-100" />
      </span>
      LIVE
    </Badge>
  );
}

function LiveStreamCard({
  stream,
  onJoin,
}: {
  stream: LiveStream;
  onJoin: (stream: LiveStream) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={stream.podcastImage}
            alt={stream.podcastTitle}
            width={400}
            height={200}
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            {stream.status === "live" ? <LiveBadge /> : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CalendarIcon className="size-3" /> Scheduled
              </Badge>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{stream.title}</h3>
          <p className="text-sm text-muted-foreground">
            {stream.podcastTitle}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UsersIcon className="size-3" />
              {stream.listenerCount > 0
                ? `${stream.listenerCount} listeners`
                : "Starting soon"}
            </div>
            <Button
              size="sm"
              variant={stream.status === "live" ? "default" : "secondary"}
              onClick={() => onJoin(stream)}
              disabled={stream.status !== "live"}
            >
              {stream.status === "live" ? "Join" : "Remind Me"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveChat({ stream }: { stream: LiveStream }) {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState(stream.chat);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `cm-${Date.now()}`,
        author: "You",
        text: message,
        timestamp: new Date().toISOString(),
        isBoost: false,
      },
    ]);
    setMessage("");
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <LiveBadge />
        <span className="text-sm font-medium">{stream.title}</span>
        <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <UsersIcon className="size-3" /> {stream.listenerCount}
        </span>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-2">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.isBoost
                  ? "border border-yellow-500/20 bg-yellow-500/5"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{msg.author}</span>
                {msg.isBoost && msg.boostAmount && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs text-yellow-500"
                  >
                    <ZapIcon className="size-3" /> {msg.boostAmount}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5">{msg.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2 border-t p-3">
        <label htmlFor="chat-message" className="sr-only">
          Chat message
        </label>
        <Input
          id="chat-message"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          maxLength={500}
        />
        <Button size="icon" onClick={sendMessage} aria-label="Send message">
          <SendIcon className="size-4" />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" disabled aria-label="Boost (coming soon)">
              <ZapIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Boost coming soon</TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);

  useEffect(() => {
    async function fetchStreams() {
      const supabase = createClient();

      const { data: liveStreamsData } = await supabase
        .from("live_streams")
        .select("id, title, podcast_title, podcast_image, status, listener_count, scheduled_start")
        .in("status", ["live", "scheduled"])
        .order("status", { ascending: false });

      if (liveStreamsData) {
        // Fetch chat messages for each stream
        const streamIds = liveStreamsData.map((s: { id: string }) => s.id);
        const { data: chatData } = await supabase
          .from("chat_messages")
          .select("id, live_stream_id, author, text, created_at, is_boost, boost_amount")
          .in("live_stream_id", streamIds)
          .order("created_at", { ascending: true });

        const chatByStream = new Map<string, ChatMessage[]>();
        (chatData || []).forEach((msg: {
          id: string;
          live_stream_id: string;
          author: string;
          text: string;
          created_at: string;
          is_boost: boolean;
          boost_amount: number | null;
        }) => {
          const existing = chatByStream.get(msg.live_stream_id) || [];
          existing.push({
            id: msg.id,
            author: msg.author,
            text: msg.text,
            timestamp: msg.created_at,
            isBoost: msg.is_boost,
            boostAmount: msg.boost_amount || undefined,
          });
          chatByStream.set(msg.live_stream_id, existing);
        });

        setStreams(
          liveStreamsData.map((s: {
            id: string;
            title: string;
            podcast_title: string;
            podcast_image: string | null;
            status: string;
            listener_count: number;
            scheduled_start: string | null;
          }) => ({
            id: s.id,
            title: s.title,
            podcastTitle: s.podcast_title,
            podcastImage: s.podcast_image || "https://picsum.photos/seed/live/400/400",
            status: s.status as "live" | "scheduled",
            listenerCount: s.listener_count,
            scheduledStart: s.scheduled_start || undefined,
            chat: chatByStream.get(s.id) || [],
          }))
        );
      }

      setLoading(false);
    }

    fetchStreams();
  }, []);

  const liveStreams = streams.filter((s) => s.status === "live");
  const scheduledStreams = streams.filter((s) => s.status === "scheduled");

  if (activeStream) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => setActiveStream(null)}
        >
          &larr; Back to streams
        </Button>
        <div className="grid h-[calc(100vh-16rem)] grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col items-center justify-center bg-muted">
              <RadioIcon className="size-16 animate-pulse text-red-500" />
              <p className="mt-4 text-lg font-semibold">
                {activeStream.podcastTitle}
              </p>
              <p className="text-muted-foreground">{activeStream.title}</p>
              <div className="mt-4 flex items-center gap-2">
                <LiveBadge />
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <UsersIcon className="size-3" />{" "}
                  {activeStream.listenerCount} listeners
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="mt-4" disabled aria-label="Boost (coming soon)">
                    <ZapIcon className="mr-1 size-4" /> Boost
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Boost coming soon</TooltipContent>
              </Tooltip>
            </Card>
          </div>
          <LiveChat stream={activeStream} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center gap-3">
        <RadioIcon className="size-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live</h1>
          <p className="text-muted-foreground">
            Join live podcast streams and chat in real time
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading streams...
        </div>
      ) : (
        <>
          {liveStreams.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <LiveBadge /> Live Now
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {liveStreams.map((stream) => (
                  <LiveStreamCard
                    key={stream.id}
                    stream={stream}
                    onJoin={setActiveStream}
                  />
                ))}
              </div>
            </section>
          )}

          {scheduledStreams.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scheduledStreams.map((stream) => (
                  <LiveStreamCard
                    key={stream.id}
                    stream={stream}
                    onJoin={setActiveStream}
                  />
                ))}
              </div>
            </section>
          )}

          {liveStreams.length === 0 && scheduledStreams.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <RadioIcon className="size-8" />
              <p>No live streams at the moment</p>
              <p className="text-xs">
                Check back later for live podcast recordings
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
