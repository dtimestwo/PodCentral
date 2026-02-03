"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "@/stores/library-store";

export function SubscribeButton({ podcastId }: { podcastId: string }) {
  const isSubscribed = useLibraryStore((s) => s.subscriptions.includes(podcastId));
  const subscribe = useLibraryStore((s) => s.subscribe);
  const unsubscribe = useLibraryStore((s) => s.unsubscribe);

  return (
    <Button
      variant={isSubscribed ? "secondary" : "default"}
      onClick={() =>
        isSubscribed ? unsubscribe(podcastId) : subscribe(podcastId)
      }
    >
      {isSubscribed ? (
        <>
          <CheckIcon className="mr-1 size-4" /> Subscribed
        </>
      ) : (
        <>
          <PlusIcon className="mr-1 size-4" /> Subscribe
        </>
      )}
    </Button>
  );
}
