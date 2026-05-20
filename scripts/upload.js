#!/usr/bin/env node
/**
 * KomikDer Cloudinary Uploader
 * Upload folder gambar chapter ke Cloudinary, output URL buat admin panel
 *
 * Usage: node scripts/upload.js <folder-path>
 *
 * Env vars needed:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   (atau set CLOUDINARY_URL)
 *
 * Contoh: node scripts/upload.js downloads/chapter-1/
 */

const fs = require("fs");
const path = require("path");

async function main() {
  const folderPath = process.argv[2];

  if (!folderPath) {
    console.log(`
☁️ KomikDer Uploader - Upload gambar ke Cloudinary

Usage: node scripts/upload.js <folder-path>
       node scripts/upload.js <folder-path> --prefix <manga-slug>

Env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

Contoh: node scripts/upload.js downloads/chapter-1/
        node scripts/upload.js downloads/chapter-1/ --prefix one-piece
    `);
    process.exit(0);
  }

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Folder tidak ditemukan: ${folderPath}`);
    process.exit(1);
  }

  // Check Cloudinary config
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudUrl = process.env.CLOUDINARY_URL;

  if ((!cloudName || !apiKey || !apiSecret) && !cloudUrl) {
    console.log("❌ Cloudinary credentials tidak ditemukan!");
    console.log("   Set env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    console.log("   Atau: export CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name");
    process.exit(1);
  }

  // Load cloudinary
  let cloudinary;
  try {
    cloudinary = require("cloudinary").v2;
    if (cloudUrl) {
      cloudinary.config({ cloudinary_url: cloudUrl });
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  } catch (e) {
    console.log("❌ Package 'cloudinary' belum terinstall. Run: npm install cloudinary");
    process.exit(1);
  }

  // Get prefix from args
  const prefixIdx = process.argv.indexOf("--prefix");
  const prefix = prefixIdx >= 0 ? process.argv[prefixIdx + 1] : path.basename(folderPath);

  // Get image files
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log("❌ Tidak ada gambar (jpg/png/webp) di folder ini.");
    process.exit(1);
  }

  console.log(`☁️ Upload ${files.length} gambar ke Cloudinary...`);
  console.log(`📁 Folder Cloudinary: komikder/${prefix}\n`);

  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(folderPath, file);
    process.stdout.write(`   [${i + 1}/${files.length}] ${file}... `);

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `komikder/${prefix}`,
        resource_type: "image",
      });
      urls.push(result.secure_url);
      console.log("✅");
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  console.log(`\n✅ ${urls.length}/${files.length} berhasil diupload.`);
  console.log(`\n📋 URLs buat admin panel (copy-paste ke field Gambar Chapter):\n`);
  urls.forEach((u) => console.log(u));
  console.log(`\n---`);
  console.log(`Total: ${urls.length} URL`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
