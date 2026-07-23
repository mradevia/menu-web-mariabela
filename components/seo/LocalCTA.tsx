// ============================================================================
//  <LocalCTA> — Botonera de acción reutilizable para las páginas SEO locales.
//  Cómo llegar (Google Maps), WhatsApp y Reservar. Refuerza señales locales.
// ============================================================================
import React from "react"
import Link from "next/link"
import { MapPin, MessageCircle, CalendarDays } from "lucide-react"
import { BUSINESS } from "@/lib/seo/business"

export default function LocalCTA({ whatsappText }: { whatsappText?: string }) {
  const waHref = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(
    whatsappText || "¡Hola Maria Bela! Me gustaría hacer un pedido / reservar una mesa.",
  )}`

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={BUSINESS.googleMapsDirections}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#0D261C] px-6 py-3 text-sm font-semibold text-[#e9c46a] shadow-md transition hover:bg-[#123a2b]"
      >
        <MapPin className="h-4 w-4" /> Cómo llegar
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-95"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <Link
        href="/reservar"
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#0D261C] px-6 py-3 text-sm font-semibold text-[#0D261C] transition hover:bg-[#0D261C] hover:text-[#e9c46a]"
      >
        <CalendarDays className="h-4 w-4" /> Reservar mesa
      </Link>
    </div>
  )
}
