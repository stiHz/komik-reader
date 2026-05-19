import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-20 px-4 text-center">
      <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Halaman atau komik yang kamu cari tidak ditemukan.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
