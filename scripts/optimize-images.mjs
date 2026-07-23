// ============================================================================
//  Optimizador de imágenes — Maria Bela
//  1) Convierte los PNG de /public a WebP redimensionado (calidad nítida).
//  2) Genera un blur placeholder (LQIP) base64 de cada imagen y lo escribe en
//     lib/seo/image-blur.ts como un mapa { "/ruta.webp": "data:image/..." }.
//     Ese mapa lo usa <SmartImage> para mostrar un difuminado INSTANTÁNEO
//     mientras la imagen real (alta calidad) termina de descargar.
//
//  Uso:  node scripts/optimize-images.mjs
// ============================================================================
import sharp from "sharp"
import { readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const PUBLIC_DIR = path.join(process.cwd(), "public")

// Calidad "equilibrio nítido": buena definición, peso razonable.
const TARGETS = [
  { dir: "IMAGENES", maxWidth: 1600, quality: 82 }, // galería / hero (se ven grandes)
  { dir: "IMAGENES COMIDA", maxWidth: 900, quality: 80 }, // platillos (tarjetas)
]

/** Genera un blurDataURL diminuto (20px de ancho) para usar como placeholder. */
async function makeBlurDataURL(inputPath) {
  const buf = await sharp(inputPath)
    .resize({ width: 20 })
    .webp({ quality: 45 })
    .toBuffer()
  return `data:image/webp;base64,${buf.toString("base64")}`
}

let totalBefore = 0
let totalAfter = 0
const blurMap = {}

for (const target of TARGETS) {
  const dirPath = path.join(PUBLIC_DIR, target.dir)
  let files
  try {
    files = await readdir(dirPath)
  } catch {
    console.log(`(saltando ${target.dir}: no existe)`)
    continue
  }

  for (const file of files) {
    if (!/\.png$/i.test(file)) continue
    const inputPath = path.join(dirPath, file)
    const outputPath = inputPath.replace(/\.png$/i, ".webp")

    const before = (await stat(inputPath)).size
    totalBefore += before

    await sharp(inputPath)
      .resize({ width: target.maxWidth, withoutEnlargement: true })
      .webp({ quality: target.quality })
      .toFile(outputPath)

    const after = (await stat(outputPath)).size
    totalAfter += after

    // La ruta pública que usa el navegador (con / inicial, tal cual el código).
    const publicPath = `/${target.dir}/${file.replace(/\.png$/i, ".webp")}`
    blurMap[publicPath] = await makeBlurDataURL(inputPath)

    const pct = Math.round((1 - after / before) * 100)
    console.log(
      `${publicPath}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${pct}%)`,
    )
  }
}

// Escribir el manifiesto de blur como TS importable.
const out =
  `// ⚠️ ARCHIVO GENERADO por scripts/optimize-images.mjs — NO editar a mano.\n` +
  `// Mapa ruta pública → blurDataURL (LQIP) para placeholders instantáneos.\n` +
  `export const IMAGE_BLUR: Record<string, string> = ${JSON.stringify(blurMap, null, 2)}\n`
await writeFile(path.join(process.cwd(), "lib", "seo", "image-blur.ts"), out, "utf8")

console.log(
  `\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB  ` +
    `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
)
console.log(`Blur placeholders generados: ${Object.keys(blurMap).length} → lib/seo/image-blur.ts`)
