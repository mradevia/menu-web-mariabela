// ============================================================================
//  Servicio de MENÚ — capa entre Supabase y la app.
//
//  Punto clave de RETROCOMPATIBILIDAD: la web (app/page.tsx, carrito,
//  featuredDishIds) usa el formato legacy `MenuData = Record<slug, Category>`
//  con `Dish.id` numérico. Aquí reconstruimos ese formato EXACTO desde las
//  tablas `categories` + `products`, usando:
//    - category.slug         -> la KEY del Record
//    - category.sort_order   -> el orden de las categorías
//    - product.legacy_id     -> el `Dish.id` numérico que la web espera
//    - product.sort_order    -> el orden de los platillos dentro de la categoría
//  Así la migración es invisible para el resto de la app.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Json } from "@/lib/supabase/types"
import {
  DEFAULT_SETTINGS,
  type Category,
  type Dish,
  type MenuData,
  type SiteSettings,
} from "@/lib/site-data"

type Client = SupabaseClient<Database>

// ---------------------------------------------------------------------------
//  LECTURA
// ---------------------------------------------------------------------------

/**
 * Lee el menú completo desde Supabase y lo reconstruye en el formato legacy
 * `MenuData` que consume la web. Lanza si hay error (el hook decide el fallback).
 */
export async function fetchMenu(supabase: Client): Promise<MenuData> {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, slug, title, subtitle, icon, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (catError) throw catError

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("legacy_id, category_id, name, description, price, image_url, tags, group_name, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (prodError) throw prodError

  // Agrupar productos por categoría (id uuid) preservando el orden ya aplicado.
  const productsByCategory = new Map<string, Dish[]>()
  for (const p of products ?? []) {
    const dish: Dish = {
      id: p.legacy_id,
      name: p.name,
      price: Number(p.price),
      ingredients: p.description ?? "",
      ...(p.tags && p.tags.length > 0 ? { tags: p.tags } : {}),
      ...(p.image_url ? { image: p.image_url } : {}),
      ...(p.group_name ? { group: p.group_name } : {}),
    }
    const list = productsByCategory.get(p.category_id) ?? []
    list.push(dish)
    productsByCategory.set(p.category_id, list)
  }

  // Reconstruir el Record en el orden de las categorías.
  const menu: MenuData = {}
  for (const c of categories ?? []) {
    const category: Category = {
      title: c.title,
      subtitle: c.subtitle ?? "",
      icon: c.icon,
      items: productsByCategory.get(c.id) ?? [],
    }
    menu[c.slug] = category
  }

  return menu
}

/**
 * Lee la configuración del negocio (fila singleton settings key='business').
 * Se mezcla con DEFAULT_SETTINGS por si faltan campos añadidos después.
 */
export async function fetchSettings(supabase: Client): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "business")
    .maybeSingle()

  if (error) throw error

  const value = (data?.value as Partial<SiteSettings> | null) ?? {}
  return { ...DEFAULT_SETTINGS, ...value }
}

// ---------------------------------------------------------------------------
//  ESCRITURA
//  El admin actual llama saveMenu(TODO_EL_ARBOL). Aquí sincronizamos el árbol
//  completo contra la DB: upsert de categorías/productos y borrado de los que
//  ya no están. Requiere sesión con rol admin/gerente (lo exige la RLS).
// ---------------------------------------------------------------------------

/**
 * Persiste el menú completo. Sincroniza categorías y productos:
 *  - upsert por slug (categorías) y por legacy_id (productos)
 *  - elimina de la DB lo que ya no está en el árbol recibido
 */
export async function saveMenu(supabase: Client, menu: MenuData): Promise<void> {
  const slugs = Object.keys(menu)

  // 1) Upsert categorías con su sort_order = índice en el Record.
  const categoryRows = slugs.map((slug, index) => ({
    slug,
    title: menu[slug].title,
    subtitle: menu[slug].subtitle,
    icon: menu[slug].icon,
    sort_order: index,
    is_active: true,
  }))

  const { data: upsertedCats, error: catError } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, slug")

  if (catError) throw catError

  const catIdBySlug = new Map<string, string>()
  for (const c of upsertedCats ?? []) catIdBySlug.set(c.slug, c.id)

  // 2) Upsert productos con category_id resuelto y sort_order = índice.
  const productRows: {
    legacy_id: number
    category_id: string
    name: string
    description: string
    price: number
    image_url: string | null
    tags: string[]
    group_name: string | null
    sort_order: number
    is_active: boolean
  }[] = []

  const keptLegacyIds: number[] = []

  for (const slug of slugs) {
    const categoryId = catIdBySlug.get(slug)
    if (!categoryId) continue
    menu[slug].items.forEach((item, index) => {
      keptLegacyIds.push(item.id)
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

  if (productRows.length > 0) {
    const { error: prodError } = await supabase
      .from("products")
      .upsert(productRows, { onConflict: "legacy_id" })
    if (prodError) throw prodError
  }

  // 3) Borrar productos que ya no están en el árbol.
  {
    const inList = keptLegacyIds.length > 0 ? keptLegacyIds : [-1]
    const { error } = await supabase
      .from("products")
      .delete()
      .not("legacy_id", "in", `(${inList.join(",")})`)
    if (error) throw error
  }

  // 4) Borrar categorías que ya no están (sus productos ya cayeron por FK/paso 3).
  {
    const keptSlugs = slugs.length > 0 ? slugs : ["__none__"]
    const { error } = await supabase
      .from("categories")
      .delete()
      .not("slug", "in", `(${keptSlugs.map((s) => `"${s}"`).join(",")})`)
    if (error) throw error
  }
}

/** Persiste la configuración del negocio (upsert del jsonb en key='business'). */
export async function saveSettings(supabase: Client, settings: SiteSettings): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "business", value: settings as unknown as Json }, { onConflict: "key" })
  if (error) throw error
}
