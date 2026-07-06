"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  UtensilsCrossed,
  Store,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Phone,
  Instagram,
  Facebook,
  MapPin,
  Clock,
  Save,
  Undo,
  Redo,
} from "lucide-react"
import { useSiteData } from "@/hooks/use-site-data"
import { renderCategoryIcon } from "@/lib/icons"
import { ADMIN_PASSWORD, type MenuData, type Dish, type Category, type SiteSettings } from "@/lib/site-data"
import DishEditor from "./DishEditor"
import CategoryEditor from "./CategoryEditor"
import QrSection from "./QrSection"
import FeaturedSection from "./FeaturedSection"

const AUTH_KEY = "mariabela-admin-auth"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Recordar sesión iniciada en este navegador.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true)
    }
    setCheckingAuth(false)
  }, [])

  if (checkingAuth) {
    return <div className="min-h-screen bg-[#0D261C]" />
  }

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />
  }

  return <AdminPanel onLogout={() => setAuthed(false)} />
}

// ---------------------------------------------------------------------------
//  Pantalla de acceso (contraseña)
// ---------------------------------------------------------------------------
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1")
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D261C] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-[#0D261C] text-[#D4AF37] p-4 rounded-full mb-4">
            <Lock size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#0D261C]">Panel de Maria Bela</h1>
          <p className="text-stone-500 text-sm mt-1">Escribe la contraseña para administrar el menú.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder="Contraseña"
            autoFocus
            className={`w-full p-4 rounded-xl border-2 outline-none text-center text-lg transition-colors ${
              error ? "border-red-400 bg-red-50" : "border-stone-300 focus:border-[#D4AF37]"
            }`}
          />
          {error && <p className="text-red-500 text-sm text-center">Contraseña incorrecta. Intenta de nuevo.</p>}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[#0D261C] text-white font-bold text-lg hover:bg-[#991B1B] transition-colors"
          >
            Entrar
          </button>
        </form>
        <a
          href="/"
          className="block text-center text-stone-400 hover:text-[#0D261C] text-sm mt-6 transition-colors"
        >
          ← Volver al menú
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  Panel principal
// ---------------------------------------------------------------------------
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { menu, settings, loaded, saveMenu, saveSettings, resetAll } = useSiteData()
  const [tab, setTab] = useState<"menu" | "negocio">("menu")

  // Historial de cambios para Deshacer/Rehacer (Undo/Redo) a nivel global de AdminPanel
  const [history, setHistory] = useState<MenuData[]>([])
  const [pointer, setPointer] = useState(-1)

  // Inicializar historial cuando se cargue el menú de useSiteData
  useEffect(() => {
    if (menu && Object.keys(menu).length > 0) {
      if (history.length === 0 || JSON.stringify(menu) !== JSON.stringify(history[pointer])) {
        setHistory([menu])
        setPointer(0)
      }
    }
  }, [menu])

  // Función auxiliar para realizar cambios en el menú y registrarlos en la pila de historial
  const updateMenu = (nextMenu: MenuData) => {
    saveMenu(nextMenu)
    const newHistory = history.slice(0, pointer + 1)
    newHistory.push(nextMenu)
    setHistory(newHistory)
    setPointer(newHistory.length - 1)
  }

  // Acciones de Undo / Redo
  const handleUndo = () => {
    if (pointer > 0) {
      const nextPointer = pointer - 1
      setPointer(nextPointer)
      saveMenu(history[nextPointer])
    }
  }

  const handleRedo = () => {
    if (pointer < history.length - 1) {
      const nextPointer = pointer + 1
      setPointer(nextPointer)
      saveMenu(history[nextPointer])
    }
  }

  // Atajos de teclado para Ctrl+Z y Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey
      if (isCtrl) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault()
          handleUndo()
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault()
          handleRedo()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pointer, history])

  const canUndo = pointer > 0
  const canRedo = pointer < history.length - 1

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    onLogout()
  }

  const totalDishes = useMemo(
    () => Object.values(menu).reduce((sum, c) => sum + c.items.length, 0),
    [menu],
  )
  const totalCategories = Object.keys(menu).length

  if (!loaded) {
    return <div className="min-h-screen bg-stone-100" />
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Panel Maria Bela</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Administración del menú</p>
          </div>
          <div className="flex items-center gap-2">
            {tab === "menu" && (
              <div className="flex bg-white/10 rounded-lg p-0.5 gap-0.5 mr-2">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={`p-1.5 rounded hover:bg-white/15 transition-colors cursor-pointer ${
                    canUndo ? "text-white" : "text-white/30 cursor-not-allowed opacity-50"
                  }`}
                  title="Deshacer (Ctrl+Z)"
                >
                  <Undo size={15} />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={`p-1.5 rounded hover:bg-white/15 transition-colors cursor-pointer ${
                    canRedo ? "text-white" : "text-white/30 cursor-not-allowed opacity-50"
                  }`}
                  title="Rehacer (Ctrl+Y)"
                >
                  <Redo size={15} />
                </button>
              </div>
            )}

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <Eye size={15} /> <span className="hidden sm:inline">Ver menú</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-[#991B1B] px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setTab("menu")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "menu" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            <UtensilsCrossed size={16} /> Menú
          </button>
          <button
            onClick={() => setTab("negocio")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "negocio" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            <Store size={16} /> Mi negocio
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5">
        {tab === "menu" ? (
          <MenuManager
            menu={menu}
            saveMenu={updateMenu}
            resetAll={resetAll}
            settings={settings}
            saveSettings={saveSettings}
            totalDishes={totalDishes}
            totalCategories={totalCategories}
          />
        ) : (
          <BusinessManager menu={menu} settings={settings} saveSettings={saveSettings} />
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  Gestor del menú (categorías + platillos)
// ---------------------------------------------------------------------------
function MenuManager({
  menu,
  saveMenu,
  resetAll,
  settings,
  saveSettings,
  totalDishes,
  totalCategories,
}: {
  menu: MenuData
  saveMenu: (m: MenuData) => void
  resetAll: () => void
  settings: SiteSettings
  saveSettings: (s: SiteSettings) => void
  totalDishes: number
  totalCategories: number
}) {
  const [search, setSearch] = useState("")
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})

  // Editores abiertos
  const [dishEditor, setDishEditor] = useState<{ catKey: string; dish: Dish | null } | null>(null)
  const [catEditor, setCatEditor] = useState<{ open: boolean; category: (Category & { key: string }) | null }>({
    open: false,
    category: null,
  })

  const categories = Object.keys(menu)

  const toggleCat = (key: string) => setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }))

  // ---- Platillos ----
  const saveDish = (catKey: string, dish: Dish) => {
    const cat = menu[catKey]
    const exists = cat.items.some((d) => d.id === dish.id)
    const items = exists ? cat.items.map((d) => (d.id === dish.id ? dish : d)) : [...cat.items, dish]
    saveMenu({ ...menu, [catKey]: { ...cat, items } })
    setDishEditor(null)
  }

  const deleteDish = (catKey: string, dish: Dish) => {
    if (!confirm(`¿Eliminar "${dish.name}"? Esta acción no se puede deshacer.`)) return
    const cat = menu[catKey]
    saveMenu({ ...menu, [catKey]: { ...cat, items: cat.items.filter((d) => d.id !== dish.id) } })
  }

  // ---- Categorías ----
  const saveCategory = (
    data: { key: string; title: string; subtitle: string; icon: string },
    originalKey?: string,
  ) => {
    const next: MenuData = {}
    if (originalKey && menu[originalKey]) {
      // Editar existente, conservando el orden y los platillos.
      for (const k of Object.keys(menu)) {
        if (k === originalKey) {
          next[data.key] = { ...menu[originalKey], title: data.title, subtitle: data.subtitle, icon: data.icon }
        } else {
          next[k] = menu[k]
        }
      }
    } else {
      // Nueva categoría al final.
      Object.assign(next, menu)
      next[data.key] = { title: data.title, subtitle: data.subtitle, icon: data.icon, items: [] }
    }
    saveMenu(next)
    setCatEditor({ open: false, category: null })
  }

  const deleteCategory = (key: string) => {
    const cat = menu[key]
    if (!confirm(`¿Eliminar la sección "${cat.title}" y sus ${cat.items.length} platillo(s)? No se puede deshacer.`))
      return
    const next = { ...menu }
    delete next[key]
    saveMenu(next)
  }

  const moveCategory = (key: string, dir: -1 | 1) => {
    const keys = Object.keys(menu)
    const i = keys.indexOf(key)
    const j = i + dir
    if (j < 0 || j >= keys.length) return
    ;[keys[i], keys[j]] = [keys[j], keys[i]]
    const next: MenuData = {}
    for (const k of keys) next[k] = menu[k]
    saveMenu(next)
  }

  // ---- Respaldo / Restaurar ----
  const exportData = () => {
    const payload = JSON.stringify({ menu, settings }, null, 2)
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mariabela-menu-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.menu) saveMenu(data.menu)
        if (data.settings) saveSettings(data.settings)
        alert("¡Respaldo cargado con éxito!")
      } catch {
        alert("El archivo no es válido.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  // Filtrado por búsqueda: qué platillos mostrar por categoría.
  const term = search.trim().toLowerCase()
  const matchesTerm = (d: Dish) =>
    !term || d.name.toLowerCase().includes(term) || d.ingredients.toLowerCase().includes(term)

  return (
    <>
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <p className="text-3xl font-bold text-[#0D261C]">{totalDishes}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Platillos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <p className="text-3xl font-bold text-[#0D261C]">{totalCategories}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Secciones</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center px-3 mb-4">
        <Search size={18} className="text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar un platillo..."
          className="w-full py-3 px-2 outline-none text-sm"
        />
      </div>

      {/* Botón: nueva sección */}
      <button
        onClick={() => setCatEditor({ open: true, category: null })}
        className="w-full mb-5 py-3 rounded-2xl border-2 border-dashed border-stone-300 text-stone-500 font-bold hover:border-[#D4AF37] hover:text-[#0D261C] transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Agregar nueva sección
      </button>

      {/* Lista de categorías */}
      <div className="space-y-3">
        {categories.map((key, idx) => {
          const cat = menu[key]
          const visibleItems = cat.items.filter(matchesTerm)
          const isOpen = openCats[key] ?? Boolean(term) // si busca, abrir todas
          if (term && visibleItems.length === 0) return null

          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {/* Cabecera de la categoría */}
              <div className="flex items-center gap-2 p-3">
                <button onClick={() => toggleCat(key)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className="bg-[#0D261C]/5 text-[#0D261C] p-2.5 rounded-xl shrink-0">
                    {renderCategoryIcon(cat.icon, "w-5 h-5")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-[#0D261C] truncate">{cat.title}</h3>
                    <p className="text-xs text-stone-400">{cat.items.length} platillo(s)</p>
                  </div>
                </button>

                {/* Orden */}
                <div className="hidden sm:flex flex-col">
                  <button
                    onClick={() => moveCategory(key, -1)}
                    disabled={idx === 0}
                    className="text-stone-300 hover:text-[#0D261C] disabled:opacity-30"
                    title="Subir"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveCategory(key, 1)}
                    disabled={idx === categories.length - 1}
                    className="text-stone-300 hover:text-[#0D261C] disabled:opacity-30"
                    title="Bajar"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <button
                  onClick={() => setCatEditor({ open: true, category: { ...cat, key } })}
                  className="p-2 text-stone-400 hover:text-[#0D261C] hover:bg-stone-100 rounded-lg transition-colors"
                  title="Editar sección"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={() => deleteCategory(key)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar sección"
                >
                  <Trash2 size={17} />
                </button>
                <button onClick={() => toggleCat(key)} className="p-2 text-stone-400">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Platillos */}
              {isOpen && (
                <div className="border-t border-stone-100 p-3 space-y-2 bg-stone-50/50">
                  {visibleItems.map((dish) => (
                    <div
                      key={dish.id}
                      className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-stone-100"
                    >
                      {dish.image ? (
                        <img src={dish.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-300 shrink-0">
                          <UtensilsCrossed size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0D261C] text-sm truncate">{dish.name}</p>
                        <p className="text-xs text-stone-400 truncate">{dish.ingredients}</p>
                      </div>
                      <span className="font-bold text-[#D4AF37] shrink-0">${dish.price}</span>
                      <button
                        onClick={() => setDishEditor({ catKey: key, dish })}
                        className="p-2 text-stone-400 hover:text-[#0D261C] hover:bg-stone-100 rounded-lg transition-colors shrink-0"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteDish(key, dish)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {!term && (
                    <button
                      onClick={() => setDishEditor({ catKey: key, dish: null })}
                      className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-500 text-sm font-bold hover:border-[#D4AF37] hover:text-[#0D261C] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Agregar platillo a {cat.title}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Respaldo y restaurar */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
        <h3 className="font-bold text-[#0D261C] mb-1">Respaldo y publicación</h3>
        <p className="text-xs text-stone-500 mb-4">
          Descarga un respaldo de tu menú, o cárgalo en otro dispositivo. Los cambios se guardan
          automáticamente en este navegador.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#991B1B] transition-colors"
          >
            <Download size={16} /> Descargar respaldo
          </button>
          <label className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-300 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors cursor-pointer">
            <Upload size={16} /> Cargar respaldo
            <input type="file" accept="application/json,.json" onChange={importData} className="hidden" />
          </label>
          <button
            onClick={() => {
              if (confirm("¿Restablecer TODO el menú a los valores originales? Se perderán tus cambios.")) resetAll()
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
          >
            <RotateCcw size={16} /> Restablecer
          </button>
        </div>
      </div>

      {/* Editores modales */}
      {dishEditor && (
        <DishEditor
          dish={dishEditor.dish}
          onSave={(d) => saveDish(dishEditor.catKey, d)}
          onClose={() => setDishEditor(null)}
        />
      )}
      {catEditor.open && (
        <CategoryEditor
          category={catEditor.category}
          existingKeys={categories}
          onSave={saveCategory}
          onClose={() => setCatEditor({ open: false, category: null })}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
//  Gestor del negocio (contacto, redes, horarios)
// ---------------------------------------------------------------------------
function BusinessManager({
  menu,
  settings,
  saveSettings,
}: {
  menu: MenuData
  settings: SiteSettings
  saveSettings: (s: SiteSettings) => void
}) {
  const [form, setForm] = useState<SiteSettings>(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => setForm(settings), [settings])

  // Solo los campos de texto de SiteSettings (excluye featuredDishIds, que es una lista).
  type TextField = Exclude<keyof SiteSettings, "featuredDishIds">

  const update = (field: TextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const field = (
    label: string,
    fieldName: TextField,
    placeholder: string,
    help?: string,
  ) => (
    <div>
      <label className="block text-sm font-bold text-[#0D261C] mb-1.5">{label}</label>
      <input
        value={form[fieldName]}
        onChange={(e) => update(fieldName, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-base"
      />
      {help && <p className="text-xs text-stone-400 mt-1">{help}</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Contacto */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#0D261C]">
          <Phone size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold">Contacto y WhatsApp</h3>
        </div>
        {field(
          "Número de WhatsApp (con código de país)",
          "whatsapp",
          "5215512345678",
          "Solo números. Ej: 52 (México) + 55 + número. Se usa para los pedidos.",
        )}
        {field("Teléfono como se muestra", "phoneDisplay", "55 1234 5678")}
      </section>

      {/* Redes */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#0D261C]">
          <Instagram size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold">Redes sociales</h3>
        </div>
        {field("Enlace de Instagram", "instagramUrl", "https://instagram.com/...")}
        {field("Usuario de Instagram (se muestra)", "instagramHandle", "@mariabelacoacalco")}
        {field("Enlace de Facebook", "facebookUrl", "https://facebook.com/...")}
      </section>

      {/* Ubicación */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#0D261C]">
          <MapPin size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold">Ubicación</h3>
        </div>
        {field("Dirección (línea 1)", "addressLine1", "Eje 8, Villa de las Flores")}
        {field("Dirección (línea 2)", "addressLine2", "Coacalco de Berriozábal, EdoMéx.")}
        {field("Enlace de Google Maps", "mapsUrl", "https://maps.google.com/...")}
      </section>

      {/* Horario */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#0D261C]">
          <Clock size={18} className="text-[#D4AF37]" />
          <h3 className="font-bold">Horario</h3>
        </div>
        {field("Días de atención", "scheduleDays", "Lunes a Sábado")}
        {field("Horas de atención", "scheduleHours", "9:00 AM — 4:00 PM")}
        {field("Horario corto (arriba)", "scheduleShort", "LUN-SÁB 9:00 — 16:00")}
      </section>

      {/* Recomendación del Chef / Platillo del día */}
      <FeaturedSection menu={menu} settings={settings} saveSettings={saveSettings} />

      {/* Código QR */}
      <QrSection settings={settings} saveSettings={saveSettings} />

      {/* Guardar */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2 ${
            saved ? "bg-green-600 text-white" : "bg-[#0D261C] text-white hover:bg-[#991B1B]"
          }`}
        >
          <Save size={20} /> {saved ? "¡Guardado!" : "Guardar cambios del negocio"}
        </button>
      </div>
    </div>
  )
}
