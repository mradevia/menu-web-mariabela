import React from "react"
import {
  Coffee,
  Utensils,
  Salad,
  Soup,
  Sandwich,
  Pizza,
  Flame,
  Award,
  Beef,
  Wine,
  IceCream,
  Baby,
} from "lucide-react"

// Mapa de iconos por nombre. Guardamos solo el NOMBRE (texto) en los datos,
// para poder serializarlos en localStorage, y aquí lo convertimos al icono real.
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  Utensils,
  Salad,
  Soup,
  Sandwich,
  Pizza,
  Flame,
  Award,
  Beef,
  Wine,
  IceCream,
  Baby,
}

// Lista de nombres de iconos disponibles para elegir en el panel de administración.
export const ICON_NAMES = Object.keys(ICON_MAP)

// Devuelve el elemento del icono a partir de su nombre. Si no existe, usa Utensils.
export function renderCategoryIcon(iconName: string, className = "w-5 h-5") {
  const Icon = ICON_MAP[iconName] || Utensils
  return <Icon className={className} />
}
