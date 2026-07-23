// ============================================================================
//  <LocalPageShell> — Contenedor común de las páginas SEO locales.
//  Aporta: header con logo + navegación, breadcrumbs, y footer con NAP
//  (Nombre-Dirección-Teléfono) e interlinking hacia las demás páginas.
//  Server Component: HTML estático crawleable y muy rápido (buen LCP/CLS).
// ============================================================================
import React from "react"
import Link from "next/link"
import { MapPin, Phone, Clock, ArrowLeft } from "lucide-react"
import Breadcrumbs, { type Crumb } from "./Breadcrumbs"
import { BUSINESS, ADDRESS_ONE_LINE } from "@/lib/seo/business"

/** Enlaces internos compartidos (interlinking SEO). */
export const SEO_NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/desayunos-coacalco", label: "Desayunos en Coacalco" },
  { href: "/comida-italiana-coacalco", label: "Comida Italiana" },
  { href: "/comida-mexicana-coacalco", label: "Comida Mexicana" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/reservar", label: "Reservar" },
]

export default function LocalPageShell({
  crumbs,
  children,
}: {
  crumbs: Crumb[]
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#0D261C]">
      {/* Header */}
      <header className="border-b border-[#e7e0d0] bg-[#0D261C] text-[#faf7f0]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/brand/mariabela-logo-clear-gold-sm.png"
              alt="Maria Bela — Restaurante en Coacalco"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <span className="font-serif text-xl font-bold tracking-wide">Maria Bela</span>
          </Link>
          <nav aria-label="Navegación principal" className="hidden gap-5 text-sm md:flex">
            {SEO_NAV_LINKS.slice(1, 6).map((l) => (
              <Link key={l.href} href={l.href} className="text-[#e9c46a] hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Contenido */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      {/* Footer con NAP e interlinking */}
      <footer className="mt-16 border-t border-[#e7e0d0] bg-[#0D261C] text-[#faf7f0]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#e9c46a]">Maria Bela</h2>
            <p className="mt-2 text-sm text-[#cdbfa0]">
              Restaurante de comida mexicana e italiana en el centro de Coacalco de Berriozábal.
              Desayunos, pastas, pizzas, cortes y cafetería.
            </p>
          </div>
          <address className="not-italic text-sm text-[#e6ddca] space-y-2">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e9c46a]" />
              <span>{ADDRESS_ONE_LINE}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#e9c46a]" />
              <a href={`tel:${BUSINESS.phoneE164}`} className="hover:underline">
                {BUSINESS.phoneDisplay}
              </a>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#e9c46a]" />
              <span>
                {BUSINESS.hoursHuman.weekdays}
                <br />
                {BUSINESS.hoursHuman.weekend}
              </span>
            </p>
          </address>
          <nav aria-label="Enlaces del sitio">
            <h2 className="font-serif text-lg font-bold text-[#e9c46a]">Explora</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {SEO_NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#e6ddca] hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-[#a9b3a7]">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Volver al inicio
          </Link>
          <p className="mt-2">
            © {BUSINESS.name} · Restaurante en Coacalco, Estado de México
          </p>
        </div>
      </footer>
    </div>
  )
}
