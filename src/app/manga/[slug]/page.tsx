import { getMangaBySlug } from "@/lib/manga";
import { notFound } from "next/navigation";
import { ChapterList } from "@/components/manga/ChapterList";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { searchManga } from "@/lib/manga";
import { Star, BookOpen, Calendar, User, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const manga = getMangaBySlug(params.slug);
  if (!manga) return { title: "Tidak Ditemukan" };
  return {
    title: `${manga.title}`,
    description: manga.synopsis.slice(0, 160),
  };
}

export default function MangaDetailPage({ params }: PageProps) {
  const manga = getMangaBySlug(params.slug);

  if (!manga) {
    notFound();
  }

  // Get related manga by same author or genres
  const related = searchManga({})
    .filter((m) => m.slug !== manga.slug)
    .filter((m) => m.genres.some((g) => manga.genres.includes(g)))
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover Image */}
        <div className="flex-shrink-0">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-48 md:w-56 rounded-lg shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{manga.title}</h1>
            {manga.alternativeTitle && (
              <p className="text-muted-foreground text-sm mt-1">{manga.alternativeTitle}</p>
            )}
          </div>

          {/* Status & Type */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              {manga.status === "ongoing" ? "Ongoing" : manga.status === "completed" ? "Tamat" : "Hiatus"}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
              {manga.type.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
              <Star className="w-3.5 h-3.5 fill-yellow-500" />
              {manga.rating.toFixed(1)}
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {manga.genres.map((genre) => (
              <Link
                key={genre}
                href={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                className="px-2.5 py-0.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-xs transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {manga.author}{manga.artist ? ` / ${manga.artist}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {manga.releaseYear}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(manga.updatedAt)}
            </span>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="font-medium mb-2">Sinopsis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{manga.synopsis}</p>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daftar Chapter</h2>
          <span className="text-sm text-muted-foreground">{manga.chapters.length} chapter</span>
        </div>
        <ChapterList chapters={manga.chapters} mangaSlug={manga.slug} />
      </section>

      {/* Related Manga */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Mungkin Kamu Suka</h2>
          <MangaGrid manga={related} />
        </section>
      )}
    </div>
  );
}

export function generateStaticParams() {
  // Not needed for our dynamic approach
  return [];
}
