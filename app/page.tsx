// ============================================================================
//  Página pública del menú (/) — Server Component.
//
//  Hace el fetch inicial del menú y la configuración en el SERVIDOR (para SEO:
//  el HTML llega con el menú ya renderizado) y se lo pasa al componente cliente
//  MenuClient como datos iniciales. Si la fuente es Supabase, lee de la DB;
//  si algo falla, MenuClient cae a los valores por defecto (la web no se rompe).
// ============================================================================
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import MenuClient from "./MenuClient"
import { fetchMenu, fetchSettings } from "@/lib/services/menu"
import type { Database } from "@/lib/supabase/types"
import type { MenuData, SiteSettings } from "@/lib/site-data"

const USE_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase"

// Revalidar el HTML cacheado cada 60s (y bajo demanda tras editar el menú).
// El menú es público: se lee con la anon key y RLS, SIN cookies de sesión, para
// permitir el cacheo/ISR (usar cookies forzaría render dinámico en cada visita).
export const revalidate = 60

export default async function Page() {
  let initialMenu: MenuData | undefined
  let initialSettings: SiteSettings | undefined

  if (USE_SUPABASE) {
    try {
      const supabase = createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      )
      const [menu, settings] = await Promise.all([
        fetchMenu(supabase),
        fetchSettings(supabase),
      ])
      initialMenu = menu
      initialSettings = settings
    } catch (e) {
      // Si el fetch en el servidor falla, dejamos que el cliente lo intente y,
      // en último caso, use DEFAULT_MENU. Nunca pantalla vacía.
      console.error("Error al cargar el menú en el servidor:", e)
    }
  }

  return <MenuClient initialMenu={initialMenu} initialSettings={initialSettings} />
}
