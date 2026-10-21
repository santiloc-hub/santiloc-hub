import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.resolve(__dirname, "../public");

fs.mkdirSync(publicDir, { recursive: true });

const filesToCopy = [
  { src: path.join(rootDir, "CV_ES.pdf"), dest: path.join(publicDir, "CV_ES.pdf") },
  { src: path.join(rootDir, "CV_EN.pdf"), dest: path.join(publicDir, "CV_EN.pdf") },
  { src: path.join(rootDir, "assets", "banner.svg"), dest: path.join(publicDir, "banner.svg") },
];

for (const item of filesToCopy) {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, item.dest);
    console.log(`[OK] Copied ${path.basename(item.dest)} to portal/public/`);
  }
}
