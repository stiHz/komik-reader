"use client";

import { useEffect, useState } from "react";
import { useReadingHistory, HistoryEntry } from "@/hooks/useReadingHistory";
import Link from "next/link";
import { BookOpen, Clock, Trash2, ChevronRight, BookMarked } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";

export default function RiwayatPage() {
  const { getRecentManga, getHistoryEntries, clearHistory } = useReadingHistory();
  const [recentManga, setRecentManga] = useState<ReturnType<typeof getRecentManga>>([]);
  const [allEntries, setAllEntries] = useState<HistoryEntry[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setRecentManga(getRecentManga());
    setAllEntries(getHistoryEntries());
  }, [getRecentManga, getHistoryEntries]);

  if (recentManga.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <BookMarked className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Belum Ada Riwayat</h1>
          <p className="text-muted-foreground max-w-md">
            Kamu belum membaca komik apapun. Mulai baca dan riwayat bacaanmu akan muncul di sini.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Mulai Baca
          </Link>
        </div>
      </div>
    );
  }

  // Group entries by manga slug
  const groupedEntries: { [slug: string]: HistoryEntry[] } = {};
  allEntries.forEach((entry) => {
    if (!groupedEntries[entry.mangaSlug]) {
      groupedEntries[entry.mangaSlug] = [];
    }
    groupedEntries[entry.mangaSlug].push(entry);
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Baca</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {recentManga.length} komik • {allEntries.length} chapter dibaca
          </p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua
        </button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-500">Yakin hapus semua riwayat baca? Data ini hanya tersimpan di browser kamu.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs rounded hover:bg-secondary transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                clearHistory();
                setShowConfirm(false);
                setRecentManga([]);
                setAllEntries([]);
              }}
              className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      )}

      {/* Manga List */}
      <div className="space-y-4">
        {recentManga.map((manga) => {
          const entries = groupedEntries[manga.slug] || [];
          const recentChapters = entries
            .sort((a, b) => b.chapterNumber - a.chapterNumber)
            .slice(0, 5);

          return (
            <div
              key={manga.slug}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <Link href={`/manga/${manga.slug}`} className="flex gap-4 p-4">
                {/* Cover */}
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="w-16 h-20 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {manga.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terakhir dibaca {timeAgo(new Date(manga.lastRead).toISOString())}
                  </p>
                </div>
              </Link>

              {/* Recent Chapters in this manga */}
              <div className="border-t border-border px-4 py-2 bg-secondary/30">
                <div className="flex flex-wrap gap-1.5">
                  {recentChapters.map((entry) => (
                    <Link
                      key={entry.chapterNumber}
                      href={`/manga/${manga.slug}/${entry.chapterNumber}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      Ch. {entry.chapterNumber}
                    </Link>
                  ))}
                  {entries.length > 5 && (
                    <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
                      +{entries.length - 5} chapter lain
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
