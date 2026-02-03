import { Soundbite } from "@/lib/types";

export const soundbites: Soundbite[] = [
  { id: "sb1", episodeId: "ep1", startTime: 52, duration: 13, title: "200k podcasts with value tags!" },
  { id: "sb2", episodeId: "ep1", startTime: 78, duration: 12, title: "38 apps supporting Podcasting 2.0" },
  { id: "sb3", episodeId: "ep2", startTime: 28, duration: 17, title: "Transcripts transform podcasts" },
  { id: "sb4", episodeId: "ep3", startTime: 600, duration: 15, title: "Boostagram economy stats" },
  { id: "sb5", episodeId: "ep7", startTime: 720, duration: 20, title: "Coding assistants deep dive" },
  { id: "sb6", episodeId: "ep12", startTime: 300, duration: 30, title: "The worst resolutions ever" },
  { id: "sb7", episodeId: "ep37", startTime: 900, duration: 25, title: "The myth of the great fire" },
];

export function getSoundbitesByEpisodeId(episodeId: string): Soundbite[] {
  return soundbites.filter((s) => s.episodeId === episodeId);
}
