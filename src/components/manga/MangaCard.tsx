import { Manga } from "@/types";
import { cn } from "@/lib/utils";
import { Star, Bookmark } from "lucide-react";
import Link from "next/link";

interface MangaCardProps {
  manga: Manga;
  className?: string;
}

export function MangaCard({ manga, className }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.slug}`} className="group block">
      <div className={cn("space-y-2", className)}>
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          <img
            src={manga.cover}
            alt={manga.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                manga.status === "ongoing"
                  ? "bg-green-500/80 text-white"
                  : manga.status === "completed"
                  ? "bg-blue-500/80 text-white"
                  : "bg-yellow-500/80 text-white"
              )}
            >
              {manga.status === "ongoing" ? "Ongoing" : manga.status === "completed" ? "Tamat" : "Hiatus"}
            </span>
          </div>
          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-background/80 text-foreground">
              {manga.type}
            </span>
          </div>
          {/* Rating */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white">{manga.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Ch. {manga.chapters.length > 0 ? manga.chapters[0].number : "N/A"}
          </p>
        </div>
      </div>
    </Link>
  );
}
