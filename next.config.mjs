/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Comprimir respuestas (gzip/brotli en Vercel).
  compress: true,
  // Cabecera "powered by" fuera (buena práctica).
  poweredByHeader: false,
  images: {
    // Formatos modernos servidos automáticamente por next/image.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días de caché de imágenes optimizadas
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Next 16 exige declarar las calidades permitidas (las que usa <SmartImage>).
    qualities: [75, 80, 82, 85, 88],
  },
  async headers() {
    return [
      {
        // Caché agresiva e inmutable para assets estáticos versionados.
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}

export default nextConfig
