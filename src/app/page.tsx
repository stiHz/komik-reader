import Link from "next/link";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { LatestUpdateCard } from "@/components/manga/LatestUpdateCard";
import { getLatestManga, getPopularManga, getLatestUpdates, getAllGenres } from "@/lib/manga";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Flame, Clock, Sparkles } from "lucide-react";

interface PageProps {
  searchParams: { tab?: string; q?: string };
}

export default function HomePage({ searchParams }: PageProps) {
  const tab = searchParams.tab || "latest";
  const latest = getLatestManga(24);
  const popular = getPopularManga(24);
  const recentUpdates = getLatestUpdates(12); // 🔥 SHINIGAMI-STYLE: Recently updated chapters
  const genres = getAllGenres();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* 🔥 LATEST CHAPTER UPDATES - Shinigami Style */}
      {recentUpdates.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Chapter Terbaru
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {recentUpdates.map((update) => (
              <LatestUpdateCard
                key={`${update.manga.slug}-${update.chapter.number}`}
                manga={update.manga}
                latestChapter={update.chapter}
              />
            ))}
          </div>
        </section>
      )}

      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 md:p-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            KomikDer 🐧
          </h1>
          <p className="mt-3 text-muted-foreground">
            Baca komik terbaru favoritmu secara online. Update setiap hari dengan koleksi lengkap manga, manhwa, dan manhua.
          </p>
        </div>
      </div>

      {/* Tabs: Latest / Popular */}
      <Tabs defaultValue={tab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="latest" asChild>
              <Link href="/?tab=latest" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Terbaru
              </Link>
            </TabsTrigger>
            <TabsTrigger value="popular" asChild>
              <Link href="/?tab=popular" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Populer
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="latest" className="mt-6">
          <MangaGrid manga={latest} emptyMessage="Belum ada komik. Upload data komik dulu ya!" />
        </TabsContent>
        <TabsContent value="popular" className="mt-6">
          <MangaGrid manga={popular} emptyMessage="Belum ada komik. Upload data komik dulu ya!" />
        </TabsContent>
      </Tabs>

      {/* Genres Section */}
      {genres.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Genre Populer</h2>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 15).map((genre) => (
              <Link
                key={genre}
                href={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
              >
                {genre}
              </Link>
            ))}
            {genres.length > 15 && (
              <Link
                href="/genre"
                className="px-4 py-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
              >
                +{genres.length - 15} lainnya
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
