"use client";

import { useState, useEffect, useCallback } from "react";

export interface HistoryEntry {
  mangaSlug: string;
  mangaTitle: string;
  mangaCover: string;
  chapterNumber: number;
  chapterTitle: string;
  readAt: number; // timestamp
}

interface HistoryMap {
  [mangaSlug: string]: {
    mangaTitle: string;
    mangaCover: string;
    chapters: {
      [chapterNumber: number]: {
        chapterTitle: string;
        readAt: number;
      };
    };
  };
}

const STORAGE_KEY = "komik-reader-history";

function loadHistory(): HistoryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHistory(history: HistoryMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage full or unavailable
  }
}

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryMap>({});

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Mark chapter as read
  const markAsRead = useCallback(
    (mangaSlug: string, mangaTitle: string, mangaCover: string, chapterNumber: number, chapterTitle: string) => {
      setHistory((prev) => {
        const entry = prev[mangaSlug] || {
          mangaTitle,
          mangaCover,
          chapters: {},
        };
        // Update cover/title if changed
        entry.mangaTitle = mangaTitle;
        entry.mangaCover = mangaCover;
        entry.chapters[chapterNumber] = {
          chapterTitle,
          readAt: Date.now(),
        };
        const updated = { ...prev, [mangaSlug]: entry };
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  // Check if a chapter is read
  const isRead = useCallback(
    (mangaSlug: string, chapterNumber: number): boolean => {
      return !!history[mangaSlug]?.chapters[chapterNumber];
    },
    [history]
  );

  // Get last read chapter for a manga
  const getProgress = useCallback(
    (mangaSlug: string): { chapterNumber: number; chapterTitle: string } | null => {
      const entry = history[mangaSlug];
      if (!entry) return null;
      const chapters = Object.values(entry.chapters);
      if (chapters.length === 0) return null;
      const latest = chapters.reduce((a, b) => (a.readAt > b.readAt ? a : b));
      // Find the chapter number
      const chNum = Object.entries(entry.chapters).find(
        ([_, v]) => v.readAt === latest.readAt
      )?.[0];
      return chNum
        ? { chapterNumber: parseInt(chNum), chapterTitle: latest.chapterTitle }
        : null;
    },
    [history]
  );

  // Get all history entries sorted by most recent
  const getHistoryEntries = useCallback((): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];
    Object.entries(history).forEach(([mangaSlug, entry]) => {
      Object.entries(entry.chapters).forEach(([chNum, ch]) => {
        entries.push({
          mangaSlug,
          mangaTitle: entry.mangaTitle,
          mangaCover: entry.mangaCover,
          chapterNumber: parseInt(chNum),
          chapterTitle: ch.chapterTitle,
          readAt: ch.readAt,
        });
      });
    });
    return entries.sort((a, b) => b.readAt - a.readAt);
  }, [history]);

  // Get unique manga in history sorted by most recent read
  const getRecentManga = useCallback((): { slug: string; title: string; cover: string; lastRead: number }[] => {
    return Object.entries(history)
      .map(([slug, entry]) => {
        const lastRead = Math.max(
          ...Object.values(entry.chapters).map((c) => c.readAt)
        );
        return {
          slug,
          title: entry.mangaTitle,
          cover: entry.mangaCover,
          lastRead,
        };
      })
      .sort((a, b) => b.lastRead - a.lastRead);
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return {
    history,
    markAsRead,
    isRead,
    getProgress,
    getHistoryEntries,
    getRecentManga,
    clearHistory,
  };
}
