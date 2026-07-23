/**
 * ============================================================================
 *  Sincroniza el menú de `lib/site-data.ts` (DEFAULT_MENU) hacia Supabase.
 *
 *  DEFAULT_MENU es la carta "de fábrica". Este script la vuelca a las tablas
 *  `categories` + `products` para que la web (que en modo supabase lee de la
 *  base de datos) muestre exactamente esa carta.
 *
 *  Reglas:
 *    - categorías: upsert por `slug`, `sort_order` = orden en el objeto.
 *    - platillos:  upsert por `legacy_id`, `sort_order` = orden en el array.
 *    - platillos dados de baja (ya no están en DEFAULT_MENU):
 *        · si NINGÚN pedido los referencia -> se borran.
 *        · si algún pedido los referencia  -> se marcan is_active = false
 *          (la web deja de mostrarlos y el historial de pedidos se conserva;
 *          order_items.product_id es ON DELETE RESTRICT).
 *
 *  Es idempotente: correrlo dos veces deja el mismo resultado.
 *
 *  Requiere en .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL
 *    SUPABASE_SERVICE_ROLE_KEY   (secreta, del dashboard)
 *
 *  Uso:
 *    npm run sync-menu           (aplica los cambios)
 *    npm run sync-menu -- --dry  (solo muestra lo que haría)
 * ============================================================================
 */
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { DEFAULT_MENU } from "../lib/site-data"

config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const DRY_RUN = process.argv.includes("--dry")

function fail(msg: string): never {
  console.error("\n❌ " + msg + "\n")
  process.exit(1)
}

