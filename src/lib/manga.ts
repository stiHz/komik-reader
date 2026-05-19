import { Manga, SearchFilters, Chapter } from "@/types";

// In production, this would be a database.
// For now, we use a simple JSON store loaded from data files.

let mangaCache: Manga[] | null = null;

export function getAllManga(): Manga[] {
  if (mangaCache) return mangaCache;

  // Try to load from data files
  try {
    const fs = require("fs");
    const path = require("path");
    const dataDir = path.join(process.cwd(), "data", "manga");
    const files = fs.readdirSync(dataDir).filter((f: string) => f.endsWith(".json"));

    const loaded: Manga[] = files.map((file: string) => {
      const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
      return JSON.parse(content) as Manga;
    });

    mangaCache = loaded;
    return loaded;
  } catch {
    // Return empty array if data doesn't exist yet
    return [];
  }
}

export function getMangaBySlug(slug: string): Manga | undefined {
  return getAllManga().find((m) => m.slug === slug);
}

export function getChapter(mangaSlug: string, chapterNumber: number): Chapter | undefined {
  const manga = getMangaBySlug(mangaSlug);
  if (!manga) return undefined;
  return manga.chapters.find((c) => c.number === chapterNumber);
}

export function searchManga(filters: SearchFilters): Manga[] {
  let results = getAllManga();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.alternativeTitle && m.alternativeTitle.toLowerCase().includes(q)) ||
        m.author.toLowerCase().includes(q)
    );
  }

  if (filters.genre) {
    results = results.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === filters.genre!.toLowerCase())
    );
  }

  if (filters.status) {
    results = results.filter((m) => m.status === filters.status);
  }

  if (filters.type) {
    results = results.filter((m) => m.type === filters.type);
  }

  // Sorting
  switch (filters.sort) {
    case "popular":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "title":
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "latest":
    default:
      results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
  }

  return results;
}

export function getLatestManga(limit: number = 12): Manga[] {
  return getAllManga()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function getPopularManga(limit: number = 12): Manga[] {
  return getAllManga()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getAllGenres(): string[] {
  const genres = new Set<string>();
  getAllManga().forEach((m) => m.genres.forEach((g) => genres.add(g)));
  return Array.from(genres).sort();
}

export interface LatestUpdate {
  manga: Manga;
  chapter: Chapter;
}

/**
 * Get manga sorted by their latest chapter release date.
 * Shows which comics just got new chapters - like shinigami's "recently updated" section.
 */
export function getLatestUpdates(limit: number = 20): LatestUpdate[] {
  const allManga = getAllManga();

  const updates: LatestUpdate[] = [];

  for (const manga of allManga) {
    if (manga.chapters.length === 0) continue;

    // Find the newest chapter
    const latestChapter = manga.chapters.reduce((latest, ch) => {
      return new Date(ch.releaseDate).getTime() > new Date(latest.releaseDate).getTime() ? ch : latest;
    });

    updates.push({ manga, chapter: latestChapter });
  }

  // Sort by latest chapter release date (newest first)
  updates.sort(
    (a, b) =>
      new Date(b.chapter.releaseDate).getTime() -
      new Date(a.chapter.releaseDate).getTime()
  );

  return updates.slice(0, limit);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}
