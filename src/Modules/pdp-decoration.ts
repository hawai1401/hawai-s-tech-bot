import {
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  rmSync,
  unlinkSync,
} from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import { dirname, join } from "path";
import { execSync } from "child_process";
import { createCanvas, loadImage } from "canvas";

// Fonction pour télécharger une image
async function downloadImage(url: string, filePath: string) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch image: ${res.statusText}\n${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buffer);
}

// Conversion APNG vers GIF avec haute qualité
async function convertApngToGif(inputPath: string, outputPath: string) {
  try {
    // Conversion avec haute qualité
    execSync(
      `ffmpeg -loglevel error -i "${inputPath}" -vf "split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse" -y "${outputPath}"`
    );
  } catch (e) {
    if (e instanceof Error)
      console.error("Erreur conversion APNG -> GIF:", e.message);
    throw e;
  }
}

async function createGIF(apngUrl: string, apngPath: string, gifPath: string) {
  await downloadImage(apngUrl, apngPath);
  await convertApngToGif(apngPath, gifPath);
}

async function createGifWithBackground(
  pngUrl: string,
  pngPath: string,
  gifPath: string,
  outputPath: string
) {
  const framesDir = dirname(gifPath) + "/frames";
  const processedFramesDir = dirname(gifPath) + "/processed_frames";

  try {
    // Créer les dossiers
    [framesDir, processedFramesDir].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Télécharger le PNG de fond
    await downloadImage(pngUrl, pngPath);
    await sharp(pngPath)
      .png()
      .toFile(pngPath + "_static.png");
    await cropCircle(pngPath + "_static.png", pngPath + "_circle.png");

    // Vérifier le GIF source
    if (!existsSync(gifPath)) {
      throw new Error(`Fichier GIF source introuvable: ${gifPath}`);
    }

    // Extraire les frames du GIF avec QUALITÉ MAXIMALE
    execSync(
      `ffmpeg -loglevel error -i "${gifPath}" -qscale:v 1 "${framesDir}/frame_%03d.png"`
    );

    const frameFiles = readdirSync(framesDir)
      .filter((file) => file.endsWith(".png"))
      .sort();

    // Charger le PNG de fond une seule fois
    const backgroundBuffer = readFileSync(pngPath + "_circle.png");

    // Traiter chaque frame - CORRECTION DÉFINITIVE
    for (let i = 0; i < frameFiles.length; i++) {
      const frameFile = frameFiles[i]!;
      const framePath = join(framesDir, frameFile);
      const outputFramePath = join(
        processedFramesDir,
        `processed_${frameFile}`
      );

      try {
        // 1. Charger la frame du GIF
        const frameBuffer = readFileSync(framePath);

        // 2. Créer l'image finale : PNG en fond + GIF par-dessus
        await sharp(backgroundBuffer)
          .resize(288, 288) // Redimensionner le fond
          .composite([
            {
              input: frameBuffer, // Frame du GIF par-dessus
              blend: "over",
            },
          ])
          .png({ quality: 100, compressionLevel: 0 }) // Qualité maximale
          .toFile(outputFramePath);
      } catch (e) {
        if (e instanceof Error)
          console.error(`Erreur sur la frame ${frameFile}:`, e.message);
        copyFileSync(framePath, outputFramePath);
      }
    }

    // Créer le GIF final avec ULTRA QUALITÉ

    execSync(
      `ffmpeg -loglevel error -framerate 12 -i "${processedFramesDir}/processed_frame_%03d.png" ` +
        `-filter_complex "[0:v] split [a][b];[a] palettegen=reserve_transparent=1:stats_mode=full:max_colors=256 [p];[b][p] paletteuse=dither=none" ` +
        `-y "${outputPath}"`
    );
  } catch (error) {
    console.error("Erreur dans createGifWithBackground:", error);
    throw error;
  } finally {
    // Nettoyage des dossiers temporaires
    [framesDir, processedFramesDir].forEach((dir) => {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}

async function cropCircle(inputPath: string, outputPath: string, size = 256) {
  // Charger l'image
  const image = await loadImage(inputPath);

  // Créer un canvas carré
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Dessiner un cercle comme masque
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip(); // Appliquer le masque circulaire

  // Dessiner l'image centrée dans le cercle
  const ratio = Math.min(size / image.width, size / image.height);
  const newWidth = image.width * ratio;
  const newHeight = image.height * ratio;
  const x = (size - newWidth) / 2;
  const y = (size - newHeight) / 2;

  ctx.drawImage(image, x, y, newWidth, newHeight);

  // Sauvegarder le résultat
  const buffer = canvas.toBuffer("image/png");
  writeFileSync(outputPath, buffer);

  return outputPath;
}

// FONCTION PRINCIPALE
const pdp = async (
  apngUrlasset: string,
  user: { id: string; avatarURL: string }
) => {
  const pdpDir = "./dist/Modules/pdp/";

  if (existsSync(`${pdpDir}/${user.id}_${apngUrlasset}.gif`)) {
    return `${pdpDir}/${user.id}_${apngUrlasset}.gif`;
  }

  try {
    if (!existsSync(pdpDir)) {
      mkdirSync(pdpDir, { recursive: true });
    }

    const apngUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${apngUrlasset}.png`;
    const apngPath = `${pdpDir}/${apngUrlasset}.apng`;
    const output_gifPath = `${pdpDir}/${apngUrlasset}.gif`;

    await createGIF(apngUrl, apngPath, output_gifPath);

    const pngPath = `${pdpDir}/background_${user.id}.png`;
    const outputPath = `${pdpDir}/${user.id}_${apngUrlasset}.gif`;

    await createGifWithBackground(
      user.avatarURL,
      pngPath,
      output_gifPath,
      outputPath
    );

    // Nettoyage SEULEMENT si le résultat est bon
    if (existsSync(outputPath)) {
      [
        apngPath,
        pngPath,
        output_gifPath,
        pngPath + "_static.png",
        pngPath + "_circle.png",
      ].forEach((file) => {
        if (existsSync(file)) {
          unlinkSync(file);
        }
      });
      return outputPath;
    } else {
      throw new Error("Le GIF final n'a pas été créé");
    }
  } catch (e) {
    if (e instanceof Error) console.error("❌ Erreur dans init:", e.message);
    throw e;
  }
};

export default pdp;
