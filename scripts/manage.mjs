#!/usr/bin/env node

/**
 * Data Management Script for KomikReader
 * 
 * Usage:
 *   node scripts/manage.mjs list              - List all manga
 *   node scripts/manage.mjs add <slug>        - Create new manga template
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "manga");

function listManga() {
  if (!existsSync(DATA_DIR)) {
    console.log("No data directory yet. Add manga JSON files to data/manga/");
    return;
  }
  
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  
  if (files.length === 0) {
    console.log("No manga found. Add JSON files to data/manga/");
    return;
  }

  console.log(`\n📚 ${files.length} manga found:\n`);
  
  files.forEach(file => {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
    console.log(`  📘 ${data.title}`);
    console.log(`     Slug: ${data.slug}`);
    console.log(`     Status: ${data.status} | Type: ${data.type}`);
    console.log(`     Chapters: ${data.chapters.length} | Rating: ${data.rating}`);
    console.log();
  });
}

function createTemplate(slug) {
  if (!slug) {
    console.error("Usage: node scripts/manage.mjs add <slug>");
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const filePath = join(DATA_DIR, `${slug}.json`);
  
  if (existsSync(filePath)) {
    console.error(`❌ Manga "${slug}" already exists!`);
    process.exit(1);
  }

  const template = {
    slug: slug,
    title: "New Manga Title",
    alternativeTitle: "",
    cover: "https://picsum.photos/seed/manga-cover/400/560",
    author: "Author Name",
    artist: "",
    status: "ongoing",
    type: "manga",
    synopsis: "Write your synopsis here...",
    genres: ["Action", "Adventure"],
    releaseYear: 2026,
    rating: 0.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        number: 1,
        title: "Chapter 1",
        releaseDate: new Date().toISOString(),
        pages: [
          "https://picsum.photos/seed/page1/800/1200",
          "https://picsum.photos/seed/page2/800/1200",
        ],
      },
    ],
  };

  writeFileSync(filePath, JSON.stringify(template, null, 2));
  console.log(`✅ Template created: data/manga/${slug}.json`);
  console.log("Edit the file to add your manga details!");
}

// Main
const [,, command, ...args] = process.argv;

switch (command) {
  case "list":
    listManga();
    break;
  case "add":
    createTemplate(args[0]);
    break;
  default:
    console.log("KomikReader Data Management\n");
    console.log("Usage:");
    console.log("  node scripts/manage.mjs list           - List all manga");
    console.log("  node scripts/manage.mjs add <slug>     - Create new manga template");
}
