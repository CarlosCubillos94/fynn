// Generates every raster brand asset from one vector mark.
// Run: npm run brand
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "images");

const WARM = "#F6F8F2";
const CITRUS = "#F2E94E";

// The mark on a 100 x 100 grid: an F built from two ribbons on a stem, ending in the accepted dot.
// One unit of 14 drives everything: ribbon height, gap, stem width and dot diameter.
function mark(fill, dot) {
  return `
    <path d="M24 15H69A7 7 0 0 1 69 29H24Z" fill="${fill}"/>
    <path d="M24 43H53A7 7 0 0 1 53 57H24Z" fill="${fill}"/>
    <rect x="24" y="15" width="14" height="49" fill="${fill}"/>
    ${dot ? `<circle cx="31" cy="78" r="7" fill="${dot}"/>` : ""}`;
}

function place(size, scale, body) {
  const offset = size / 2 - 50 * scale;
  return `<g transform="translate(${offset} ${offset}) scale(${scale})">${body}</g>`;
}

function backdrop(size) {
  return `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0E7A55"/>
        <stop offset="0.5" stop-color="#0A4A37"/>
        <stop offset="1" stop-color="#06140F"/>
      </linearGradient>
      <radialGradient id="b" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#F4A63C" stop-opacity="0.9"/>
        <stop offset="0.55" stop-color="#F4A63C" stop-opacity="0.25"/>
        <stop offset="1" stop-color="#F4A63C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    <rect x="${size * 0.42}" y="${-size * 0.38}" width="${size * 0.9}" height="${size * 0.9}" fill="url(#b)"/>`;
}

function svg(size, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${content}</svg>`;
}

function render(name, size, content) {
  const png = new Resvg(svg(size, content), { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(join(out, name), png);
  console.log(`${name} ${size}x${size}`);
}

// iOS and web icon: opaque square, the system applies the corner mask.
render("icon.png", 1024, backdrop(1024) + place(1024, 9.4, mark(WARM, CITRUS)));
// Splash: mark only on the splash background color.
render("splash-icon.png", 1024, place(1024, 6.2, mark(WARM, CITRUS)));
// Android adaptive icon layers: keep the mark inside the central safe zone.
render("android-icon-background.png", 512, backdrop(512));
render("android-icon-foreground.png", 512, place(512, 3.9, mark(WARM, CITRUS)));
render("android-icon-monochrome.png", 432, place(432, 3.3, mark("#FFFFFF", "#FFFFFF")));
render("favicon.png", 96, backdrop(96) + place(96, 0.88, mark(WARM, CITRUS)));

// Full-screen launch image. The citrus dot is left out on purpose: the app draws it dropping into
// place once it is ready (src/components/LaunchSplash.tsx). Keep these constants in sync with it.
const LAUNCH_W = 1290;
const LAUNCH_H = 2796;
const LAUNCH_MARK_SCALE = 5.6;

function launchImage() {
  const rings = [420, 700, 980, 1260, 1540, 1820]
    .map((r) => `<circle cx="140" cy="2250" r="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="3"/>`)
    .join("");
  const offsetX = LAUNCH_W / 2 - 50 * LAUNCH_MARK_SCALE;
  const offsetY = LAUNCH_H / 2 - 50 * LAUNCH_MARK_SCALE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LAUNCH_W}" height="${LAUNCH_H}" viewBox="0 0 ${LAUNCH_W} ${LAUNCH_H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0E7A55"/>
        <stop offset="0.5" stop-color="#0A4A37"/>
        <stop offset="1" stop-color="#06140F"/>
      </linearGradient>
      <radialGradient id="b" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#F4A63C" stop-opacity="0.85"/>
        <stop offset="0.55" stop-color="#F4A63C" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#F4A63C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${LAUNCH_W}" height="${LAUNCH_H}" fill="url(#g)"/>
    <rect x="${LAUNCH_W * 0.35}" y="${-LAUNCH_H * 0.2}" width="${LAUNCH_W * 1.3}" height="${LAUNCH_W * 1.3}" fill="url(#b)"/>
    ${rings}
    <g transform="translate(${offsetX} ${offsetY}) scale(${LAUNCH_MARK_SCALE})">${mark(WARM, null)}</g>
  </svg>`;
}

const launch = new Resvg(launchImage(), { fitTo: { mode: "width", value: LAUNCH_W } }).render().asPng();
writeFileSync(join(out, "splash-ios.png"), launch);
console.log(`splash-ios.png ${LAUNCH_W}x${LAUNCH_H}`);
