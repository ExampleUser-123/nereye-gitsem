/**
 * İkon ve splash varlıklarını üretir:
 *  - assets/icon.png  (1024x1024, @capacitor/assets girişi)
 *  - assets/splash.png (2732x2732, gradyan + ikon + isim)
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const design = path.join(root, "design");
const assetsDir = path.join(root, "assets");
fs.mkdirSync(assetsDir, { recursive: true });

const iconSvg = fs.readFileSync(path.join(design, "icon.svg"), "utf-8");

// 1) App ikonu
await sharp(Buffer.from(iconSvg), { density: 300 })
  .resize(1024, 1024)
  .png()
  .toFile(path.join(assetsDir, "icon.png"));
console.log("icon.png OK");

// 2) Splash: dikey gradyan + ortada ikon + altında isim
const splashIcon = await sharp(
  Buffer.from(iconSvg.replace('rx="112"', 'rx="260"')),
  { density: 300 },
).resize(560, 560).png().toBuffer();

const titleSvg = `<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset=".45" stop-color="#fb7185"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#bg)"/>
  <circle cx="1366" cy="1010" r="620" fill="#ffffff" opacity=".12"/>
  <circle cx="1366" cy="1010" r="380" fill="#ffffff" opacity=".14"/>
  <g transform="translate(1086 730)">
    <rect width="560" height="560" rx="260" fill="#ffffff" opacity=".95"/>
  </g>
  <text x="1366" y="1660" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="128" font-weight="800" fill="#ffffff">NEREYE GİTSEM?</text>
  <text x="1366" y="1740" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="52" font-weight="500" fill="#ffffff" opacity=".85">Çevrendeki yerleri keşfet, rotana dönüştür</text>
</svg>`;

const splashBase = await sharp(Buffer.from(titleSvg)).png().toBuffer();
const iconOnSplash = await sharp(splashBase)
  .composite([{ input: splashIcon, left: 1086, top: 730 }])
  .png()
  .toFile(path.join(assetsDir, "splash.png"));
console.log("splash.png OK");

// 3) Play Store 512 ikonu (kare, rounded'sız köşe ister ama rounded da kabul edilir)
await sharp(Buffer.from(iconSvg), { density: 300 })
  .resize(512, 512)
  .png()
  .toFile(path.join(design, "icon-512-play.png"));
console.log("icon-512-play.png OK");
