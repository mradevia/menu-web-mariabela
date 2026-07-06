"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DEFAULT_MENU,
  DEFAULT_SETTINGS,
  type MenuData,
  type SiteSettings,
} from "@/lib/site-data"

const MENU_KEY = "mariabela-menu-data"
const SETTINGS_KEY = "mariabela-settings-data"

// Evento personalizado para que la página pública y el admin se sincronicen
// dentro de la misma pestaña cuando algo cambia.
const SYNC_EVENT = "mariabela-data-updated"

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

/**
 * Hook central de datos del sitio.
 * Lee de localStorage (con los datos por defecto como respaldo) y expone
 * funciones para guardar los cambios. Se usa tanto en la página pública
 * como en el panel de administración.
 */
export function useSiteData() {
  const [menu, setMenuState] = useState<MenuData>(DEFAULT_MENU)
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  // Carga inicial + suscripción a cambios (misma pestaña y otras pestañas).
  useEffect(() => {
    const refresh = () => {
      setMenuState(loadMenu())
      setSettingsState(loadSettings())
    }
    refresh()
    setLoaded(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === MENU_KEY || e.key === SETTINGS_KEY) refresh()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(SYNC_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(SYNC_EVENT, refresh)
    }
  }, [])

  const saveMenu = useCallback((next: MenuData) => {
    setMenuState(next)
    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(SYNC_EVENT))
    } catch (e) {
      console.error("Error al guardar el menú:", e)
    }
  }, [])

  const saveSettings = useCallback((next: SiteSettings) => {
    // Siempre completamos con los valores por defecto, por si el objeto
    // recibido viene de un estado anterior sin campos agregados después.
    const complete = { ...DEFAULT_SETTINGS, ...next }
    setSettingsState(complete)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(complete))
      window.dispatchEvent(new Event(SYNC_EVENT))
    } catch (e) {
      console.error("Error al guardar la configuración:", e)
    }
  }, [])

  // Restaura TODO a los valores originales de fábrica.
  const resetAll = useCallback(() => {
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
