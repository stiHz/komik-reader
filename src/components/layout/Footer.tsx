import { BookOpen, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>KomikDer</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/genre" className="hover:text-foreground">Genre</Link>
            <Link href="/" className="hover:text-foreground">Beranda</Link>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {new Date().getFullYear()} KomikDer — Made with <Heart className="w-3 h-3 text-primary fill-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}
