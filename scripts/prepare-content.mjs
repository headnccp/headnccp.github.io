// Runs before every build. Fills in what editors shouldn't have to:
//  - page count and file size of each guideline PDF
//  - a cover image from the PDF's first page (needs poppler: pdfinfo/pdftoppm)
//  - on CI only, shrinks oversized photos in the build copy (originals in git are untouched)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const PDF_DIR = "public/downloads/guidelines";
const COVER_DIR = "public/media/covers";
const IMAGE_DIR = "public/media/images";
const OUT = "src/generated/pdf-meta.json";

function hasTool(name) {
  try {
    execFileSync(name, ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const poppler = hasTool("pdfinfo") && hasTool("pdftoppm");
if (!poppler) console.warn("[prepare] poppler not found: skipping page counts and covers");

mkdirSync(COVER_DIR, { recursive: true });
mkdirSync("src/generated", { recursive: true });

const meta = {};
for (const name of existsSync(PDF_DIR) ? readdirSync(PDF_DIR) : []) {
  if (!name.toLowerCase().endsWith(".pdf")) continue;
  const path = join(PDF_DIR, name);
  const entry = { sizeBytes: statSync(path).size };

  if (poppler) {
    try {
      const info = execFileSync("pdfinfo", [path], { encoding: "utf8" });
      entry.pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]) || undefined;

      const base = parse(name).name;
      const cover = join(COVER_DIR, base + ".jpg");
      if (!existsSync(cover)) {
        execFileSync("pdftoppm", ["-f", "1", "-l", "1", "-singlefile", "-jpeg", "-jpegopt", "quality=80",
          "-scale-to-x", "600", "-scale-to-y", "-1", path, join(COVER_DIR, base)]);
      }
      entry.cover = "/media/covers/" + base + ".jpg";
    } catch (err) {
      console.warn(`[prepare] could not read ${name}: ${err.message}`);
    }
  }
  meta["/downloads/guidelines/" + name] = entry;
}
writeFileSync(OUT, JSON.stringify(meta, null, 2));
console.log(`[prepare] ${Object.keys(meta).length} guideline PDF(s)`);

if (process.env.CI) {
  const MAX = 1920;
  const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
  let shrunk = 0;
  for (const file of existsSync(IMAGE_DIR) ? walk(IMAGE_DIR) : []) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
    const img = sharp(file, { failOn: "none" });
    const { width = 0, height = 0 } = await img.metadata();
    if (Math.max(width, height) <= MAX) continue;
    const buf = await img.rotate().resize(MAX, MAX, { fit: "inside" }).toBuffer();
    writeFileSync(file, buf);
    shrunk++;
  }
  console.log(`[prepare] resized ${shrunk} large photo(s)`);
}
