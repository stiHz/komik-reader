#!/usr/bin/env node

/**
 * KomikReader Management CLI
 *
 * Usage:
 *   node scripts/komik.mjs add <slug>
 *   node scripts/komik.mjs chapter <slug> <number> [title]
 *   node scripts/komik.mjs pages <slug> <chapter> <start> <count>
 *   node scripts/komik.mjs list
 *   node scripts/komik.mjs info <slug>
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data", "manga");
const IMAGES_DIR = join(ROOT, "public", "images");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

function log(msg, color = "reset") {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function loadManga(slug) {
  const file = join(DATA_DIR, `${slug}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8"));
}

function saveManga(manga) {
  const file = join(DATA_DIR, `${manga.slug}.json`);
  writeFileSync(file, JSON.stringify(manga, null, 2));
}

function listManga() {
  if (!existsSync(DATA_DIR)) {
    log("❌ Belum ada data komik. Tambahin dulu pake: node scripts/komik.mjs add <slug>", "yellow");
    return;
  }

  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    log("📭 Belum ada komik.", "yellow");
    return;
  }

  log(`\n📚 ${files.length} Komik:\n`, "bold");

  files.forEach((file, i) => {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
    const latestChapter =
      data.chapters.length > 0
        ? `Ch. ${data.chapters.reduce((a, b) => (a.number > b.number ? a : b)).number}`
        : "Belum ada";

    console.log(
      `${COLORS.cyan}${i + 1}.${COLORS.reset} ${COLORS.bold}${data.title}${COLORS.reset}`
    );
    console.log(`   ${COLORS.dim}Slug: ${data.slug} | ${latestChapter} | ${data.status} | ⭐ ${data.rating}${COLORS.reset}`);
    console.log(`   ${COLORS.dim}Genres: ${data.genres.join(", ")}${COLORS.reset}`);
    console.log();
  });
}

function addManga(slug) {
  if (!slug) {
    log("❌ Usage: node scripts/komik.mjs add <slug>", "red");
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  const file = join(DATA_DIR, `${slug}.json`);
  if (existsSync(file)) {
    log(`❌ Komik "${slug}" udah ada!`, "red");
    process.exit(1);
  }

  const template = {
    slug,
    title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    alternativeTitle: "",
    cover: `/images/${slug}/cover.jpg`,
    author: "",
    artist: "",
    status: "ongoing",
    type: "manga",
    synopsis: "",
    genres: [],
    releaseYear: new Date().getFullYear(),
    rating: 0.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [],
  };

  writeFileSync(file, JSON.stringify(template, null, 2));

  // Create image folder
  const imgDir = join(IMAGES_DIR, slug);
  mkdirSync(imgDir, { recursive: true });

  log(`\n✅ Komik baru dibuat: ${slug}`, "green");
  log(`\n📁 File: data/manga/${slug}.json`, "dim");
  log(`📁 Folder gambar: public/images/${slug}/`, "dim");
  log(`\n🔧 Langkah selanjutnya:`, "cyan");
  log(`   1. Edit file JSON-nya (judul, author, sinopsis, genre)`, "dim");
  log(`   2. Taruh cover.jpg di public/images/${slug}/`, "dim");
  log(`   3. Tambah chapter: node scripts/komik.mjs chapter ${slug} 1 "Judul Chapter"`, "dim");
  log(`   4. Taruh gambar halaman: node scripts/komik.mjs pages ${slug} 1 <start> <count>`, "dim");
  log("");
}

function addChapter(slug, chNum, title) {
  if (!slug || !chNum) {
    log("❌ Usage: node scripts/komik.mjs chapter <slug> <number> [title]", "red");
    process.exit(1);
  }

  const manga = loadManga(slug);
  if (!manga) {
    log(`❌ Komik "${slug}" gak ditemukan!`, "red");
    process.exit(1);
  }

  const num = parseInt(chNum);
  if (manga.chapters.find((c) => c.number === num)) {
    log(`❌ Chapter ${num} udah ada!`, "red");
    process.exit(1);
  }

  const chapter = {
    number: num,
    title: title || `Chapter ${num}`,
    releaseDate: new Date().toISOString(),
    pages: [],
  };

  manga.chapters.push(chapter);
  manga.updatedAt = new Date().toISOString();

  // Hilangkan duplikat & sort
  manga.chapters.sort((a, b) => a.number - b.number);

  saveManga(manga);

  // Create image folder
  const chDir = join(IMAGES_DIR, slug, `ch${num}`);
  mkdirSync(chDir, { recursive: true });

  log(`\n✅ Chapter ${num} ditambahkan ke "${manga.title}"`, "green");
  log(`📁 Folder gambar: public/images/${slug}/ch${num}/`, "dim");
  log(`\n📝 Taruh gambar halaman di folder itu dengan format:`, "cyan");
  log(`   01.jpg, 02.jpg, 03.jpg ... (atau .png)`, "dim");
  log(`\n💡 Atau pakai script otomatis:`, "cyan");
  log(`   node scripts/komik.mjs pages ${slug} ${num} 1 <jumlah-halaman>`, "dim");
  log("");
}

function addPages(slug, chNum, start, count) {
  if (!slug || !chNum || !start || !count) {
    log("❌ Usage: node scripts/komik.mjs pages <slug> <chapter> <start> <count>", "red");
    process.exit(1);
  }

  const manga = loadManga(slug);
  if (!manga) {
    log(`❌ Komik "${slug}" gak ditemukan!`, "red");
    process.exit(1);
  }

  const chapter = manga.chapters.find((c) => c.number === parseInt(chNum));
  if (!chapter) {
    log(`❌ Chapter ${chNum} gak ditemukan!`, "red");
    process.exit(1);
  }

  const startNum = parseInt(start);
  const total = parseInt(count);
  const imgDir = join(IMAGES_DIR, slug, `ch${chNum}`);

  // Auto-detect existing images
  let added = 0;
  for (let i = 0; i < total; i++) {
    const pageNum = startNum + i;
    const pageFile = `${String(pageNum).padStart(2, "0")}.jpg`;
    const pageFilePng = `${String(pageNum).padStart(2, "0")}.png`;
    const fullPath = join(imgDir, pageFile);
    const fullPathPng = join(imgDir, pageFilePng);

    let actualFile = null;
    if (existsSync(fullPath)) actualFile = pageFile;
    else if (existsSync(fullPathPng)) actualFile = pageFilePng;

    if (actualFile) {
      chapter.pages.push(`/images/${slug}/ch${chNum}/${actualFile}`);
      added++;
    }
  }

  saveManga(manga);

  log(`\n✅ ${added} halaman ditambahkan ke Chapter ${chNum}`, "green");
  log(`📂 ${imgDir}/`, "dim");
  log(`📝 ${chapter.pages.length} total halaman sekarang`, "dim");

  if (added < total) {
    log(`\n⚠️ ${total - added} file gambar belum ada. Taruh dulu gambarnya!`, "yellow");
    log(`   Format nama: 01.jpg, 02.jpg, 03.jpg ...`, "dim");
  }
  log("");
}

function infoManga(slug) {
  if (!slug) {
    log("❌ Usage: node scripts/komik.mjs info <slug>", "red");
    process.exit(1);
  }

  const manga = loadManga(slug);
  if (!manga) {
    log(`❌ Komik "${slug}" gak ditemukan!`, "red");
    process.exit(1);
  }

  log(`\n📘 ${manga.title}`, "bold");
  if (manga.alternativeTitle) log(`   ${manga.alternativeTitle}`, "dim");
  log(`\n📝 Info:`, "cyan");
  log(`   Author: ${manga.author || "-"}`, "dim");
  log(`   Status: ${manga.status} | Type: ${manga.type}`, "dim");
  log(`   Rating: ⭐ ${manga.rating}`, "dim");
  log(`   Genres: ${manga.genres.join(", ") || "-"}`, "dim");
  log(`   Year: ${manga.releaseYear}`, "dim");
  log(`\n📖 Sinopsis:`, "cyan");
  log(`   ${manga.synopsis || "(belum diisi)"}`, "dim");
  log(`\n📑 Chapters (${manga.chapters.length}):`, "cyan");

  if (manga.chapters.length === 0) {
    log(`   Belum ada chapter`, "dim");
  } else {
    manga.chapters
      .sort((a, b) => b.number - a.number)
      .forEach((ch) => {
        const pageCount = ch.pages.length;
        log(`   Ch. ${ch.number} - ${ch.title} (${pageCount} halaman)`, "dim");
      });
  }
  log("");
}

// ============ MAIN ============
const [,, command, ...args] = process.argv;

switch (command) {
  case "list":
    listManga();
    break;
  case "add":
    addManga(args[0]);
    break;
  case "chapter":
    addChapter(args[0], args[1], args.slice(2).join(" "));
    break;
  case "pages":
    addPages(args[0], args[1], args[2], args[3]);
    break;
  case "info":
    infoManga(args[0]);
    break;
  default:
    console.log(`
${COLORS.bold}🐧 KomikReader Management CLI${COLORS.reset}

${COLORS.cyan}Commands:${COLORS.reset}
  ${COLORS.bold}list${COLORS.reset}                        Tampilkan semua komik
  ${COLORS.bold}add <slug>${COLORS.reset}                  Buat komik baru
  ${COLORS.bold}chapter <slug> <num> [title]${COLORS.reset} Tambah chapter baru
  ${COLORS.bold}pages <slug> <ch> <start> <n>${COLORS.reset} Auto-detect halaman dari folder
  ${COLORS.bold}info <slug>${COLORS.reset}                 Lihat detail komik

${COLORS.cyan}Contoh:${COLORS.reset}
  ${COLORS.dim}# Buat komik baru${COLORS.reset}
  node scripts/komik.mjs add naruto-shippuden

  ${COLORS.dim}# Tambah chapter 1${COLORS.reset}
  node scripts/komik.mjs chapter naruto-shippuden 1 "Kembalinya Naruto"

  ${COLORS.dim}# Taruh gambar di public/images/naruto-shippuden/ch1/${COLORS.reset}
  ${COLORS.dim}# lalu auto-register halaman:${COLORS.reset}
  node scripts/komik.mjs pages naruto-shippuden 1 1 20

  ${COLORS.dim}# Cek info${COLORS.reset}
  node scripts/komik.mjs info naruto-shippuden
`);
}
