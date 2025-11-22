import { createCanvas, loadImage } from "canvas";
import { writeFileSync, unlinkSync } from "fs";
import fetch from "node-fetch";

async function downloadImage(url: string, filePath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buffer);
}

async function makeBanner(
  tagText: string,
  guildTagPath: string,
  bgPath: string,
  output = "banner.png"
) {
  const width = 4096 * 0.6;
  const height = 1638 * 0.4;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ---- Fond personnalisé ----
  const bg = await loadImage(bgPath);
  ctx.drawImage(bg, 0, 0, width, height);

  // Flou accentué global
  (ctx as any).filter = "blur(25px)";
  ctx.drawImage(canvas, 0, 0);
  (ctx as any).filter = "none";

  // ---- Rectangle avec coins arrondis ----
  const borderRadius = 300;
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(width - borderRadius, 0);
  ctx.quadraticCurveTo(width, 0, width, borderRadius);
  ctx.lineTo(width, height - borderRadius);
  ctx.quadraticCurveTo(width, height, width - borderRadius, height);
  ctx.lineTo(borderRadius, height);
  ctx.quadraticCurveTo(0, height, 0, height - borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.quadraticCurveTo(0, 0, borderRadius, 0);
  ctx.closePath();

  // Assombrissement
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();

  // ---- Logo ----
  const tagImg = await loadImage(guildTagPath);
  const circleRadius = height * 0.33;
  const logoRadius = circleRadius * 0.7;
  const spacing = 300;

  ctx.font = `${Math.floor(height * 0.33)}px "Segoe UI", Impact, Arial Black`;
  ctx.textBaseline = "middle";
  const textWidth = ctx.measureText(tagText).width;

  const totalWidth = circleRadius * 2 + spacing + textWidth;
  const startX = (width - totalWidth) / 2;
  const centerY = height / 2;
  const circleCenterX = startX + circleRadius;

  // Flou local derrière le cercle
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleCenterX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  (ctx as any).filter = "blur(45px)";
  ctx.drawImage(bg, 0, 0, width, height);
  (ctx as any).filter = "none";
  ctx.restore();

  // Contour cercle
  ctx.beginPath();
  ctx.arc(circleCenterX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 16;
  ctx.stroke();

  // Logo
  ctx.drawImage(
    tagImg,
    circleCenterX - logoRadius,
    centerY - logoRadius,
    logoRadius * 2,
    logoRadius * 2
  );

  // Texte
  ctx.fillStyle = "white";
  ctx.fillText(tagText, startX + circleRadius * 2 + spacing, centerY);

  writeFileSync(output, canvas.toBuffer("image/png"));
}

async function cropRounded(inputPath: string, outputPath: string) {
  const borderRadius = 300;
  const img = await loadImage(inputPath);
  const width = img.width;
  const height = img.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Rectangle arrondi comme clip
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(width - borderRadius, 0);
  ctx.quadraticCurveTo(width, 0, width, borderRadius);
  ctx.lineTo(width, height - borderRadius);
  ctx.quadraticCurveTo(width, height, width - borderRadius, height);
  ctx.lineTo(borderRadius, height);
  ctx.quadraticCurveTo(0, height, 0, height - borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.quadraticCurveTo(0, 0, borderRadius, 0);
  ctx.closePath();

  ctx.clip();

  // Dessine l’image générée à l’intérieur du rectangle arrondi
  ctx.drawImage(img, 0, 0, width, height);

  writeFileSync(outputPath, canvas.toBuffer("image/png"));
}

async function banner(
  tag_asset: string,
  tag_id: string,
  tag_name: string,
  id: string
) {
  // if (existsSync(`./dist/Modules/banner/${id}_${tag_asset}.png`))
  //   return `./dist/Modules/banner/${id}_${tag_asset}.png`;

  const path = "./dist/Modules/banner/";

  const tag_url = `https://cdn.discordapp.com/clan-badges/${tag_id}/${tag_asset}`;
  const tag_path = `${path}${tag_asset}.png`;

  const bg_path = `${path}background.png`;

  const outpout_path = `${path}${id}_${tag_asset}.png`;

  await downloadImage(tag_url, tag_path);
  await makeBanner(tag_name, tag_path, bg_path, outpout_path);
  await cropRounded(outpout_path, outpout_path);

  unlinkSync(tag_path);

  return outpout_path;
}

export default banner;
