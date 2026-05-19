"use client";

import { Chapter } from "@/types";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  List,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReaderViewProps {
  chapter: Chapter;
  mangaSlug: string;
  totalChapters: number;
}

type ReadMode = "scroll" | "single";

export function ReaderView({ chapter, mangaSlug, totalChapters }: ReaderViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [readMode, setReadMode] = useState<ReadMode>("scroll");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const prevChapter = chapter.number > 1 ? chapter.number - 1 : null;
  const nextChapter = chapter.number < totalChapters ? chapter.number + 1 : null;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (readMode === "single") {
        if (e.key === "ArrowRight" || e.key === "d") {
          setCurrentPage((p) => Math.min(p + 1, chapter.pages.length - 1));
        } else if (e.key === "ArrowLeft" || e.key === "a") {
          setCurrentPage((p) => Math.max(p - 1, 0));
        }
      } else {
        if (e.key === "ArrowRight" || e.key === "d") {
          window.scrollBy({ top: 300, behavior: "smooth" });
        } else if (e.key === "ArrowLeft" || e.key === "a") {
          window.scrollBy({ top: -300, behavior: "smooth" });
        }
      }
    },
    [readMode, chapter.pages.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between h-12 px-4">
          {/* Left: Back + Chapter info */}
          <div className="flex items-center gap-3">
            <Link
              href={`/manga/${mangaSlug}`}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-sm font-medium">
                Chapter {chapter.number}
                {chapter.title && <span className="text-gray-400"> - {chapter.title}</span>}
              </p>
            </div>
          </div>

          {/* Right: Navigation + Settings */}
          <div className="flex items-center gap-1">
            {/* Page counter (single mode) */}
            {readMode === "single" && (
              <span className="text-xs text-gray-400 mr-2">
                {currentPage + 1} / {chapter.pages.length}
              </span>
            )}

            {/* Chapter Navigation */}
            <Link
              href={prevChapter ? `/manga/${mangaSlug}/${prevChapter}` : "#"}
              className={cn(
                "p-1.5 rounded hover:bg-white/10 transition-colors",
                !prevChapter && "opacity-30 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Link
              href={nextChapter ? `/manga/${mangaSlug}/${nextChapter}` : "#"}
              className={cn(
                "p-1.5 rounded hover:bg-white/10 transition-colors",
                !nextChapter && "opacity-30 pointer-events-none"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>

            {/* Settings Toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors ml-2"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="border-t border-white/10 py-3 px-4 bg-black/95">
            <div className="container mx-auto flex items-center gap-6">
              <span className="text-sm text-gray-400">Mode Baca:</span>
              <button
                onClick={() => setReadMode("scroll")}
                className={cn(
                  "px-4 py-1.5 rounded text-sm transition-colors",
                  readMode === "scroll"
                    ? "bg-primary text-white"
                    : "bg-white/10 hover:bg-white/20"
                )}
              >
                Scroll Panjang
              </button>
              <button
                onClick={() => setReadMode("single")}
                className={cn(
                  "px-4 py-1.5 rounded text-sm transition-colors",
                  readMode === "single"
                    ? "bg-primary text-white"
                    : "bg-white/10 hover:bg-white/20"
                )}
              >
                Per Halaman
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reader Content */}
      <div className="flex justify-center">
        {readMode === "scroll" ? (
          /* Scroll Mode - Show all pages */
          <div className="w-full max-w-3xl">
            {chapter.pages.map((page, i) => (
              <img
                key={i}
                src={page}
                alt={`Page ${i + 1}`}
                className="w-full h-auto"
                loading={i < 3 ? "eager" : "lazy"}
                data-protected
              />
            ))}
          </div>
        ) : (
          /* Single Page Mode */
          <div
            className="w-full max-w-3xl cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 3) {
                setCurrentPage((p) => Math.max(p - 1, 0));
              } else if (x > (rect.width * 2) / 3) {
                setCurrentPage((p) => Math.min(p + 1, chapter.pages.length - 1));
              }
            }}
          >
            <img
              src={chapter.pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-auto"
              data-protected
            />
            {/* Click zones hint */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4">
              <span className="text-xs text-white/20">{currentPage > 0 ? "◀" : ""}</span>
              <span className="text-xs text-white/20">
                {currentPage < chapter.pages.length - 1 ? "▶" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-40 bg-black/90 backdrop-blur border-t border-white/10">
        <div className="container mx-auto flex items-center justify-between h-12 px-4">
          <Link
            href={prevChapter ? `/manga/${mangaSlug}/${prevChapter}` : "#"}
            className={cn(
              "flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors",
              !prevChapter && "opacity-30 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Link>

          <Link
            href={`/manga/${mangaSlug}`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <List className="w-4 h-4" />
            Semua Chapter
          </Link>

          <Link
            href={nextChapter ? `/manga/${mangaSlug}/${nextChapter}` : "#"}
            className={cn(
              "flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors",
              !nextChapter && "opacity-30 pointer-events-none"
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
