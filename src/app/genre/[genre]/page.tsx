import { searchManga } from "@/lib/manga";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { genre: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Genre: ${decodeURIComponent(params.genre)}`,
  };
}

export default function GenrePage({ params }: PageProps) {
  const genre = decodeURIComponent(params.genre);
  const manga = searchManga({ genre });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold capitalize">Genre: {genre}</h1>
      <p className="text-muted-foreground">
        {manga.length} komik ditemukan
      </p>
      <MangaGrid manga={manga} emptyMessage={`Tidak ada komik dengan genre "${genre}".`} />
    </div>
  );
}
