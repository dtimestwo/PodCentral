import { TranscriptSegment } from "@/lib/types";

export const transcriptsByEpisode: Record<string, TranscriptSegment[]> = {
  ep1: [
    { startTime: 0, endTime: 5, speaker: "Adam Curry", text: "Welcome to Podcasting 2.0, episode 45." },
    { startTime: 5, endTime: 12, speaker: "Dave Jones", text: "Thanks Adam. We've got a packed show today, covering the state of Podcasting 2.0 as we head into 2026." },
    { startTime: 12, endTime: 20, speaker: "Adam Curry", text: "It's been an incredible year for the namespace. Let's start with the numbers — and they are impressive." },
    { startTime: 20, endTime: 30, speaker: "Dave Jones", text: "Right. The Podcast Index now tracks over 4.2 million podcasts. Of those, 1.8 million are using at least one Podcasting 2.0 tag." },
    { startTime: 30, endTime: 40, speaker: "Adam Curry", text: "That's a 40% increase from last year. And chapters and transcripts are leading adoption, which makes sense." },
    { startTime: 40, endTime: 52, speaker: "Dave Jones", text: "Chapters are in about 800,000 feeds now. Transcripts are at about 600,000. And value tags — this is the exciting one — are in over 200,000 feeds." },
    { startTime: 52, endTime: 65, speaker: "Adam Curry", text: "Two hundred thousand podcasts with value tags. Think about that. Two years ago that number was maybe 20,000." },
    { startTime: 65, endTime: 78, speaker: "Dave Jones", text: "The app ecosystem has been a huge driver. We've got — what is it now — 38 apps supporting some level of Podcasting 2.0?" },
    { startTime: 78, endTime: 90, speaker: "Adam Curry", text: "38 apps, and at least 15 of them support the full namespace. That's chapters, transcripts, value, person tags, soundbites, the works." },
    { startTime: 90, endTime: 105, speaker: "Dave Jones", text: "Let's talk about the new features that landed this year. We got podcast:medium finally being used widely..." },
    { startTime: 105, endTime: 120, speaker: "Adam Curry", text: "Yeah, audiobooks in particular. Being able to mark a podcast feed as an audiobook and have apps display it differently — that's a game changer." },
  ],
  ep2: [
    { startTime: 0, endTime: 8, speaker: "Adam Curry", text: "Episode 44 of Podcasting 2.0. Today we're going deep on chapters and transcripts." },
    { startTime: 8, endTime: 18, speaker: "Dave Jones", text: "And we have a special guest — Elena Rodriguez — who's been doing amazing work on the reading experience in podcast apps." },
    { startTime: 18, endTime: 28, speaker: "Adam Curry", text: "Elena, welcome to the show. Tell us about your work." },
    { startTime: 28, endTime: 45, speaker: "Elena Rodriguez", text: "Thanks for having me. I've been focused on how transcripts can transform podcasts from a purely audio medium into something more like a rich multimedia document." },
    { startTime: 45, endTime: 60, speaker: "Elena Rodriguez", text: "When you combine chapters with images, transcripts with speaker labels, and soundbites for sharing — you get this incredibly rich experience." },
    { startTime: 60, endTime: 75, speaker: "Dave Jones", text: "And the key insight is that these features work together. A chapter gives you the structure, the transcript gives you the text, and you can navigate between them." },
  ],
};

export function getTranscriptByEpisodeId(episodeId: string): TranscriptSegment[] {
  return transcriptsByEpisode[episodeId] || [];
}
