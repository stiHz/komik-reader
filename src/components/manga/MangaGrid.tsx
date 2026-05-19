import { Manga } from "@/types";
import { MangaCard } from "./MangaCard";

interface MangaGridProps {
  manga: Manga[];
  emptyMessage?: string;
}

export function MangaGrid({ manga, emptyMessage = "Tidak ada komik ditemukan." }: MangaGridProps) {
  if (manga.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {manga.map((m) => (
        <MangaCard key={m.slug} manga={m} />
      ))}
    </div>
  );
}
