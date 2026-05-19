"use client";

import { Chapter } from "@/types";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";
import Link from "next/link";

interface ChapterListProps {
  chapters: Chapter[];
  mangaSlug: string;
}

export function ChapterList({ chapters, mangaSlug }: ChapterListProps) {
  const sorted = [...chapters].sort((a, b) => b.number - a.number);

  return (
    <div className="space-y-1">
      {sorted.map((chapter, i) => (
        <Link
          key={chapter.number}
          href={`/manga/${mangaSlug}/${chapter.number}`}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group",
            i === 0 && "bg-primary/10 hover:bg-primary/20"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
              Chapter {chapter.number}
              {chapter.title && <span className="text-muted-foreground"> - {chapter.title}</span>}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(chapter.releaseDate)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary">
            <Eye className="w-4 h-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}
