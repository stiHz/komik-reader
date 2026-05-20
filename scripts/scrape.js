#!/usr/bin/env node
/**
 * KomikDer Chapter Scraper
 * Usage: node scripts/scrape.js <chapter-url>
 * 
 * Download chapter images dari website komik (komiku, kiryuu, dll)
 * untuk konsumsi pribadi. Hasil disimpan di folder downloads/.
 * 
 * Contoh: node scripts/scrape.js https://komiku.id/ch/one-piece-1100/
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { load } = require("cheerio");

// ====== CONFIG ======
const DOWNLOAD_DIR = path.join(__dirname, "..", "downloads");
const DELAY_MS = 500; // delay antar download biar gak kena rate limit
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// ====== HELPERS ======
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHTML(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const proto = url.startsWith("https") ? https : http;

    proto
      .get(
        url,
        {
          headers: {
            "User-Agent": USER_AGENT,
            Referer: "https://komiku.id/",
          },
        },
        (response) => {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            file.close();
            fs.unlinkSync(destPath);
            downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
            return;
          }
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(true);
          });
        }
      )
      .on("error", (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ====== KOMIKU SCRAPER ======
async function scrapeKomikuChapter(url) {
  console.log(`📖 Fetching: ${url}`);
  const html = await fetchHTML(url);
  const $ = load(html);

  // Komiku chapter page structure:
  // Images are in <section id="Baca_Komik"> <img src="...">
  const images = [];
  $("#Baca_Komik img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && (src.includes("komiku") || src.includes("cdn"))) {
      images.push(src.trim());
    }
  });

  // Fallback: find all img tags
  if (images.length === 0) {
    $("img").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && (src.startsWith("http") || src.startsWith("//"))) {
        const fullSrc = src.startsWith("//") ? "https:" + src : src;
        if (fullSrc.includes("komik") || fullSrc.includes("cdn") || fullSrc.includes("uploads")) {
          images.push(fullSrc);
        }
      }
    });
  }

  if (images.length === 0) {
    console.log("❌ Tidak ada gambar ditemukan. Coba cek manual URL-nya.");
    return null;
  }

  // Try to get chapter title
  let title = "";
  const pageTitle = $("title").text().trim();
  // Komiku format: "Komik Chapter X - Title"
  const titleMatch = pageTitle.match(/Chapter\s*[\d.]+(?:\s*[-–]\s*(.+))?/i);
  if (titleMatch) {
    title = titleMatch[1] || "";
  }
  if (!title) {
    // Try breadcrumb or heading
    title = $("h1").first().text().trim() || $(".chapter-title, .entry-title").first().text().trim();
  }

  // Try to get chapter number from URL or page
  let chapterNum = 0;
  const numMatch = url.match(/chapter[_-]?(\d+[.\d]*)/i) || url.match(/\/(\d+[.\d]*)\/?$/);
  if (numMatch) {
    chapterNum = parseFloat(numMatch[1]) || 0;
  }

  return { title, chapterNum, images, total: images.length };
}

// Try to get manga info if on manga page
async function scrapeKomikuManga(url) {
  console.log(`📚 Fetching manga: ${url}`);
  const html = await fetchHTML(url);
  const $ = load(html);

  const manga = {
    title: "",
    cover: "",
    synopsis: "",
    author: "",
    genres: [],
    status: "ongoing",
    type: "manga",
    chapters: [],
  };

  // Title
  manga.title = $("h1").first().text().trim() || $("title").text().split("–")[0].trim();

  // Cover
  manga.cover = $(".ims img, .thumb img, img.attachment-").first().attr("src") || "";
  if (manga.cover && manga.cover.startsWith("//")) manga.cover = "https:" + manga.cover;

  // Synopsis
  manga.synopsis = $('p:contains("Sinopsis"), .entry-content p, .desc p, .sinopsis')
    .first()
    .text()
    .trim()
    .replace(/^Sinopsis\s*:?\s*/i, "");

  // Genres
  $(".genre a, .genres a, a[rel='tag']").each((i, el) => {
    const g = $(el).text().trim();
    if (g) manga.genres.push(g);
  });

  // Chapter list
  $(".chapter-list a, .daftar-chapter a, ul.chapter li a, .list-chapter a").each((i, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();
    if (href && text) {
      const numMatch = text.match(/chapter\s*(\d+[.\d]*)/i) || text.match(/Ch\.?\s*(\d+[.\d]*)/i);
      const chNum = numMatch ? parseFloat(numMatch[1]) : 0;
      const chTitle = text.replace(/chapter\s*\d+[.\d]*\s*[-:]*\s*/i, "").trim();
      manga.chapters.push({
        number: chNum,
        title: chTitle || "",
        url: href.startsWith("http") ? href : "https://komiku.id" + (href.startsWith("/") ? "" : "/") + href,
      });
    }
  });

  return manga;
}

