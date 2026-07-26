// Generates the PWA/app icons as PNGs from a tiny built-in encoder — no image
// libraries. The mark mirrors the app's brand-mark: a 2x2 grid of accent
// squares on the dark app background. Re-run with: node scripts/gen-icons.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const BG = [0x0d, 0x10, 0x17]; // --bg
const SQUARES = [
  [0x5b, 0x8d, 0xef], // blue  --accent
  [0xf5, 0xc5, 0x18], // yellow (JS)
  [0x38, 0xbd, 0xf8], // cyan  (React)
  [0xb9, 0x8b, 0xff], // purple (CSS)
];

// CRC32 (PNG)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// size = pixels, pad = fraction of margin around the grid (maskable safe zone)
function makePng(size, pad = 0.19) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b]) => {
    const i = (y * size + x) * 4;
    px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
  };
  // background
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, BG);
  // 2x2 grid
  const inner = size * (1 - pad * 2);
  const off = (size - inner) / 2;
  const gap = inner * 0.1;
  const sq = (inner - gap) / 2;
  const cells = [
    [off, off], [off + sq + gap, off],
    [off, off + sq + gap], [off + sq + gap, off + sq + gap],
  ];
  cells.forEach(([cx, cy], idx) => {
    const x0 = Math.round(cx), y0 = Math.round(cy), s = Math.round(sq);
    for (let y = y0; y < y0 + s; y++) for (let x = x0; x < x0 + s; x++) set(x, y, SQUARES[idx]);
  });

  // raw scanlines with filter byte 0
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="20" fill="#0d1017"/>
<rect x="23" y="23" width="24" height="24" rx="4" fill="#5b8def"/>
<rect x="53" y="23" width="24" height="24" rx="4" fill="#f5c518"/>
<rect x="23" y="53" width="24" height="24" rx="4" fill="#38bdf8"/>
<rect x="53" y="53" width="24" height="24" rx="4" fill="#b98bff"/>
</svg>`;

const out = new URL("../public/", import.meta.url);
writeFileSync(new URL("pwa-192.png", out), makePng(192, 0.16));
writeFileSync(new URL("pwa-512.png", out), makePng(512, 0.16));
writeFileSync(new URL("pwa-maskable-512.png", out), makePng(512, 0.22)); // bigger safe zone
writeFileSync(new URL("apple-touch-icon.png", out), makePng(180, 0.14));
writeFileSync(new URL("favicon.svg", out), svg);
console.log("icons written to public/: pwa-192, pwa-512, pwa-maskable-512, apple-touch-icon, favicon.svg");
