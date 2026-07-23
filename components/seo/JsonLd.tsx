// ============================================================================
//  <JsonLd> — Inyecta datos estructurados Schema.org en el <head>/body.
//  Server Component: el JSON-LD llega en el HTML inicial (crawleable).
// ============================================================================
import React from "react"

export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // El contenido es JSON generado por nosotros (no input de usuario).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
