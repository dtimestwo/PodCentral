import Link from "next/link";
import {
  CpuIcon,
  LaughIcon,
  NewspaperIcon,
  FlaskConicalIcon,
  BriefcaseIcon,
  MusicIcon,
  HeartIcon,
  GraduationCapIcon,
  GlobeIcon,
  TrophyIcon,
  SearchIcon,
  BookOpenIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu: CpuIcon,
  Laugh: LaughIcon,
  Newspaper: NewspaperIcon,
  FlaskConical: FlaskConicalIcon,
  Briefcase: BriefcaseIcon,
  Music: MusicIcon,
  Heart: HeartIcon,
  GraduationCap: GraduationCapIcon,
  Globe: GlobeIcon,
  Trophy: TrophyIcon,
  Search: SearchIcon,
  BookOpen: BookOpenIcon,
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Browse Categories</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || CpuIcon;
          return (
            <Link key={category.id} href={`/search?category=${category.id}`}>
              <Card className="group cursor-pointer transition-colors hover:bg-accent">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Icon className="size-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <span className="text-center text-sm font-medium">
                    {category.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
