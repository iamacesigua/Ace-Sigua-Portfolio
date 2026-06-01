const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIRS = [
  'assets/Projects',
  'assets/images/Selected Works',
  'assets/images/Home',
  'assets/images/Pointer Trail',
  'assets/images/Contact',
];

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.gif'];
const MAX_WIDTH = 1920;
const THUMB_MAX_WIDTH = 1200;
const TRAIL_MAX_WIDTH = 800;

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED.includes(ext)) return null;

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const webpPath = path.join(dir, `${baseName}.webp`);

  const metadata = await sharp(filePath).metadata();
  const fileStat = await fs.stat(filePath);
  const originalSize = fileStat.size;
  let width = metadata.width;

  let maxW = MAX_WIDTH;
  if (filePath.includes('Selected Works')) maxW = THUMB_MAX_WIDTH;
  if (filePath.includes('Pointer Trail')) maxW = TRAIL_MAX_WIDTH;
  if (filePath.includes('Contact')) maxW = 1000;

  if (ext === '.gif') {
    try {
      await sharp(filePath, { animated: true }).webp({ quality: 80 }).toFile(webpPath);
    } catch (e) {
      console.error(`  GIF->WebP failed: ${path.basename(filePath)}`);
      return null;
    }
    const webpStat = await fs.stat(webpPath);
    return {
      file: filePath, webp: webpPath,
      original: originalSize, webpSize: webpStat.size,
      saved: originalSize - webpStat.size,
      width: metadata.width, height: metadata.height,
    };
  }

  const resizeOptions = width > maxW ? { width: maxW, withoutEnlargement: true } : { withoutEnlargement: true };

  const pipeline = sharp(filePath).resize(resizeOptions);
  await pipeline.webp({ quality: 80, effort: 4 }).toFile(webpPath);

  const webpStat = await fs.stat(webpPath);
  const savedBytes = originalSize - webpStat.size;

  const finalWidth = resizeOptions.width && resizeOptions.width < width ? resizeOptions.width : width;
  const aspectRatio = metadata.width / metadata.height;
  const finalHeight = Math.round(finalWidth / aspectRatio);

  return {
    file: filePath, webp: webpPath,
    original: originalSize, webpSize: webpStat.size,
    saved: savedBytes,
    width: finalWidth, height: finalHeight,
  };
}

async function main() {
  const results = [];
  let totalOriginal = 0;
  let totalWebp = 0;

  for (const dirRel of IMAGE_DIRS) {
    const absDir = path.join(ROOT, dirRel);
    try {
      await fs.access(absDir);
    } catch {
      console.log(`  Skipped (not found): ${dirRel}`);
      continue;
    }

    const entries = await fs.readdir(absDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(absDir, entry.name);
      if (entry.isDirectory()) {
        const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isFile()) {
            const r = await processFile(path.join(fullPath, sub.name));
            if (r) results.push(r);
          }
        }
      } else if (entry.isFile()) {
        const r = await processFile(fullPath);
        if (r) results.push(r);
      }
    }
  }

  console.log('\n=== Optimization Report ===\n');
  for (const r of results) {
    const rel = path.relative(ROOT, r.file);
    const pct = r.original > 0 ? ((1 - r.webpSize / r.original) * 100).toFixed(1) : 0;
    console.log(`${rel}`);
    console.log(`  ${(r.original / 1024 / 1024).toFixed(2)} MB -> ${(r.webpSize / 1024 / 1024).toFixed(2)} MB (${pct}% saved)`);
    totalOriginal += r.original;
    totalWebp += r.webpSize;
  }

  const totalSaved = totalOriginal - totalWebp;
  console.log(`\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB -> ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : 0}%)`);

  const imageData = {};
  for (const r of results) {
    const rel = path.relative(ROOT, r.file).replace(/\\/g, '/');
    imageData[rel] = {
      width: r.width,
      height: r.height,
      webp: path.relative(ROOT, r.webp).replace(/\\/g, '/'),
    };
  }
  const imageMapPath = path.join(ROOT, 'scripts', 'image-data.json');
  await fs.writeFile(imageMapPath, JSON.stringify(imageData, null, 2));
  console.log(`\nImage metadata written to scripts/image-data.json`);
}

main().catch(console.error);
