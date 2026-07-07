/**
 * generate-thumbnails.js
 * -----------------------
 * Génère des miniatures WebP légères pour toutes les photos du mariage,
 * en conservant la même arborescence de dossiers.
 *
 * Exemple :
 *   photos/mairie/260620-160.jpg  →  thumbs/mairie/260620-160.webp
 *
 * UTILISATION
 * 1. npm install sharp
 * 2. Placez ce script à côté de votre dossier "photos/" (celui que vous
 *    envoyez sur R2), avec la même structure de sous-dossiers que sur le site :
 *      photos/vendredi-domaine/*.jpg
 *      photos/vendredi-repas/*.jpg
 *      photos/samedi-preparatifs/*.jpg
 *      photos/mairie/*.jpg
 *      photos/cocktail/*.jpg
 *      photos/ceremonie/*.jpg
 *      photos/soiree/*.jpg
 * 3. node generate-thumbnails.js
 * 4. Un dossier "thumbs/" est créé avec la même arborescence, en .webp.
 * 5. Envoyez ce dossier "thumbs/" sur votre bucket R2, à côté de "photos/"
 *    (donc à la racine du bucket, au même niveau que "photos/").
 *
 * RÉGLAGES
 * - THUMB_WIDTH : largeur cible des miniatures (600px est largement suffisant
 *   pour une grille où les vignettes font ~120-300px de large à l'écran, même
 *   sur un écran Retina).
 * - THUMB_QUALITY : qualité WebP (75 est un bon compromis netteté/poids).
 * - CONCURRENCY : nombre de conversions en parallèle (augmentez si votre
 *   machine a beaucoup de coeurs, réduisez si ça rame).
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = path.join(__dirname, "photos");
const OUTPUT_DIR = path.join(__dirname, "thumbs");
const THUMB_WIDTH = 600;
const THUMB_QUALITY = 75;
const CONCURRENCY = 6;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Dossier introuvable : ${SOURCE_DIR}`);
    console.error(`   Placez ce script à côté de votre dossier "photos/".`);
    process.exit(1);
  }

  const galleries = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (!galleries.length) {
    console.error(`❌ Aucun sous-dossier trouvé dans ${SOURCE_DIR}`);
    process.exit(1);
  }

  let totalFiles = 0;
  let done = 0;
  let skipped = 0;
  let errors = 0;
  const startTime = Date.now();

  const jobs = [];

  for (const gallery of galleries) {
    const srcGalleryDir = path.join(SOURCE_DIR, gallery);
    const outGalleryDir = path.join(OUTPUT_DIR, gallery);
    fs.mkdirSync(outGalleryDir, { recursive: true });

    const files = fs
      .readdirSync(srcGalleryDir)
      .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));

    for (const file of files) {
      const srcPath = path.join(srcGalleryDir, file);
      const outPath = path.join(
        outGalleryDir,
        path.basename(file, path.extname(file)) + ".webp"
      );
      jobs.push({ gallery, srcPath, outPath, file });
      totalFiles++;
    }
  }

  console.log(`📸 ${totalFiles} photos trouvées dans ${galleries.length} galerie(s).`);
  console.log(`⚙️  Génération des miniatures (largeur ${THUMB_WIDTH}px, qualité ${THUMB_QUALITY})...\n`);

  // Traitement par lots pour limiter la charge machine
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async ({ gallery, srcPath, outPath, file }) => {
        try {
          if (fs.existsSync(outPath)) {
            skipped++;
            return;
          }

          await sharp(srcPath)
            .rotate() // respecte l'orientation EXIF
            .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
            .webp({ quality: THUMB_QUALITY })
            .toFile(outPath);

          done++;
        } catch (err) {
          errors++;
          console.error(`  ⚠️  Échec sur ${gallery}/${file} : ${err.message}`);
        }
      })
    );

    const progress = Math.round(((i + batch.length) / jobs.length) * 100);
    process.stdout.write(`\r   Progression : ${progress}% (${done + skipped}/${totalFiles})`);
  }

  const seconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Terminé en ${seconds}s`);
  console.log(`   ${done} miniature(s) générée(s)`);
  if (skipped) console.log(`   ${skipped} déjà existante(s), ignorée(s)`);
  if (errors) console.log(`   ${errors} échec(s), voir ci-dessus`);
  console.log(`\n📁 Résultat dans : ${OUTPUT_DIR}`);
  console.log(`   Envoyez ce dossier "thumbs/" sur R2, à la racine du bucket`);
  console.log(`   (au même niveau que votre dossier "photos/").`);
}

main();