// ====== KIRYUU SCRAPER (basic support) ======
async function scrapeKiryuuChapter(url) {
  console.log(`📖 Fetching: ${url}`);
  const html = await fetchHTML(url);
  const $ = load(html);

  const images = [];
  // Kiryuu uses reader area
  $("#readerarea img, .reader-area img, .content img").each((i, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (src && (src.startsWith("http") || src.startsWith("//"))) {
      const fullSrc = src.startsWith("//") ? "https:" + src : src;
      images.push(fullSrc);
    }
  });

  if (images.length === 0) {
    console.log("❌ Tidak ada gambar ditemukan.");
    return null;
  }

  const title = $("title").text().trim();
  const numMatch = url.match(/chapter[_-]?(\d+[.\d]*)/i);
  const chapterNum = numMatch ? parseFloat(numMatch[1]) : 0;

  return { title, chapterNum, images, total: images.length };
}

// ====== MAIN ======
async function main() {
  const args = process.argv.slice(2);
  const url = args[0];

  if (!url) {
    console.log(`
📚 KomikDer Scraper - Download chapter untuk konsumsi pribadi

Usage:
  node scripts/scrape.js <chapter-url>
  node scripts/scrape.js <chapter-url> -o <output-dir>
  node scripts/scrape.js --manga <manga-url>   (scrape manga info)

Contoh:
  node scripts/scrape.js https://komiku.id/ch/one-piece-1100/
  node scripts/scrape.js --manga https://komiku.id/manga/one-piece/

Output disimpan di: downloads/<judul>/chapter-<num>/
    `);
    process.exit(0);
  }

  // --manga flag: scrape manga page for info only
  if (args[0] === "--manga" && args[1]) {
    const mangaUrl = args[1];
    let manga;
    if (mangaUrl.includes("komiku")) {
      manga = await scrapeKomikuManga(mangaUrl);
    } else {
      console.log("❌ Saat ini hanya support komiku.id untuk manga info.");
      process.exit(1);
    }

    console.log(`\n📋 Manga Info:`);
    console.log(`   Title: ${manga.title}`);
    console.log(`   Cover: ${manga.cover}`);
    console.log(`   Genres: ${manga.genres.join(", ")}`);
    console.log(`   Sinopsis: ${manga.synopsis.slice(0, 100)}...`);
    console.log(`   Chapters: ${manga.chapters.length}`);

    // Save manga info
    const slug = slugify(manga.title);
    const jsonPath = path.join(DOWNLOAD_DIR, `${slug}.json`);
    ensureDir(DOWNLOAD_DIR);
    fs.writeFileSync(jsonPath, JSON.stringify(manga, null, 2));
    console.log(`\n✅ Manga info saved: ${jsonPath}`);

    if (manga.chapters.length > 0) {
      console.log(`\n📑 Chapters:`);
      manga.chapters.slice(0, 10).forEach((ch) => {
        console.log(`   Ch. ${ch.number}: ${ch.title || "(no title)"}`);
      });
      if (manga.chapters.length > 10) {
        console.log(`   ... dan ${manga.chapters.length - 10} chapter lainnya`);
      }
    }
    process.exit(0);
  }

  // Scrape chapter
  let chapterData;
  if (url.includes("komiku")) {
    chapterData = await scrapeKomikuChapter(url);
  } else if (url.includes("kiryuu")) {
    chapterData = await scrapeKiryuuChapter(url);
  } else {
    console.log("🌐 Website belum didukung. Coba komiku.id atau kiryuu.co.");
    console.log("Atau edit fungsi scrapeCustomChapter() untuk website lain.");
    process.exit(1);
  }

  if (!chapterData) {
    process.exit(1);
  }

  console.log(`\n📄 Chapter ${chapterData.chapterNum}${chapterData.title ? ` - ${chapterData.title}` : ""}`);
  console.log(`🖼️  ${chapterData.total} halaman ditemukan`);

  // Create output dir
  const outputDirArg = args.indexOf("-o") >= 0 ? args[args.indexOf("-o") + 1] : null;
  const baseDir = outputDirArg || path.join(DOWNLOAD_DIR, `chapter-${chapterData.chapterNum}`);
  ensureDir(baseDir);

  console.log(`\n📥 Downloading ke: ${baseDir}\n`);

  // Download images
  let success = 0;
  for (let i = 0; i < chapterData.images.length; i++) {
    const imgUrl = chapterData.images[i];
    const ext = path.extname(new URL(imgUrl).pathname) || ".jpg";
    const filename = `${String(i + 1).padStart(3, "0")}${ext}`;
    const destPath = path.join(baseDir, filename);

    process.stdout.write(`   [${i + 1}/${chapterData.total}] Downloading... `);
    try {
      await downloadFile(imgUrl, destPath);
      console.log(`✅ ${filename}`);
      success++;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }

    if (i < chapterData.images.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ Selesai! ${success}/${chapterData.total} halaman berhasil di-download.`);
  console.log(`📁 Lokasi: ${baseDir}`);
  console.log(`\nUntuk upload ke KomikDer:`);
  console.log(`   1. Upload gambar ke Cloudinary lewat admin panel`);
  console.log(`   2. Atau host di tempat lain & pakai URL`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
