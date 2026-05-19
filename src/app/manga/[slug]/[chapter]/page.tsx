import { ReaderView } from "@/components/reader/ReaderView";
import { getChapter, getMangaBySlug } from "@/lib/manga";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string; chapter: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const manga = getMangaBySlug(params.slug);
  const chNum = parseInt(params.chapter);
  const chapter = getChapter(params.slug, chNum);
  if (!manga || !chapter) return { title: "Chapter Tidak Ditemukan" };
  return {
    title: `Chapter ${chapter.number} - ${manga.title}`,
  };
}

export default function ChapterPage({ params }: PageProps) {
  const manga = getMangaBySlug(params.slug);
  const chNum = parseInt(params.chapter);
  const chapter = getChapter(params.slug, chNum);

  if (!manga || !chapter) {
    notFound();
  }

  return (
    <ReaderView
      chapter={chapter}
      mangaSlug={manga.slug}
      totalChapters={manga.chapters.length}
      mangaTitle={manga.title}
      mangaCover={manga.cover}
    />
  );
}
