// ============================================================================
//  /comida-mexicana-coacalco — Página de aterrizaje SEO local.
//  Objetivo: "comida mexicana Coacalco", "comida Coacalco", "dónde comer en
//  Coacalco", "comida corrida Coacalco", "restaurante familiar Coacalco".
// ============================================================================
import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Utensils, Beef, Check, Soup } from "lucide-react"
import LocalPageShell from "@/components/seo/LocalPageShell"
import LocalCTA from "@/components/seo/LocalCTA"
import JsonLd from "@/components/seo/JsonLd"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { buildGraph, breadcrumbSchema, faqSchema } from "@/lib/seo/schema"

export const metadata: Metadata = buildPageMetadata({
  title: "Comida Mexicana en Coacalco | Dónde Comer — Maria Bela",
  description:
    "¿Buscas dónde comer en Coacalco? Maria Bela ofrece comida mexicana: enchiladas, chilaquiles, sopes, cortes selectos, arrachera, parrillada, milanesas y más. Restaurante familiar en el centro de Coacalco de Berriozábal.",
  path: "/comida-mexicana-coacalco",
  keywords: [
    "comida mexicana Coacalco",
    "comida Coacalco",
    "dónde comer en Coacalco",
    "comida corrida Coacalco",
    "restaurante familiar Coacalco",
    "mejor restaurante en Coacalco",
    "cortes Coacalco",
  ],
})

const FAQS = [
  {
    q: "¿Dónde comer comida mexicana en Coacalco?",
    a: "En Maria Bela, un restaurante familiar en And. Severiano Reyes 27A (Palacio Municipal), Coacalco de Berriozábal. Servimos platillos mexicanos, cortes y especialidades.",
  },
  {
    q: "¿Qué platillos mexicanos tienen?",
    a: "Enchiladas verdes, rojas, suizas y enmoladas; chilaquiles; sopes; sopa azteca; Desayuno Mexicano; alambre de res; milanesas; y cortes como arrachera, rib eye y new york.",
  },
  {
    q: "¿Tienen cortes de carne y parrilladas?",
    a: "Sí. Contamos con cortes selectos (New York, Rib Eye, Arrachera Premium) y la Parrillada Mariabela para compartir entre 2 personas, con arrachera, pollo, chorizo argentino y más.",
  },
  {
    q: "¿Es buen lugar para comer en familia en Coacalco?",
    a: "Totalmente. Maria Bela es un restaurante familiar en el centro de Coacalco, con ambiente cálido, menú infantil y platillos para compartir. Ideal para comidas familiares y reuniones.",
  },
]

const PLATILLOS = [
  { name: "Enchiladas y Enmoladas", desc: "Verdes, rojas, suizas o bañadas en mole, rellenas de pollo." },
  { name: "Sopes y Chilaquiles", desc: "Sopesitos de pollo o carne asada, y chilaquiles al gusto." },
  { name: "Cortes Selectos", desc: "New York, Rib Eye y Arrachera Premium a la parrilla." },
  { name: "Parrillada Mariabela", desc: "Para compartir: arrachera, pollo, chorizo argentino, nopal y más." },
  { name: "Milanesas", desc: "De res o pollo: natural, gratinada o a la boloñesa." },
  { name: "Sopas Caseras", desc: "Sopa azteca, de champiñón, de cebolla y consomé Mariabela." },
]

export default function ComidaMexicanaCoacalcoPage() {
  const jsonLd = buildGraph([
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Comida Mexicana en Coacalco", path: "/comida-mexicana-coacalco" },
    ]),
    faqSchema(FAQS),
  ])

  return (
    <LocalPageShell
      crumbs={[
        { name: "Inicio", path: "/" },
        { name: "Comida Mexicana en Coacalco", path: "/comida-mexicana-coacalco" },
      ]}
    >
      <JsonLd data={jsonLd} />

      <section className="mb-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#14532d]/10 px-4 py-1 text-sm font-medium text-[#14532d]">
          <Utensils className="h-4 w-4" /> El sabor de México en Coacalco
        </p>
        <h1 className="font-serif text-4xl font-black leading-tight md:text-5xl">
          Comida Mexicana en Coacalco
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d4a41]">
          ¿Buscas <strong>dónde comer en Coacalco</strong>? En Maria Bela sirven auténtica{" "}
          <strong>comida mexicana</strong>: enchiladas, chilaquiles, sopes, cortes selectos,
          arrachera, milanesas y la Parrillada Mariabela para compartir. Un{" "}
          <strong>restaurante familiar</strong> en el centro de Coacalco de Berriozábal, ideal para
          la hora de la comida.
        </p>
        <div className="mt-6">
          <LocalCTA whatsappText="¡Hola! Quiero comer comida mexicana en Maria Bela Coacalco." />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 font-serif text-2xl font-bold">Platillos mexicanos de la casa</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATILLOS.map((p) => (
            <article key={p.name} className="rounded-2xl border border-[#e7e0d0] bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0D261C]">
                <Beef className="h-5 w-5 text-[#e9c46a]" /> {p.name}
              </h3>
              <p className="mt-2 text-sm text-[#5b665c]">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 rounded-3xl bg-[#0D261C] p-8 text-[#faf7f0] md:p-12">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-[#e9c46a]">
          <Soup className="h-6 w-6" /> ¿Por qué Maria Bela es de los mejores restaurantes en Coacalco?
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Cocina mexicana e italiana en un mismo lugar.",
            "Ambiente familiar en pleno centro de Coacalco.",
            "Platillos para compartir y menú infantil.",
            "Cortes selectos y parrilladas.",
            "Abierto todos los días desde las 8:00 AM.",
            "Ubicación céntrica y fácil de llegar.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-[#e6ddca]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e9c46a]" /> {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[#e6ddca]">
          Mira todo lo que ofrecemos en el{" "}
          <Link href="/menu" className="font-semibold text-[#e9c46a] underline">
            menú completo
          </Link>
          , nuestros{" "}
          <Link href="/desayunos-coacalco" className="font-semibold text-[#e9c46a] underline">
            desayunos en Coacalco
          </Link>{" "}
          y la{" "}
          <Link href="/comida-italiana-coacalco" className="font-semibold text-[#e9c46a] underline">
            comida italiana
          </Link>
          .
        </p>
      </section>

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
