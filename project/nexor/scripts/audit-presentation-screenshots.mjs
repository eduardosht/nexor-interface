import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const documentPath = "docs/apresentacao-painel-administrativo-nexor.html";
const outputPath = "docs/assets/apresentacao-painel-admin/auditoria-loading-contato.png";
const html = fs.readFileSync(documentPath, "utf8");
const images = [...html.matchAll(/<img src="([^"]+)"/g)].map((match) => match[1]);
const dimensions = [];

const thumbWidth = 360;
const thumbHeight = 225;
const labelHeight = 34;
const columns = 3;
const rows = Math.ceil(images.length / columns);
const width = columns * thumbWidth;
const height = rows * (thumbHeight + labelHeight);
const composites = [];

for (let index = 0; index < images.length; index += 1) {
  const source = images[index];
  const x = (index % columns) * thumbWidth;
  const y = Math.floor(index / columns) * (thumbHeight + labelHeight);
  const metadata = await sharp(path.join("docs", source)).metadata();
  dimensions.push({ file: path.basename(source), width: metadata.width, height: metadata.height });
  const thumb = await sharp(path.join("docs", source))
    .resize(thumbWidth, thumbHeight, { fit: "cover", position: "top" })
    .png()
    .toBuffer();
  const label = Buffer.from(`
    <svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="10" y="21" font-family="Arial, sans-serif" font-size="14" fill="#111827">${index + 1}. ${path.basename(source)}</text>
    </svg>
  `);

  composites.push({ input: thumb, left: x, top: y });
  composites.push({ input: label, left: x, top: y + thumbHeight });
}

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: "#f6f7f9",
  },
})
  .composite(composites)
  .png()
  .toFile(outputPath);

console.log(JSON.stringify({ images: images.length, outputPath, dimensions }, null, 2));
