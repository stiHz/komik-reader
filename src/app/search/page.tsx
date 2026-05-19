import { searchManga, getAllManga } from "@/lib/manga";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { Search } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return {
    title: searchParams.q ? `Cari: ${searchParams.q}` : "Cari Komik",
  };
}

export default function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || "";

  let results;
  if (query) {
    results = searchManga({ query });
  } else {
    results = getAllManga();
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6" />
          {query ? `Hasil pencarian: "${query}"` : "Semua Komik"}
        </h1>
        {query && (
          <p className="text-muted-foreground mt-1">
            Ditemukan {results.length} komik
          </p>
        )}
      </div>

      <MangaGrid
        manga={results}
        emptyMessage={query ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain!` : "Belum ada komik."}
      />
    </div>
  );
}
