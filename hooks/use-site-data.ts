"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DEFAULT_MENU,
  DEFAULT_SETTINGS,
  type MenuData,
  type SiteSettings,
} from "@/lib/site-data"
import { createClient } from "@/lib/supabase/client"
import {
  fetchMenu,
  fetchSettings,
  saveMenu as saveMenuToDb,
  saveSettings as saveSettingsToDb,
} from "@/lib/services/menu"

const MENU_KEY = "mariabela-menu-data"
const SETTINGS_KEY = "mariabela-settings-data"

// Evento personalizado para que la página pública y el admin se sincronicen
// dentro de la misma pestaña cuando algo cambia.
const SYNC_EVENT = "mariabela-data-updated"

// Feature flag: 'supabase' => la web usa la base de datos; cualquier otro
// valor (o ausencia) => comportamiento original con localStorage.
const USE_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase"

function loadMenu(): MenuData {
  if (typeof window === "undefined") return DEFAULT_MENU
  try {
    const raw = localStorage.getItem(MENU_KEY)
    if (raw) return JSON.parse(raw) as MenuData
  } catch (e) {
    console.error("Error al cargar el menú guardado:", e)
  }
  return DEFAULT_MENU
}

function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      // Mezclamos con los valores por defecto por si se agregaron campos nuevos.
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SiteSettings) }
    }
  } catch (e) {
    console.error("Error al cargar la configuración guardada:", e)
  }
  return DEFAULT_SETTINGS
}

// Guarda una copia en localStorage como caché (solo modo Supabase). Nunca es
// la fuente de la verdad, pero permite pintar al instante y sobrevivir a un
// fallo de red.
function cacheLocally(menu: MenuData, settings: SiteSettings) {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // localStorage lleno o no disponible: ignorar, no es crítico.
  }
}

/**
 * Hook central de datos del sitio.
 *
 * Expone SIEMPRE la misma interfaz — { menu, settings, loaded, saveMenu,
 * saveSettings, resetAll } — sin importar la fuente de datos. Así ni la página
 * pública ni el panel de administración necesitan cambiar.
 *
 *  - NEXT_PUBLIC_DATA_SOURCE = 'supabase' -> lee/escribe en Supabase (con
 *    localStorage como caché y respaldo si la red falla).
 *  - cualquier otro valor -> comportamiento original 100% con localStorage.
 *
 * `initial` permite recibir datos ya cargados en el servidor (SSR) para pintar
 * sin parpadeo; si se pasa, arranca como cargado.
 */
export function useSiteData(initial?: { menu?: MenuData; settings?: SiteSettings }) {
  const [menu, setMenuState] = useState<MenuData>(initial?.menu ?? DEFAULT_MENU)
  const [settings, setSettingsState] = useState<SiteSettings>(
    initial?.settings ?? DEFAULT_SETTINGS,
  )
  const [loaded, setLoaded] = useState(Boolean(initial?.menu))

  // Carga inicial + suscripción a cambios (misma pestaña y otras pestañas).
  useEffect(() => {
    let cancelled = false

    const refreshFromLocal = () => {
      setMenuState(loadMenu())
      setSettingsState(loadSettings())
    }

    if (USE_SUPABASE) {
      const supabase = createClient()

      // 1) Pintado instantáneo desde la caché local (si existe) mientras llega
      //    la respuesta de la DB. Evita pantalla vacía.
      if (!initial?.menu) refreshFromLocal()

      // 2) Fuente de la verdad: Supabase.
      const load = async () => {
        try {
          const [dbMenu, dbSettings] = await Promise.all([
            fetchMenu(supabase),
            fetchSettings(supabase),
          ])
          if (cancelled) return
          setMenuState(dbMenu)
          setSettingsState(dbSettings)
          cacheLocally(dbMenu, dbSettings)
        } catch (e) {
          // Si la DB falla, nos quedamos con la caché local o los defaults:
          // la web nunca se cae.
          console.error("Error al cargar datos desde Supabase:", e)
        } finally {
          if (!cancelled) setLoaded(true)
        }
      }
      load()

      // 3) Realtime: cambios en el menú se reflejan en todos los dispositivos.
      const channel = supabase
        .channel("menu-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
        .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, load)
        .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, load)
        .subscribe()

      // Sincronía intra-pestaña (cuando este mismo cliente guarda algo).
      const onSync = () => load()
      window.addEventListener(SYNC_EVENT, onSync)

      return () => {
        cancelled = true
        window.removeEventListener(SYNC_EVENT, onSync)
        supabase.removeChannel(channel)
      }
    }

    // --- Modo localStorage (comportamiento original) -------------------------
    refreshFromLocal()
    setLoaded(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === MENU_KEY || e.key === SETTINGS_KEY) refreshFromLocal()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(SYNC_EVENT, refreshFromLocal)
    return () => {
      cancelled = true
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(SYNC_EVENT, refreshFromLocal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveMenu = useCallback((next: MenuData) => {
    // Actualización optimista: la UI cambia al instante.
    setMenuState(next)

    if (USE_SUPABASE) {
      const supabase = createClient()
      cacheLocally(next, settings)
      saveMenuToDb(supabase, next)
        .then(() => window.dispatchEvent(new Event(SYNC_EVENT)))
        .catch((e) => console.error("Error al guardar el menú en Supabase:", e))
      return
    }

    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(SYNC_EVENT))
    } catch (e) {
      console.error("Error al guardar el menú:", e)
    }
  }, [settings])

  const saveSettings = useCallback((next: SiteSettings) => {
    // Siempre completamos con los valores por defecto, por si el objeto
    // recibido viene de un estado anterior sin campos agregados después.
    const complete = { ...DEFAULT_SETTINGS, ...next }
    setSettingsState(complete)

    if (USE_SUPABASE) {
      const supabase = createClient()
      cacheLocally(menu, complete)
      saveSettingsToDb(supabase, complete)
        .then(() => window.dispatchEvent(new Event(SYNC_EVENT)))
        .catch((e) => console.error("Error al guardar la configuración en Supabase:", e))
      return
    }

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(complete))
      window.dispatchEvent(new Event(SYNC_EVENT))
    } catch (e) {
      console.error("Error al guardar la configuración:", e)
    }
  }, [menu])

  // Restaura los valores originales de fábrica.
  //  - En modo local: borra las claves y vuelve a DEFAULT_* (como antes).
  //  - En modo Supabase: NO destruye la base de datos; solo descarta la caché
  //    local y recarga desde la DB (la fuente de la verdad).
  const resetAll = useCallback(() => {
    if (USE_SUPABASE) {
      try {
        localStorage.removeItem(MENU_KEY)
        localStorage.removeItem(SETTINGS_KEY)
      } catch {
        /* noop */
      }
      window.dispatchEvent(new Event(SYNC_EVENT)) // dispara recarga desde DB
      return
    }

    try {
      localStorage.removeItem(MENU_KEY)
      localStorage.removeItem(SETTINGS_KEY)
    } catch (e) {
      console.error("Error al restablecer:", e)
    }
    setMenuState(DEFAULT_MENU)
    setSettingsState(DEFAULT_SETTINGS)
    window.dispatchEvent(new Event(SYNC_EVENT))
  }, [])

  return { menu, settings, loaded, saveMenu, saveSettings, resetAll }
}
