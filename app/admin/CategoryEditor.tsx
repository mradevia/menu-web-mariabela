"use client"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { ICON_NAMES, renderCategoryIcon } from "@/lib/icons"
import type { Category } from "@/lib/site-data"

interface Props {
  category: (Category & { key: string }) | null // null = crear nueva
  existingKeys: string[]
  onSave: (data: { key: string; title: string; subtitle: string; icon: string }, originalKey?: string) => void
  onClose: () => void
}

// Genera una "llave" interna a partir del título (sin espacios ni acentos).
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function CategoryEditor({ category, existingKeys, onSave, onClose }: Props) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [icon, setIcon] = useState("Utensils")

  useEffect(() => {
    setTitle(category?.title ?? "")
    setSubtitle(category?.subtitle ?? "")
    setIcon(category?.icon ?? "Utensils")
  }, [category])

  const handleSave = () => {
    if (!title.trim()) {
      alert("Escribe el nombre de la sección.")
      return
    }
    const originalKey = category?.key
    let key = originalKey ?? slugify(title)
    if (!key) key = "seccion-" + Date.now()

    // Evita llaves duplicadas al crear una sección nueva.
    if (!originalKey && existingKeys.includes(key)) {
      key = key + "-" + Date.now()
    }

    onSave({ key, title: title.trim(), subtitle: subtitle.trim(), icon }, originalKey)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl z-10">
          <h2 className="font-serif text-xl font-bold">
            {category ? "Editar sección" : "Nueva sección"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0D261C] mb-1.5">Nombre de la sección</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Desayunos, Postres, Bebidas..."
              className="w-full p-3 rounded-xl border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D261C] mb-1.5">Frase corta (subtítulo)</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: Frescura y sabor en cada bocado"
              className="w-full p-3 rounded-xl border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D261C] mb-2">Icono</label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => setIcon(name)}
                  className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
                    icon === name
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#0D261C]"
                      : "border-stone-200 text-stone-400 hover:border-stone-300"
                  }`}
                >
                  {renderCategoryIcon(name, "w-5 h-5")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-stone-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} /> Guardar sección
          </button>
        </div>
      </div>
    </div>
  )
}
