// ============================================================================
//  /desayunos-coacalco — Página de aterrizaje SEO local.
//  Objetivo: "desayunos Coacalco", "desayuno en Coacalco", "dónde desayunar
//  en Coacalco", "brunch Coacalco". Server Component (HTML estático, rápido).
// ============================================================================
import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Coffee, Egg, Utensils, Check } from "lucide-react"
import LocalPageShell from "@/components/seo/LocalPageShell"
import LocalCTA from "@/components/seo/LocalCTA"
import JsonLd from "@/components/seo/JsonLd"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { buildGraph, breadcrumbSchema, faqSchema } from "@/lib/seo/schema"

export const metadata: Metadata = buildPageMetadata({
  title: "Desayunos en Coacalco | Dónde Desayunar — Maria Bela",
  description:
    "¿Buscas dónde desayunar en Coacalco? En Maria Bela servimos desayunos desde las 8:00 AM: chilaquiles, huevos al gusto, molletes, omelettes, waffles y hotcakes. Restaurante familiar en el centro de Coacalco de Berriozábal.",
  path: "/desayunos-coacalco",
  keywords: [
    "desayunos Coacalco",
    "desayuno en Coacalco",
    "dónde desayunar en Coacalco",
    "brunch Coacalco",
    "restaurante para desayunar Coacalco",
    "chilaquiles Coacalco",
    "cafetería Coacalco",
  ],
})

const FAQS = [
  {
    q: "¿A qué hora abren para desayunar en Coacalco?",
    a: "En Maria Bela abrimos a las 8:00 AM todos los días, así que puedes desayunar temprano de domingo a jueves hasta las 5:00 PM, y viernes y sábado hasta las 10:00 PM.",
  },
  {
    q: "¿Qué desayunos tienen?",
    a: "Ofrecemos huevos al gusto, huevos Mariabela, chilaquiles verdes o rojos, volcán de chilaquiles, molletes, omelettes, enchiladas, enfrijoladas, waffles, hotcakes, croissants, bagels y desayunos especiales como el Desayuno Mexicano.",
  },
  {
    q: "¿Es un buen lugar para desayunar en familia en Coacalco?",
    a: "Sí. Maria Bela es un restaurante familiar en el centro de Coacalco, con ambiente cálido y menú infantil, ideal para desayunar en familia o con amigos.",
  },
  {
    q: "¿Dónde están ubicados para desayunar?",
    a: "Estamos en And. Severiano Reyes 27A, dentro del Palacio Municipal de Coacalco de Berriozábal, C.P. 55700. Muy céntrico y fácil de llegar.",
  },
]

const DESAYUNOS = [
  { name: "Huevos al Gusto", desc: "Estrellados, rancheros, a la mexicana, divorciados o al albañil." },
  { name: "Chilaquiles", desc: "Verdes, rojos o divorciados. También el famoso Volcán de Chilaquiles." },
  { name: "Molletes", desc: "Tradicionales, con chorizo o champiñón, gratinados con pico de gallo." },
  { name: "Omelettes", desc: "Al gusto o gourmet con espinaca y queso de cabra." },
  { name: "Enchiladas y Enfrijoladas", desc: "Verdes, rojas, suizas o enmoladas, rellenas de pollo." },
  { name: "Waffles y Hotcakes", desc: "Dulces con frutos rojos, o el Desayuno Mariabela con huevo." },
]

export default function DesayunosCoacalcoPage() {
  const jsonLd = buildGraph([
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Desayunos en Coacalco", path: "/desayunos-coacalco" },
    ]),
    faqSchema(FAQS),
  ])

  return (
    <LocalPageShell
      crumbs={[
        { name: "Inicio", path: "/" },
        { name: "Desayunos en Coacalco", path: "/desayunos-coacalco" },
      ]}
    >
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="mb-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e9c46a]/20 px-4 py-1 text-sm font-medium text-[#8a6d1f]">
          <Coffee className="h-4 w-4" /> Desayunos desde las 8:00 AM
        </p>
        <h1 className="font-serif text-4xl font-black leading-tight md:text-5xl">
          Desayunos en Coacalco
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d4a41]">
          Si buscas <strong>dónde desayunar en Coacalco</strong>, en Maria Bela encontrarás los
          mejores desayunos mexicanos recién hechos: chilaquiles, huevos al gusto, molletes,
          enchiladas, waffles y hotcakes. Un <strong>restaurante familiar</strong> en el centro de
          Coacalco de Berriozábal, perfecto para empezar el día o para un buen brunch de fin de semana.
        </p>
        <div className="mt-6">
          <LocalCTA whatsappText="¡Hola! Quiero información sobre los desayunos de Maria Bela en Coacalco." />
        </div>
      </section>

      {/* Grid de desayunos */}
      <section className="mb-12">
        <h2 className="mb-6 font-serif text-2xl font-bold">Nuestros desayunos favoritos</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESAYUNOS.map((d) => (
            <article key={d.name} className="rounded-2xl border border-[#e7e0d0] bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0D261C]">
                <Egg className="h-5 w-5 text-[#e9c46a]" /> {d.name}
              </h3>
              <p className="mt-2 text-sm text-[#5b665c]">{d.desc}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[#3d4a41]">
          Y mucho más: revisa la carta completa en nuestro{" "}
          <Link href="/menu" className="font-semibold text-[#0D261C] underline">
            menú de Coacalco
          </Link>
          , o descubre nuestra{" "}
          <Link href="/comida-italiana-coacalco" className="font-semibold text-[#0D261C] underline">
            comida italiana
          </Link>{" "}
          y{" "}
          <Link href="/comida-mexicana-coacalco" className="font-semibold text-[#0D261C] underline">
            comida mexicana
          </Link>{" "}
          para la hora de la comida.
        </p>
      </section>

      {/* Por qué elegirnos */}
      <section className="mb-12 rounded-3xl bg-[#0D261C] p-8 text-[#faf7f0] md:p-12">
        <h2 className="font-serif text-2xl font-bold text-[#e9c46a]">
          ¿Por qué desayunar en Maria Bela?
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Abrimos temprano, a las 8:00 AM, todos los días.",
            "Ingredientes frescos y platillos hechos al momento.",
            "Ambiente familiar en el centro de Coacalco.",
            "Café de olla, capuchinos, jugos naturales y licuados.",
            "Menú infantil para los más pequeños.",
            "Opciones mexicanas e italianas en un mismo lugar.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-[#e6ddca]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e9c46a]" /> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ visible */}
      <section className="mb-8">
        <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold">
          <Utensils className="h-6 w-6 text-[#e9c46a]" /> Preguntas frecuentes
        </h2>
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
