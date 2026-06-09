/* Generates PWA/app icons from the brand SVG using sharp (already installed). */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const iconSvg = fs.readFileSync(path.join(root, "src/app/icon.svg"));

// Maskable icon: full-bleed background, content inside the 80% safe zone.
const maskableSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
     <rect width="512" height="512" fill="#E05A29"/>
     <g transform="translate(136 136) scale(10)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <circle cx="6" cy="6" r="3"/>
       <path d="M8.12 8.12 12 12"/>
       <path d="M20 4 8.12 15.88"/>
       <circle cx="6" cy="18" r="3"/>
       <path d="M14.8 14.8 20 20"/>
     </g>
   </svg>`,
);

// Assemble a multi-resolution .ico that embeds PNG images (supported by all
// modern browsers). sharp can't write .ico directly, so we build the container.
function buildIco(images /* [{ size, buf }] */) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  for (let i = 0; i < count; i++) {
    const { size, buf } = images[i];
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e + 0); // width
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // color planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(buf.length, e + 8); // data size
    dir.writeUInt32LE(offset, e + 12); // data offset
    offset += buf.length;
  }
  return Buffer.concat([header, dir, ...images.map((i) => i.buf)]);
}

async function main() {
  const targets = [
    { src: iconSvg, size: 192, out: "public/icon-192.png" },
    { src: iconSvg, size: 512, out: "public/icon-512.png" },
    { src: maskableSvg, size: 512, out: "public/icon-maskable-512.png" },
    { src: iconSvg, size: 180, out: "src/app/apple-icon.png" },
  ];
  for (const t of targets) {
    await sharp(t.src).resize(t.size, t.size).png().toFile(path.join(root, t.out));
    console.log("wrote", t.out);
  }

  // Classic favicon.ico (16/32/48) for legacy browsers, bookmarks and crawlers.
  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      buf: await sharp(iconSvg).resize(size, size).png().toBuffer(),
    })),
  );
  fs.writeFileSync(path.join(root, "src/app/favicon.ico"), buildIco(icoImages));
  console.log("wrote src/app/favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
