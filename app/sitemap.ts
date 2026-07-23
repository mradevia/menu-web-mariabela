// ============================================================================
//  sitemap.xml dinámico — Maria Bela
//  Lista SOLO las páginas públicas orientadas a SEO. Prioridad y frecuencia
//  ajustadas: el home y el menú son lo más importante.
// ============================================================================
import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/business"

export default function sitemap(): MetadataRoute.Sitemap {
  // Fecha de última modificación estable (evita Date.now no determinista en build).
  const lastModified = new Date("2026-07-23")

  const routes: {
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
    { path: "/desayunos-coacalco", priority: 0.9, changeFrequency: "monthly" },
    { path: "/comida-italiana-coacalco", priority: 0.9, changeFrequency: "monthly" },
    { path: "/comida-mexicana-coacalco", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ubicacion", priority: 0.7, changeFrequency: "yearly" },
    { path: "/reservar", priority: 0.6, changeFrequency: "monthly" },
  ]

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
