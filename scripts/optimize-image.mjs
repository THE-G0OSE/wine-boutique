// Converts an image to WebP for public/images.
// Usage: node scripts/optimize-image.mjs <input> <output.webp> [maxWidth=1920] [quality=80]
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";

const [, , input, output, maxWidth = "1920", quality = "80"] = process.argv;

if (!input || !output) {
  console.error("Usage: node scripts/optimize-image.mjs <input> <output.webp> [maxWidth] [quality]");
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });

const info = await sharp(input)
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .webp({ quality: Number(quality), effort: 6 })
  .toFile(output);

const before = (statSync(input).size / 1024).toFixed(0);
const after = (info.size / 1024).toFixed(0);
console.log(`${output}: ${info.width}x${info.height}, ${before}KB -> ${after}KB`);
