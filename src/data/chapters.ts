import { Chapter } from "@/lib/types";

export const chaptersByEpisode: Record<string, Chapter[]> = {
  ep1: [
    { startTime: 0, title: "Intro & Overview", img: "https://picsum.photos/seed/ch1/200/200" },
    { startTime: 300, title: "Namespace Growth in 2025", img: "https://picsum.photos/seed/ch2/200/200" },
    { startTime: 900, title: "App Ecosystem Update", img: "https://picsum.photos/seed/ch3/200/200" },
    { startTime: 1500, title: "Value-for-Value Adoption Stats", img: "https://picsum.photos/seed/ch4/200/200", url: "https://podcastindex.org/stats" },
    { startTime: 2400, title: "New Features Demo", img: "https://picsum.photos/seed/ch5/200/200" },
    { startTime: 3300, title: "Listener Boostagrams", img: "https://picsum.photos/seed/ch6/200/200" },
    { startTime: 3900, title: "Wrap Up & Plugs", img: "https://picsum.photos/seed/ch7/200/200" },
  ],
  ep2: [
    { startTime: 0, title: "Introduction" },
    { startTime: 180, title: "Why Chapters Matter", img: "https://picsum.photos/seed/ch8/200/200" },
    { startTime: 720, title: "Transcript Implementations", img: "https://picsum.photos/seed/ch9/200/200" },
    { startTime: 1200, title: "Guest: Elena on the Reading Experience" },
    { startTime: 2100, title: "App Comparison Demo", img: "https://picsum.photos/seed/ch10/200/200" },
    { startTime: 3000, title: "Future of the Reading Layer" },
    { startTime: 3400, title: "Closing Thoughts" },
  ],
  ep3: [
    { startTime: 0, title: "Welcome" },
    { startTime: 120, title: "Lightning Network Basics" },
    { startTime: 600, title: "Boostagram Economy Stats", img: "https://picsum.photos/seed/ch11/200/200" },
    { startTime: 1200, title: "App Integration Showcase" },
    { startTime: 2100, title: "Podcaster Earnings Reports", img: "https://picsum.photos/seed/ch12/200/200" },
    { startTime: 3000, title: "Value Time Splits Explained" },
    { startTime: 3600, title: "Boostagrams of the Week" },
  ],
  ep7: [
    { startTime: 0, title: "Introduction", img: "https://picsum.photos/seed/ch13/200/200" },
    { startTime: 240, title: "What Are AI Agents?" },
    { startTime: 720, title: "Coding Assistants Deep Dive" },
    { startTime: 1500, title: "Guest Interview: Aisha Patel" },
    { startTime: 2100, title: "Real vs. Hype" },
    { startTime: 2700, title: "Predictions for 2026" },
  ],
  ep37: [
    { startTime: 0, title: "Setting the Scene", img: "https://picsum.photos/seed/ch14/200/200" },
    { startTime: 360, title: "The Library at Its Peak" },
    { startTime: 900, title: "The Myth of the Great Fire" },
    { startTime: 1800, title: "What Really Happened" },
    { startTime: 2700, title: "What Was Lost" },
    { startTime: 3300, title: "Legacy and Lessons" },
  ],
};

export function getChaptersByEpisodeId(episodeId: string): Chapter[] {
  return chaptersByEpisode[episodeId] || [];
}
