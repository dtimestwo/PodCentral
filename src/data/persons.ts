import { Person } from "@/lib/types";

export const persons: Person[] = [
  {
    id: "p1",
    name: "Adam Curry",
    role: "host",
    img: "https://i.pravatar.cc/150?u=adamcurry",
    href: "https://curry.com",
  },
  {
    id: "p2",
    name: "Dave Jones",
    role: "host",
    img: "https://i.pravatar.cc/150?u=davejones",
    href: "https://podcastindex.org",
  },
  {
    id: "p3",
    name: "Sarah Chen",
    role: "host",
    img: "https://i.pravatar.cc/150?u=sarachen",
  },
  {
    id: "p4",
    name: "Marcus Johnson",
    role: "host",
    img: "https://i.pravatar.cc/150?u=marcusj",
  },
  {
    id: "p5",
    name: "Elena Rodriguez",
    role: "guest",
    img: "https://i.pravatar.cc/150?u=elenar",
  },
  {
    id: "p6",
    name: "James O'Brien",
    role: "host",
    img: "https://i.pravatar.cc/150?u=jamesobrien",
  },
  {
    id: "p7",
    name: "Aisha Patel",
    role: "guest",
    img: "https://i.pravatar.cc/150?u=aishap",
  },
  {
    id: "p8",
    name: "Chris Taylor",
    role: "host",
    img: "https://i.pravatar.cc/150?u=christaylor",
  },
  {
    id: "p9",
    name: "Nina Kowalski",
    role: "guest",
    img: "https://i.pravatar.cc/150?u=ninak",
  },
  {
    id: "p10",
    name: "Tom Rivera",
    role: "producer",
    img: "https://i.pravatar.cc/150?u=tomr",
  },
];

export function getPersonById(id: string): Person | undefined {
  return persons.find((p) => p.id === id);
}