if (!url) fail("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
if (!serviceKey || serviceKey === "PENDIENTE_PEGAR_DESDE_DASHBOARD")
  fail(
    "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
      "   Pégala desde: Supabase Dashboard → Project Settings → API → service_role",
  )

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const slugs = Object.keys(DEFAULT_MENU)
  const totalPlatillos = slugs.reduce((n, s) => n + DEFAULT_MENU[s].items.length, 0)

  console.log(`\n🍝 Sincronizando menú → Supabase${DRY_RUN ? "  (DRY RUN, no escribe)" : ""}`)
  console.log(`   ${slugs.length} categorías · ${totalPlatillos} platillos\n`)

  // --- Validación previa: ids duplicados romperían el upsert en silencio ----
  const vistos = new Map<number, string>()
  for (const slug of slugs) {
    for (const item of DEFAULT_MENU[slug].items) {
      const previo = vistos.get(item.id)
      if (previo) fail(`id duplicado ${item.id}: "${previo}" y "${item.name}" (${slug})`)
      vistos.set(item.id, item.name)
    }
  }

  // --- Validación previa: las subsecciones deben ser contiguas --------------
  // La web pinta un subtítulo cada vez que cambia `group`; si una subsección
  // aparece en dos bloques separados, el subtítulo saldría repetido.
  for (const slug of slugs) {
    const cerrados = new Set<string>()
    let anterior: string | undefined
    for (const item of DEFAULT_MENU[slug].items) {
      if (item.group === anterior) continue
      if (item.group && cerrados.has(item.group))
        fail(
          `la subsección "${item.group}" de "${slug}" está partida en dos bloques ` +
            `(reaparece en "${item.name}"). Junta esos platillos en el array.`,
        )
      if (anterior) cerrados.add(anterior)
      anterior = item.group
    }
  }

  // --- 1) Categorías --------------------------------------------------------
  const categoryRows = slugs.map((slug, index) => ({
    slug,
    title: DEFAULT_MENU[slug].title,
    subtitle: DEFAULT_MENU[slug].subtitle,
    icon: DEFAULT_MENU[slug].icon,
    sort_order: index,
    is_active: true,
  }))

  if (DRY_RUN) {
    const { data: existentes } = await supabase.from("categories").select("id, slug")
    const catIdBySlugDry = new Map((existentes ?? []).map((c) => [c.slug, c.id]))
    console.log(`   [dry] upsert de ${categoryRows.length} categorías`)
    await reportarPlatillos(catIdBySlugDry)
    return
  }

  const { data: upsertedCats, error: catError } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, slug")

  if (catError) fail("Error al guardar categorías: " + catError.message)
  console.log(`✅ ${upsertedCats?.length ?? 0} categorías sincronizadas.`)

  const catIdBySlug = new Map<string, string>()
  for (const c of upsertedCats ?? []) catIdBySlug.set(c.slug, c.id)

  // --- 2) Platillos ---------------------------------------------------------
  const productRows: Record<string, unknown>[] = []
  const idsVigentes: number[] = []

  for (const slug of slugs) {
    const categoryId = catIdBySlug.get(slug)
    if (!categoryId) fail(`No se resolvió el id de la categoría "${slug}"`)
    DEFAULT_MENU[slug].items.forEach((item, index) => {
      idsVigentes.push(item.id)
      productRows.push({
        legacy_id: item.id,
        category_id: categoryId,
        name: item.name,
        description: item.ingredients ?? "",
        price: item.price,
        image_url: item.image ?? null,
        tags: item.tags ?? [],
        group_name: item.group ?? null,
        sort_order: index,
        is_active: true,
      })
    })
  }

  const { error: prodError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "legacy_id" })

  if (prodError) fail("Error al guardar platillos: " + prodError.message)
  console.log(`✅ ${productRows.length} platillos sincronizados.`)

  // --- 3) Bajas: borrar o desactivar ---------------------------------------
  const { data: sobrantes, error: sobrantesError } = await supabase
    .from("products")
    .select("id, legacy_id, name")
    .not("legacy_id", "in", `(${idsVigentes.join(",")})`)

  if (sobrantesError) fail("Error al buscar platillos dados de baja: " + sobrantesError.message)

  if (!sobrantes || sobrantes.length === 0) {
    console.log("✅ Sin platillos que dar de baja.")
  } else {
    // ¿Cuáles están referenciados por algún pedido? Esos no se pueden borrar.
    const { data: referencias, error: refError } = await supabase
      .from("order_items")
      .select("product_id")
      .in(
        "product_id",
        sobrantes.map((p) => p.id),
      )

    if (refError) fail("Error al revisar pedidos: " + refError.message)

    const conPedidos = new Set((referencias ?? []).map((r) => r.product_id))
    const aDesactivar = sobrantes.filter((p) => conPedidos.has(p.id))
    const aBorrar = sobrantes.filter((p) => !conPedidos.has(p.id))

    if (aBorrar.length > 0) {
      const { error } = await supabase
        .from("products")
        .delete()
        .in(
          "id",
          aBorrar.map((p) => p.id),
        )
      if (error) fail("Error al borrar platillos dados de baja: " + error.message)
      console.log(`🗑️  ${aBorrar.length} platillos borrados (sin pedidos asociados):`)
      for (const p of aBorrar) console.log(`      · ${p.name} (id ${p.legacy_id})`)
    }

    if (aDesactivar.length > 0) {
      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .in(
          "id",
          aDesactivar.map((p) => p.id),
        )
      if (error) fail("Error al desactivar platillos: " + error.message)
      console.log(`🚫 ${aDesactivar.length} platillos desactivados (tienen pedidos en el historial):`)
      for (const p of aDesactivar) console.log(`      · ${p.name} (id ${p.legacy_id})`)
    }
  }

  // --- 4) Categorías dadas de baja -----------------------------------------
  const { data: catsSobrantes, error: catDelError } = await supabase
    .from("categories")
    .select("id, slug")
    .not("slug", "in", `(${slugs.map((s) => `"${s}"`).join(",")})`)

  if (catDelError) fail("Error al buscar categorías dadas de baja: " + catDelError.message)

  if (catsSobrantes && catsSobrantes.length > 0) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .in(
        "id",
        catsSobrantes.map((c) => c.id),
      )
    if (error) fail("Error al borrar categorías: " + error.message)
    console.log(`🗑️  ${catsSobrantes.length} categorías borradas.`)
  }

  console.log("\n🎉 Menú sincronizado.\n")
}

async function reportarPlatillos(catIdBySlug: Map<string, string>) {
  const slugs = Object.keys(DEFAULT_MENU)
  const idsVigentes = slugs.flatMap((s) => DEFAULT_MENU[s].items.map((i) => i.id))
  const { data: sobrantes } = await supabase
    .from("products")
    .select("legacy_id, name")
    .not("legacy_id", "in", `(${idsVigentes.join(",")})`)
  console.log(`   [dry] upsert de ${idsVigentes.length} platillos`)
  console.log(`   [dry] ${sobrantes?.length ?? 0} platillos quedarían dados de baja:`)
  for (const p of sobrantes ?? []) console.log(`         · ${p.name} (id ${p.legacy_id})`)
  console.log(`   [dry] categorías ya existentes en la DB: ${catIdBySlug.size}`)
}

main().catch((e) => fail(String(e)))
