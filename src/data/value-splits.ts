import { ValueRecipient } from "@/lib/types";
import { podcasts } from "./podcasts";

export const defaultValueSplits: ValueRecipient[] = [
  { name: "Podcast Host", type: "host", address: "host@getalby.com", split: 80 },
  { name: "Podverse App", type: "app", address: "app@getalby.com", split: 10 },
  { name: "Podcast Index", type: "wallet", address: "index@getalby.com", split: 10 },
];

export function getValueSplitsForPodcast(podcastId: string): ValueRecipient[] {
  const podcast = podcasts.find((p) => p.id === podcastId);
  return podcast?.value?.recipients || defaultValueSplits;
}
