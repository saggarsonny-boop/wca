// scripts/optimize-images.js
// This script scans the /assets directory, converts JPEG/PNG images to WebP format using Sharp,
// and writes the optimized files alongside the originals.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.resolve(__dirname, '..', 'assets');

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;
  const inputPath = path.join(assetsDir, file);
  const outputPath = path.join(assetsDir, path.basename(file, ext) + '.webp');
  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`Optimized ${file} → ${path.basename(outputPath)}`);
  } catch (e) {
    console.error(`Failed to process ${file}:`, e);
  }
}

fs.readdir(assetsDir, (err, files) => {
  if (err) {
    console.error('Unable to read assets directory:', err);
    process.exit(1);
  }
  files.forEach(processImage);
});
