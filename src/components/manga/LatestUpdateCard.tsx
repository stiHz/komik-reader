"use client";

import { Manga, Chapter } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LatestUpdateCardProps {
  manga: Manga;
  latestChapter: Chapter;
  className?: string;
}

export function LatestUpdateCard({ manga, latestChapter, className }: LatestUpdateCardProps) {
  const isRecent =
    new Date().getTime() - new Date(latestChapter.releaseDate).getTime() < 24 * 60 * 60 * 1000; // < 24 jam

  return (
    <Link
      href={`/manga/${manga.slug}/${latestChapter.number}`}
      className={cn("group flex gap-3 p-3 rounded-lg hover:bg-secondary transition-colors", className)}
    >
      {/* Cover Thumbnail (small) */}
      <div className="relative flex-shrink-0 w-14 h-20 overflow-hidden rounded bg-secondary">
        <img
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isRecent && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full m-0.5" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {manga.title}
        </h4>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs font-medium text-primary">
            Ch. {latestChapter.number}
          </span>
          {latestChapter.title && (
            <span className="text-xs text-muted-foreground truncate">
              - {latestChapter.title}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          {timeAgo(latestChapter.releaseDate)}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
