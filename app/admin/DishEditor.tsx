"use client"

import { useState, useEffect } from "react"
import {
  X,
  Save,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Tag,
  DollarSign,
  AlignLeft,
  RefreshCw,
} from "lucide-react"
import type { Dish } from "@/lib/site-data"

interface Props {
  dish: Dish | null // null = crear nuevo
  onSave: (dish: Dish) => void
  onClose: () => void
}

export default function DishEditor({ dish, onSave, onClose }: Props) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [image, setImage] = useState("")

  useEffect(() => {
    setName(dish?.name ?? "")
    setPrice(dish ? String(dish.price) : "")
    setIngredients(dish?.ingredients ?? "")
    setImage(dish?.image ?? "")
  }, [dish])

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor escribe el nombre del platillo.")
      return
    }
    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Por favor escribe un precio válido (solo números).")
      return
    }

    onSave({
      id: dish?.id ?? Date.now(), // id nuevo basado en la hora actual
      name: name.trim(),
      price: priceNum,
      ingredients: ingredients.trim(),
      ...(image.trim() ? { image: image.trim() } : {}),
      ...(dish?.tags ? { tags: dish.tags } : {}), // Conservamos las etiquetas existentes si las tuviera
    })
  }

  // Subir imagen desde el dispositivo, redimensionarla y comprimirla usando Canvas para evitar saturar localStorage
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Comprimir a JPEG con calidad de 0.7 para que pese ~30-60 KB en vez de megabytes
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7)
          setImage(compressedDataUrl)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 transition-all duration-300">
      <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col border border-stone-100/10">
        {/* Encabezado */}
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl z-10 border-b border-[#D4AF37]/20">
          <div>
            <h2 className="font-serif text-xl font-bold tracking-wide">
              {dish ? "Editar platillo" : "Nuevo platillo"}
            </h2>
            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold mt-0.5">
              Detalles y presentación
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:rotate-90 text-stone-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-[#0D261C] mb-2 flex items-center gap-1.5">
              <Tag size={14} className="text-[#D4AF37]" /> Nombre del platillo
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Volcán de Chilaquil"
              className="w-full p-3.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none text-base transition-all bg-stone-50/30 focus:bg-white"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-[#0D261C] mb-2 flex items-center gap-1.5">
              <DollarSign size={14} className="text-[#D4AF37]" /> Precio (solo el número)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">$</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="109"
                className="w-full pl-9 p-3.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none text-base transition-all bg-stone-50/30 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-[#0D261C] mb-2 flex items-center gap-1.5">
              <AlignLeft size={14} className="text-[#D4AF37]" /> Descripción / Ingredientes
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Describe el platillo, sus ingredientes o detalles especiales..."
              className="w-full p-3.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none text-base resize-none h-28 transition-all bg-stone-50/30 focus:bg-white"
            />
          </div>

          {/* Imagen (Carga Local) */}
          <div className="bg-stone-50/60 p-4.5 rounded-2xl border border-stone-200/50">
            <label className="block text-xs uppercase tracking-wider font-bold text-[#0D261C] mb-3 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[#D4AF37]" /> Foto del platillo <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>

            <div>
              {image ? (
                <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
                  <img src={image} alt="Vista previa" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 hidden sm:flex">
                    <label className="bg-white text-stone-700 hover:bg-stone-50 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-105 transition-all">
                      <RefreshCw size={13} className="text-[#0D261C]" /> Cambiar foto
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                  {/* Botones móviles o permanentes abajo */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <label className="flex-1 bg-white/95 backdrop-blur-sm text-stone-850 py-2 rounded-xl text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-md border border-stone-200/50 hover:bg-white transition-colors sm:hidden">
                      <RefreshCw size={12} className="text-[#D4AF37]" /> Cambiar foto
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="flex-1 bg-red-600/95 backdrop-blur-sm text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-red-600 transition-colors sm:hidden"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed border-stone-250 rounded-xl cursor-pointer bg-white hover:bg-stone-50/50 hover:border-[#D4AF37] transition-all group p-4 text-center">
                  <div className="bg-stone-100 group-hover:bg-[#D4AF37]/10 p-3 rounded-full transition-colors">
                    <UploadCloud size={24} className="text-stone-400 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-700 font-bold block mb-0.5">Sube una foto del platillo</span>
                    <span className="text-[10px] text-stone-400 block">Haz clic para buscar o arrastra una imagen aquí</span>
                    <span className="text-[9px] text-stone-400 block mt-1">(Formatos JPG, PNG. Máximo 1.5 MB)</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="sticky bottom-0 bg-white border-t border-stone-100 p-5 flex gap-3 z-10 sm:rounded-b-3xl">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-stone-250 text-stone-600 font-bold hover:bg-stone-50 hover:text-stone-800 transition-all text-sm active:scale-98"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-stone-200 active:scale-98 cursor-pointer"
          >
            <Save size={16} /> Guardar platillo
          </button>
        </div>
      </div>
    </div>
  )
}

