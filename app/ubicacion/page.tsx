// ============================================================================
//  /ubicacion — Página SEO de ubicación (refuerza el SEO local y el Local Pack).
//  Objetivo: "restaurante cerca de mí", "dónde está Maria Bela", "cómo llegar
//  a Maria Bela Coacalco". NAP prominente + mapa + horarios + cómo llegar.
// ============================================================================
import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { MapPin, Phone, Clock, Navigation, Car } from "lucide-react"
import LocalPageShell from "@/components/seo/LocalPageShell"
import JsonLd from "@/components/seo/JsonLd"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { buildGraph, breadcrumbSchema, faqSchema } from "@/lib/seo/schema"
import { BUSINESS, ADDRESS_ONE_LINE } from "@/lib/seo/business"

export const metadata: Metadata = buildPageMetadata({
  title: "Ubicación y Cómo Llegar | Maria Bela Coacalco",
  description:
    "Maria Bela está en And. Severiano Reyes 27A (Palacio Municipal), Coacalco de Berriozábal, C.P. 55700. Consulta el mapa, horarios, teléfono y cómo llegar a nuestro restaurante en el centro de Coacalco.",
  path: "/ubicacion",
  keywords: [
    "Maria Bela ubicación",
    "restaurante cerca de mí Coacalco",
    "cómo llegar Maria Bela Coacalco",
    "restaurante centro de Coacalco",
    "dónde está Maria Bela",
  ],
})

const FAQS = [
  {
    q: "¿Dónde está ubicado Maria Bela?",
    a: `Maria Bela está en ${ADDRESS_ONE_LINE}, dentro del Palacio Municipal de Coacalco de Berriozábal, Estado de México.`,
  },
  {
    q: "¿Cuál es el horario de atención?",
    a: "Domingo a jueves de 8:00 AM a 5:00 PM, y viernes y sábado de 8:00 AM a 10:00 PM.",
  },
  {
    q: "¿Cómo llego a Maria Bela en Coacalco?",
    a: "Estamos en el centro de Coacalco, junto al Palacio Municipal. Puedes usar el botón 'Cómo llegar' para abrir la ruta en Google Maps desde tu ubicación.",
  },
]

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  ADDRESS_ONE_LINE,
)}&z=16&output=embed`

export default function UbicacionPage() {
  const jsonLd = buildGraph([
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Ubicación", path: "/ubicacion" },
    ]),
    faqSchema(FAQS),
  ])

  return (
    <LocalPageShell
      crumbs={[
        { name: "Inicio", path: "/" },
        { name: "Ubicación", path: "/ubicacion" },
      ]}
    >
      <JsonLd data={jsonLd} />

      <section className="mb-10">
        <h1 className="font-serif text-4xl font-black leading-tight md:text-5xl">
          Ubicación de Maria Bela en Coacalco
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d4a41]">
          Nos encontramos en el <strong>centro de Coacalco de Berriozábal</strong>, junto al Palacio
          Municipal. Un restaurante familiar fácil de encontrar para desayunar, comer o cenar.
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Datos NAP */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#e7e0d0] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <MapPin className="h-5 w-5 text-[#e9c46a]" /> Dirección
            </h2>
            <address className="mt-2 not-italic text-[#3d4a41]">
              {BUSINESS.address.streetAddress}
              <br />
              {BUSINESS.address.landmark}
              <br />
              {BUSINESS.address.locality}, {BUSINESS.address.region}
              <br />
              C.P. {BUSINESS.address.postalCode}
            </address>
          </div>

          <div className="rounded-2xl border border-[#e7e0d0] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <Clock className="h-5 w-5 text-[#e9c46a]" /> Horario
            </h2>
            <p className="mt-2 text-[#3d4a41]">
              {BUSINESS.hoursHuman.weekdays}
              <br />
              {BUSINESS.hoursHuman.weekend}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0d0] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <Phone className="h-5 w-5 text-[#e9c46a]" /> Teléfono
            </h2>
            <a href={`tel:${BUSINESS.phoneE164}`} className="mt-2 block text-[#3d4a41] hover:underline">
              {BUSINESS.phoneDisplay}
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={BUSINESS.googleMapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#0D261C] px-6 py-3 text-sm font-semibold text-[#e9c46a] shadow-md transition hover:bg-[#123a2b]"
            >
              <Navigation className="h-4 w-4" /> Cómo llegar
            </a>
            <a
              href={BUSINESS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0D261C] px-6 py-3 text-sm font-semibold text-[#0D261C] transition hover:bg-[#0D261C] hover:text-[#e9c46a]"
            >
              <Car className="h-4 w-4" /> Ver en Google Maps
            </a>
          </div>
        </div>

        {/* Mapa */}
        <div className="overflow-hidden rounded-2xl border border-[#e7e0d0] shadow-sm">
          <iframe
            title="Mapa de ubicación de Maria Bela en Coacalco"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full min-h-[400px] w-full"
          />
        </div>
      </div>

      <section className="mt-12 rounded-3xl bg-[#0D261C] p-8 text-[#faf7f0] md:p-12">
        <h2 className="font-serif text-2xl font-bold text-[#e9c46a]">Zona de servicio</h2>
        <p className="mt-3 max-w-3xl text-[#e6ddca]">
          Atendemos a comensales de Coacalco de Berriozábal, San Francisco Coacalco, Villa de las
          Flores y zonas cercanas como Tultitlán y Ecatepec. Ven a visitarnos o consulta nuestro{" "}
          <Link href="/menu" className="font-semibold text-[#e9c46a] underline">
            menú
          </Link>{" "}
          y reserva desde la{" "}
          <Link href="/reservar" className="font-semibold text-[#e9c46a] underline">
            página de reservaciones
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 mb-8">
        <h2 className="mb-6 font-serif text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-[#e7e0d0] bg-white p-5">
              <summary className="cursor-pointer font-semibold text-[#0D261C]">{f.q}</summary>
              <p className="mt-2 text-sm text-[#5b665c]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </LocalPageShell>
  )
}
