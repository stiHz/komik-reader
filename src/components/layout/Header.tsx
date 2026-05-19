"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, BookOpen, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
          <BookOpen className="w-6 h-6 text-primary" />
          <span>KomikReader</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-primary transition-colors">
            Beranda
          </Link>
          <Link href="/?tab=latest" className="text-sm hover:text-primary transition-colors">
            Terbaru
          </Link>
          <Link href="/?tab=popular" className="text-sm hover:text-primary transition-colors">
            Populer
          </Link>
          <Link href="/genre" className="text-sm hover:text-primary transition-colors">
            Genre
          </Link>
          <Link href="/riwayat" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
            <History className="w-3.5 h-3.5" />
            Riwayat
          </Link>
        </nav>

        {/* Desktop Search */}
        <div className="hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari komik..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background transition-all overflow-hidden",
          searchOpen ? "h-14 opacity-100" : "h-0 opacity-0"
        )}
      >
        <form onSubmit={handleSearch} className="container mx-auto px-4 py-2">
          <input
            type="text"
            placeholder="Cari komik..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 px-4 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background transition-all overflow-hidden",
          menuOpen ? "h-40 opacity-100" : "h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col gap-3">
          <Link href="/" className="text-sm hover:text-primary py-1" onClick={() => setMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/?tab=latest" className="text-sm hover:text-primary py-1" onClick={() => setMenuOpen(false)}>
            Terbaru
          </Link>
          <Link href="/?tab=popular" className="text-sm hover:text-primary py-1" onClick={() => setMenuOpen(false)}>
            Populer
          </Link>
          <Link href="/genre" className="text-sm hover:text-primary py-1" onClick={() => setMenuOpen(false)}>
            Genre
          </Link>
          <Link href="/riwayat" className="text-sm hover:text-primary py-1 flex items-center gap-1" onClick={() => setMenuOpen(false)}>
            <History className="w-3.5 h-3.5" />
            Riwayat
          </Link>
        </nav>
      </div>
    </header>
  );
}
