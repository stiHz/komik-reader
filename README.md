# KomikReader 🐧

Platform baca komik online — dibangun dengan Next.js + Tailwind CSS.

## Fitur

- 📚 Library komik dengan grid layout
- 🔍 Pencarian & filter genre
- 📖 Reader dengan 2 mode: Scroll Panjang & Per Halaman
- ⌨️ Navigasi keyboard (Arrow Keys / A-D)
- 🌙 Dark mode default
- 📱 Responsive mobile-first
- 🏷️ Genre, status, rating, metadata lengkap
- ⚡ SSR untuk SEO

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + Lucide Icons
- **Data:** JSON file-based (tanpa database, gampang deploy)
- **Language:** TypeScript

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Buka http://localhost:3000

## Menambah Komik

Bikin file JSON baru di `data/manga/` dengan format:

```json
{
  "slug": "nama-komik",
  "title": "Judul Komik",
  "cover": "https://url-gambar-cover.jpg",
  "author": "Nama Author",
  "status": "ongoing",
  "type": "manga",
  "synopsis": "Sinopsis komik...",
  "genres": ["Action", "Fantasy"],
  "releaseYear": 2024,
  "rating": 4.5,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-05-19T00:00:00Z",
  "chapters": [
    {
      "number": 1,
      "title": "Judul Chapter",
      "releaseDate": "2024-01-01T00:00:00Z",
      "pages": [
        "https://url-gambar-halaman-1.jpg",
        "https://url-gambar-halaman-2.jpg"
      ]
    }
  ]
}
```

### Menyimpan Gambar Lokal

Taruh gambar di `public/images/` lalu referensikan dengan path relatif:

```json
"pages": [
  "/images/komik1/ch1/p1.jpg",
  "/images/komik1/ch1/p2.jpg"
]
```

## ⚠️ Disclaimer

Platform ini hanya untuk konten yang LEGAL dan memiliki izin. Upload komik bajakan = risiko hukum.

## License

MIT
