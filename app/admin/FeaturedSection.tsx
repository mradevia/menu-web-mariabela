"use client"

import { useState, useMemo } from "react"
import { Award, Search, X, ChevronUp, ChevronDown, Plus } from "lucide-react"
import type { MenuData, SiteSettings, Dish } from "@/lib/site-data"

interface Props {
  menu: MenuData
  settings: SiteSettings
  saveSettings: (s: SiteSettings) => void
}

// Sección "Recomendación del Chef" dentro de Mi negocio.
// Permite a la jefa elegir a mano qué platillos aparecen en el banner
// destacado de la portada (en vez de que se elijan al azar por etiquetas).
export default function FeaturedSection({ menu, settings, saveSettings }: Props) {
  const [search, setSearch] = useState("")
  const chosenIds = settings.featuredDishIds ?? []

  // Mapa de todos los platillos del menú, con su categoría, para buscarlos y mostrarlos.
  const allDishes = useMemo(() => {
    const list: (Dish & { categoryTitle: string })[] = []
    for (const cat of Object.values(menu)) {
      for (const item of cat.items) {
        list.push({ ...item, categoryTitle: cat.title })
      }
    }
    return list
  }, [menu])

  const byId = useMemo(() => new Map(allDishes.map((d) => [d.id, d])), [allDishes])

  const chosenDishes = chosenIds.map((id) => byId.get(id)).filter(Boolean) as (Dish & { categoryTitle: string })[]

  const term = search.trim().toLowerCase()
  const searchResults = term
    ? allDishes.filter((d) => !chosenIds.includes(d.id) && d.name.toLowerCase().includes(term)).slice(0, 8)
    : []

  const persist = (ids: number[]) => {
    saveSettings({ ...settings, featuredDishIds: ids })
  }

  const addDish = (id: number) => {
    persist([...chosenIds, id])
    setSearch("")
  }

  const removeDish = (id: number) => {
    persist(chosenIds.filter((i) => i !== id))
  }

  const moveDish = (index: number, dir: -1 | 1) => {
    const next = [...chosenIds]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    persist(next)
  }

  const clearAll = () => {
    if (chosenDishes.length === 0) return
    if (confirm("¿Quitar todos los platillos elegidos? El banner volverá a mostrar destacados automáticos.")) {
      persist([])
    }
  }

  const isAutomatic = chosenIds.length === 0

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
      <div className="flex items-center gap-2 text-[#0D261C]">
        <Award size={18} className="text-[#D4AF37]" />
        <h3 className="font-bold">Recomendación del Chef / Platillo del día</h3>
      </div>
      <p className="text-xs text-stone-500 -mt-2">
        Elige a mano qué platillos aparecen en el banner destacado de la portada. Si no eliges
        ninguno, se muestran algunos destacados automáticamente.
      </p>

      {isAutomatic && (
        <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-3 text-xs text-stone-500">
          Ahora mismo el banner está en modo <strong>automático</strong>: muestra 3 platillos al
          azar entre los que tengan una etiqueta destacada. Agrega un platillo abajo para tomar el
          control manual.
        </div>
      )}

      {/* Buscador para agregar */}
      <div>
        <label className="block text-sm font-bold text-[#0D261C] mb-1.5">Agregar un platillo</label>
        <div className="relative">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 rounded-xl px-3 focus-within:border-[#D4AF37]">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escribe el nombre de un platillo..."
              className="w-full py-3 bg-transparent outline-none text-sm"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => addDish(dish.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 text-left border-b border-stone-100 last:border-0"
                >
                  {dish.image ? (
                    <img src={dish.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-stone-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0D261C] truncate">{dish.name}</p>
                    <p className="text-xs text-stone-400 truncate">{dish.categoryTitle}</p>
                  </div>
                  <Plus size={16} className="text-[#D4AF37] shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de elegidos */}
      {chosenDishes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#0D261C]">
              Platillos elegidos ({chosenDishes.length})
            </label>
            <button onClick={clearAll} className="text-xs text-stone-400 hover:text-red-500 font-bold">
              Quitar todos
            </button>
          </div>
          {chosenDishes.map((dish, index) => (
            <div
              key={dish.id}
              className="flex items-center gap-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100"
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-[#0D261C] text-[#D4AF37] text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              {dish.image ? (
                <img src={dish.image} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-stone-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0D261C] truncate">{dish.name}</p>
                <p className="text-xs text-stone-400 truncate">{dish.categoryTitle} · ${dish.price}</p>
              </div>
              <div className="flex flex-col shrink-0">
                <button
                  onClick={() => moveDish(index, -1)}
                  disabled={index === 0}
                  className="text-stone-300 hover:text-[#0D261C] disabled:opacity-30"
                  title="Subir"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveDish(index, 1)}
                  disabled={index === chosenDishes.length - 1}
                  className="text-stone-300 hover:text-[#0D261C] disabled:opacity-30"
                  title="Bajar"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <button
                onClick={() => removeDish(dish.id)}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Quitar"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
