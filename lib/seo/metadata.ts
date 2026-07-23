// ============================================================================
//  HELPERS DE METADATA — Maria Bela
//  Genera objetos Metadata de Next.js consistentes para cada página, con
//  canonical, Open Graph y Twitter Cards correctos. Úsalo en el `metadata`
//  de cada page para no repetir configuración y mantener el SEO uniforme.
// ============================================================================
import type { Metadata } from "next"
import { SITE_URL, BUSINESS, LOCAL_KEYWORDS } from "./business"

/** Imagen social por defecto (Open Graph / Twitter). 1200×630. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Maria Bela — Restaurante de comida mexicana e italiana en Coacalco",
}

interface PageMetaInput {
  title: string
  description: string
  /** Ruta relativa canónica, ej: "/desayunos-coacalco". "/" para el home. */
  path: string
  keywords?: string[]
  /** Imagen OG específica de la página (ruta absoluta o relativa). */
  ogImage?: string
}

/**
 * Construye la Metadata de una página con todos los campos SEO correctos.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path
  const image = ogImage
    ? { url: ogImage, width: 1200, height: 630, alt: title }
    : DEFAULT_OG_IMAGE

  return {
    // `absolute` evita que el template del layout ("%s | Maria Bela…") duplique
    // la marca cuando el título de la página ya la incluye.
    title: { absolute: title },
    description,
    keywords: keywords ?? LOCAL_KEYWORDS,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: canonical,
      siteName: `${BUSINESS.name} · Restaurante en Coacalco`,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  }
}

/** Metadata base compartida (se hereda a todas las páginas). */
export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.legalName }],
  creator: BUSINESS.legalName,
  publisher: BUSINESS.legalName,
  category: "restaurant",
  formatDetection: { telephone: true, address: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // ⚠️ Pega aquí el código de Google Search Console cuando verifiques el sitio:
    // google: "xxxxxxxxxxxxxxxxxxxx",
  },
}
