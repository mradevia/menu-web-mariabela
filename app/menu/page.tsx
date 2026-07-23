// ============================================================================
//  /menu — Carta completa en HTML estático (SEO-first).
//  Renderiza TODO el menú con precios como texto crawleable (rich result de
//  menú + keywords naturales de platillos). Complementa el menú interactivo
//  del home. Server Component: rápido, cacheable y perfecto para indexar.
// ============================================================================
import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import LocalPageShell from "@/components/seo/LocalPageShell"
import LocalCTA from "@/components/seo/LocalCTA"
import JsonLd from "@/components/seo/JsonLd"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { buildGraph, menuSchema, breadcrumbSchema } from "@/lib/seo/schema"
import { fetchMenu } from "@/lib/services/menu"
import { DEFAULT_MENU, type MenuData } from "@/lib/site-data"
import type { Database } from "@/lib/supabase/types"

export const revalidate = 60

const USE_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase"

export const metadata: Metadata = buildPageMetadata({
  title: "Menú y Carta | Precios — Maria Bela Restaurante en Coacalco",
  description:
    "Consulta el menú completo de Maria Bela en Coacalco: desayunos, entradas, ensaladas, pastas, pizzas, cortes selectos, especialidades, bebidas y postres, con precios actualizados.",
  path: "/menu",
  keywords: [
    "menú Maria Bela",
    "carta Maria Bela Coacalco",
    "precios restaurante Coacalco",
    "menú restaurante Coacalco",
    "pasta Coacalco",
    "pizza Coacalco",
  ],
})

async function loadMenu(): Promise<MenuData> {
  if (!USE_SUPABASE) return DEFAULT_MENU
  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )
    return await fetchMenu(supabase)
  } catch {
    return DEFAULT_MENU
  }
}

const peso = (n: number) => `$${n.toFixed(0)}`

export default async function MenuPage() {
  const menu = await loadMenu()
  const categories = Object.entries(menu)

  const jsonLd = buildGraph([
    menuSchema(menu),
    breadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Menú", path: "/menu" },
    ]),
  ])

  return (
    <LocalPageShell
      crumbs={[
        { name: "Inicio", path: "/" },
        { name: "Menú", path: "/menu" },
      ]}
    >
      <JsonLd data={jsonLd} />

      <section className="mb-10">
        <h1 className="font-serif text-4xl font-black leading-tight md:text-5xl">
          Menú de Maria Bela — Restaurante en Coacalco
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#3d4a41]">
          Esta es la carta completa de Maria Bela, con precios actualizados. Comida mexicana e
          italiana en el centro de Coacalco: desayunos, pastas, pizzas, cortes selectos y más. Para
          pedir en línea, usa el{" "}
          <Link href="/" className="font-semibold text-[#0D261C] underline">
            menú interactivo
          </Link>
          .
        </p>
        <div className="mt-6">
          <LocalCTA whatsappText="¡Hola! Vi el menú de Maria Bela y quiero hacer un pedido." />
        </div>
      </section>

      {/* Índice de categorías (interlinking interno / anclas) */}
      <nav aria-label="Categorías del menú" className="mb-10 flex flex-wrap gap-2">
        {categories.map(([key, cat]) => (
          <a
            key={key}
            href={`#${key}`}
            className="rounded-full border border-[#e7e0d0] bg-white px-4 py-1.5 text-sm font-medium text-[#0D261C] shadow-sm hover:bg-[#0D261C] hover:text-[#e9c46a] transition"
          >
            {cat.title}
          </a>
        ))}
      </nav>

      {/* Carta completa */}
      <div className="space-y-12">
        {categories.map(([key, cat]) => (
          <section key={key} id={key} className="scroll-mt-24">
            <header className="mb-5 border-b border-[#e7e0d0] pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#0D261C]">{cat.title}</h2>
              <p className="text-sm text-[#7c8b7f]">{cat.subtitle}</p>
            </header>
            <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              {cat.items.map((dish) => (
                <li key={dish.id} className="flex justify-between gap-4 border-b border-dashed border-[#ece5d5] pb-3">
                  <div>
                    <h3 className="font-semibold text-[#0D261C]">{dish.name}</h3>
                    <p className="mt-0.5 text-sm text-[#5b665c]">{dish.ingredients}</p>
                  </div>
                  <span className="shrink-0 font-serif font-bold text-[#7c2d12]">{peso(dish.price)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-[#7c8b7f]">
        Precios en pesos mexicanos (MXN). Sujetos a cambio sin previo aviso. Consulta también
        nuestros{" "}
        <Link href="/desayunos-coacalco" className="underline">
          desayunos en Coacalco
        </Link>
        ,{" "}
        <Link href="/comida-italiana-coacalco" className="underline">
          comida italiana
        </Link>{" "}
        y{" "}
        <Link href="/comida-mexicana-coacalco" className="underline">
          comida mexicana
        </Link>
        .
      </p>
    </LocalPageShell>
  )
}
