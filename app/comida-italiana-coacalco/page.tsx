// ============================================================================
//  /comida-italiana-coacalco — Página de aterrizaje SEO local.
//  Objetivo: "comida italiana Coacalco", "restaurante italiano Coacalco",
//  "pasta Coacalco", "pizza Coacalco".
// ============================================================================
import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Pizza, Wheat, Check, Utensils } from "lucide-react"
import LocalPageShell from "@/components/seo/LocalPageShell"
import LocalCTA from "@/components/seo/LocalCTA"
import JsonLd from "@/components/seo/JsonLd"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { buildGraph, breadcrumbSchema, faqSchema } from "@/lib/seo/schema"

export const metadata: Metadata = buildPageMetadata({
  title: "Comida Italiana en Coacalco | Pastas y Pizzas — Maria Bela",
  description:
    "Restaurante italiano en Coacalco. Pastas artesanales (lasaña, carbonara, alfredo, pesto), pizzas al horno de masa delgada, y especialidades italianas. Maria Bela, en el centro de Coacalco de Berriozábal.",
  path: "/comida-italiana-coacalco",
  keywords: [
    "comida italiana Coacalco",
    "restaurante italiano Coacalco",
    "pasta Coacalco",
    "pizza Coacalco",
    "pizzas Coacalco",
    "lasaña Coacalco",
    "restaurante de pastas Coacalco",
  ],
})

const FAQS = [
  {
    q: "¿Dónde comer comida italiana en Coacalco?",
    a: "En Maria Bela, en And. Severiano Reyes 27A (Palacio Municipal), Coacalco de Berriozábal. Servimos pastas artesanales, pizzas al horno y especialidades italianas.",
  },
  {
    q: "¿Qué pastas tienen?",
    a: "Lasaña boloñesa, carbonara, alfredo, al pesto, arrabbiata, pomodoro, cuatro quesos, frutti di mare, pasta salmone, Pasta Mariabela y muchas más, todas preparadas al momento.",
  },
  {
    q: "¿Hacen pizzas en Coacalco?",
    a: "Sí, pizzas de masa delgada y crujiente al horno: pepperoni, napolitana, prosciutto, hawaiana, camarón, cuatro quesos, boloñesa y la Pizza Mariabela.",
  },
  {
    q: "¿Tienen opciones vegetarianas italianas?",
    a: "Sí: pasta vegetariana, melanzane alla parmigiana, portobello relleno, ensalada caprese y pizzas sin carne, entre otras.",
  },
]

const PASTAS = [
  "Lasaña Boloñesa", "Carbonara", "Alfredo", "Al Pesto",
  "Arrabbiata", "Pomodoro", "Frutti di Mare", "Cuatro Quesos",
  "Pasta Salmone", "Pasta Mariabela", "Aglio e Olio", "Vegetariana",
]
const PIZZAS = [
  "Pepperoni", "Napolitana", "Prosciutto", "Hawaiana",
  "Camarón", "Cuatro Quesos", "Boloñesa", "Mariabela",
]

export default function ComidaItalianaCoacalcoPage() {
  const jsonLd = buildGraph([
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Comida Italiana en Coacalco", path: "/comida-italiana-coacalco" },
    ]),
    faqSchema(FAQS),
  ])

  return (
    <LocalPageShell
      crumbs={[
        { name: "Inicio", path: "/" },
        { name: "Comida Italiana en Coacalco", path: "/comida-italiana-coacalco" },
      ]}
    >
      <JsonLd data={jsonLd} />

      <section className="mb-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#7c2d12]/10 px-4 py-1 text-sm font-medium text-[#7c2d12]">
          <Pizza className="h-4 w-4" /> La cucina italiana en Coacalco
        </p>
        <h1 className="font-serif text-4xl font-black leading-tight md:text-5xl">
          Comida Italiana en Coacalco
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d4a41]">
          Maria Bela es tu <strong>restaurante italiano en Coacalco</strong>: pastas artesanales
          preparadas al momento, <strong>pizzas al horno</strong> de masa delgada y crujiente, y
          especialidades de la <em>cucina</em> italiana. Todo en el centro de Coacalco de Berriozábal,
          donde el alma de Italia se encuentra con el corazón de México.
        </p>
        <div className="mt-6">
          <LocalCTA whatsappText="¡Hola! Quiero pedir comida italiana (pastas / pizzas) en Maria Bela Coacalco." />
        </div>
      </section>

      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#e7e0d0] bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Wheat className="h-6 w-6 text-[#e9c46a]" /> Pastas artesanales
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#3d4a41]">
            {PASTAS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#7c2d12]" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-[#e7e0d0] bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
            <Pizza className="h-6 w-6 text-[#e9c46a]" /> Pizzas al horno
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#3d4a41]">
            {PIZZAS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#7c2d12]" /> Pizza {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-12 rounded-3xl bg-[#0D261C] p-8 text-[#faf7f0] md:p-12">
        <h2 className="font-serif text-2xl font-bold text-[#e9c46a]">
          Sabor italiano auténtico en Coacalco
        </h2>
        <p className="mt-3 max-w-3xl text-[#e6ddca]">
          Nuestras salsas se preparan con recetas de la tradición italiana: pomodoro con albahaca
          fresca, pesto de piñón, salsas cremosas al vino blanco y nuestra lasaña boloñesa, un
          best-seller de la casa. Acompaña tu pasta o pizza con una copa de vino o un clericot. Ideal
          para una comida en pareja, en familia o para reuniones con amigos.
        </p>
        <p className="mt-4 text-[#e6ddca]">
          ¿Prefieres sabor mexicano? Descubre también nuestra{" "}
          <Link href="/comida-mexicana-coacalco" className="font-semibold text-[#e9c46a] underline">
            comida mexicana en Coacalco
          </Link>{" "}
          o consulta el{" "}
          <Link href="/menu" className="font-semibold text-[#e9c46a] underline">
            menú completo
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
