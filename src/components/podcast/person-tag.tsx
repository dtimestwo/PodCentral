import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Person } from "@/lib/types";

export function PersonTag({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-8">
        <AvatarImage src={person.img} alt={person.name} />
        <AvatarFallback>{person.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">{person.name}</span>
        <Badge variant="secondary" className="text-xs capitalize">
          {person.role}
        </Badge>
      </div>
    </div>
  );
}
