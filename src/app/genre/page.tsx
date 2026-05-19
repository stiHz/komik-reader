import { getAllGenres } from "@/lib/manga";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genre",
};

export default function GenreListPage() {
  const genres = getAllGenres();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Daftar Genre</h1>

      {genres.length === 0 ? (
        <p className="text-muted-foreground">Belum ada genre tersedia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-secondary transition-all text-center"
            >
              <span className="font-medium">{genre}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
