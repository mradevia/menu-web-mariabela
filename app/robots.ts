// ============================================================================
//  robots.txt dinámico — Maria Bela
//  Permite indexar las páginas públicas y BLOQUEA los paneles internos
//  (admin, caja, cocina, pedidos, finanzas…) y rutas transaccionales.
// ============================================================================
import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/business"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/caja",
          "/clientes",
          "/cocina",
          "/cupones",
          "/facturacion",
          "/facturar",
          "/gastos",
          "/inventario",
          "/login",
          "/mesas",
          "/pedidos",
          "/reportes",
          "/reservaciones",
          "/ticket",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
