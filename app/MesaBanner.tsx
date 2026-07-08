"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { findTableByToken } from "@/lib/services/tables"

// Claves donde guardamos la mesa activa para que el checkout la incluya.
export const MESA_STORAGE_KEY = "mariabela-mesa"
export const MESA_TOKEN_STORAGE_KEY = "mariabela-mesa-token"

/**
 * Detecta ?mesa=<token> en la URL (cuando el cliente escanea el QR de una mesa),
 * resuelve el número de mesa y lo guarda en sessionStorage para que el checkout
 * lo incluya en el pedido. Muestra un banner discreto "Estás en la Mesa X".
 * Es un componente aislado: no toca la lógica del menú.
 */
export default function MesaBanner() {
  const [mesa, setMesa] = useState<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("mesa")
    if (!token) {
      // Si no hay token en la URL, limpiamos cualquier mesa previa.
      sessionStorage.removeItem(MESA_STORAGE_KEY)
      sessionStorage.removeItem(MESA_TOKEN_STORAGE_KEY)
      return
    }

    const supabase = createClient()
    findTableByToken(supabase, token)
      .then((table) => {
        if (table) {
          setMesa(table.number)
          sessionStorage.setItem(MESA_STORAGE_KEY, String(table.number))
          sessionStorage.setItem(MESA_TOKEN_STORAGE_KEY, token)
        }
      })
      .catch((e) => console.error("Error al resolver la mesa del QR:", e))
  }, [])

  if (mesa == null) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[55] bg-[#0D261C] text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-[#D4AF37]/40">
      <MapPin size={15} className="text-[#D4AF37]" />
      <span className="text-sm font-bold">Estás en la Mesa {mesa}</span>
    </div>
  )
}
