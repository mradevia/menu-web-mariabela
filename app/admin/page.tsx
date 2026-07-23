"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
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
  ClipboardList,
  ChefHat,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Receipt,
  QrCode,
  CalendarDays,
  Users,
  FileText,
  Package,
  Ticket,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useSiteData } from "@/hooks/use-site-data"
import { renderCategoryIcon } from "@/lib/icons"
import { type MenuData, type Dish, type Category, type SiteSettings } from "@/lib/site-data"
import { createClient } from "@/lib/supabase/client"
import { getDashboardStats, type DashboardStats } from "@/lib/services/orders"
import Link from "next/link"
import DishEditor from "./DishEditor"
import CategoryEditor from "./CategoryEditor"
import QrSection from "./QrSection"
import FeaturedSection from "./FeaturedSection"

// El acceso a esta página está protegido por app/admin/layout.tsx (gate por
// rol con Supabase) y por el middleware. Aquí ya no hay contraseña.
export default function AdminPage() {
  return <AdminPanel />
}

// ---------------------------------------------------------------------------
//  Panel principal
// ---------------------------------------------------------------------------
function AdminPanel() {
  const router = useRouter()
  const { menu, settings, loaded, saveMenu, saveSettings, resetAll } = useSiteData()
  const [tab, setTab] = useState<"resumen" | "menu" | "negocio">("resumen")

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
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
              href="/pedidos"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <ClipboardList size={15} /> <span className="hidden sm:inline">Pedidos</span>
            </a>
            <a
              href="/cocina"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <ChefHat size={15} /> <span className="hidden sm:inline">Cocina</span>
            </a>
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
            onClick={() => setTab("resumen")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "resumen" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} /> Resumen
          </button>
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
        {tab === "resumen" ? (
          <DashboardSummary />
        ) : tab === "menu" ? (
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
//  Resumen del negocio (KPIs reales: ventas de hoy, pedidos activos, top productos)
// ---------------------------------------------------------------------------
interface NotificationItem {
  id: string
  type: "order" | "reservation"
  title: string
  description: string
  time: Date
  link: string
}

function DashboardSummary() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: ords } = await supabase
        .from("orders")
        .select("id, order_number, table:tables(number), created_at, status")
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false })

      const { data: resvs } = await supabase
        .from("reservations")
        .select("id, customer_name, party_size, reserved_for, created_at, status")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      const mappedOrders: NotificationItem[] = (ords ?? []).map((o: any) => ({
        id: o.id,
        type: "order",
        title: `Nuevo Pedido #${o.order_number}`,
        description: o.table?.number != null ? `Mesa ${o.table.number}` : "Para llevar / Mostrador",
        time: new Date(o.created_at),
        link: "/pedidos"
      }))

      const mappedResvs: NotificationItem[] = (resvs ?? []).map((r: any) => ({
        id: r.id,
        type: "reservation",
        title: `Nueva Reservación`,
        description: `${r.customer_name} (${r.party_size} pers)`,
        time: new Date(r.created_at),
        link: "/reservaciones"
      }))

      setNotifications([...mappedOrders, ...mappedResvs].sort((a, b) => b.time.getTime() - a.time.getTime()))
    } catch (e) {
      console.error("Error fetching notifications:", e)
    }
  }, [supabase])

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats(supabase)
      setStats(data)
    } catch (e) {
      console.error("Error al cargar el resumen:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.error("Audio error:", e)
    }
  }, [])

  useEffect(() => {
    loadStats()
    fetchNotifications()

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel("admin-dashboard-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new.status === "pending" || payload.new.status === "confirmed") {
            if (soundEnabled) playChime()
            fetchNotifications()
            loadStats()
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new.status === "pending" || payload.new.status === "confirmed") {
            if (payload.old.status !== "pending" && payload.old.status !== "confirmed") {
              if (soundEnabled) playChime()
            }
          }
          fetchNotifications()
          loadStats()
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          if (payload.new.status === "pending") {
            if (soundEnabled) playChime()
            fetchNotifications()
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications, loadStats, playChime, soundEnabled])

  if (loading) {
    return <div className="animate-pulse text-center text-stone-400 py-12 text-sm">Cargando resumen...</div>
  }

  if (!stats) {
    return <p className="text-center text-stone-400 py-12 text-sm">No se pudo cargar el resumen.</p>
  }

  return (
    <div className="space-y-6">
      {/* Grid de 3 columnas para pantallas grandes, 1 columna en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (2/3 de ancho en LG): Stats y Accesos Rápidos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjetas de Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <Receipt size={14} className="text-emerald-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Ventas de hoy</p>
              </div>
              <p className="text-2xl font-bold text-[#0D261C]">${stats.todayRevenue.toFixed(0)}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <ShoppingBag size={14} className="text-[#D4AF37]" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Pedidos de hoy</p>
              </div>
              <p className="text-2xl font-bold text-[#0D261C]">{stats.todayOrders}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <ClipboardList size={14} className="text-blue-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Pedidos activos</p>
              </div>
              <p className="text-2xl font-bold text-[#0D261C]">{stats.activeOrders}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                <TrendingUp size={14} className="text-purple-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Ticket promedio</p>
              </div>
              <p className="text-2xl font-bold text-[#0D261C]">${stats.averageTicket.toFixed(0)}</p>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-serif font-bold text-[#0D261C] mb-4 text-base tracking-wide">Panel de Control</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href="/pedidos"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(13,38,28,0.2)]"
              >
                <ClipboardList size={16} /> Pedidos
              </Link>
              <Link
                href="/cocina"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <ChefHat size={16} /> Cocina
              </Link>
              <Link
                href="/mesas"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <QrCode size={16} /> Mesas
              </Link>
              <Link
                href="/reservaciones"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <CalendarDays size={16} /> Reservaciones
              </Link>
              <Link
                href="/caja"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <Receipt size={16} /> Corte de caja
              </Link>
              <Link
                href="/gastos"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <TrendingDown size={16} /> Gastos
              </Link>
              <Link
                href="/reportes"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <TrendingUp size={16} /> Reportes
              </Link>
              <Link
                href="/clientes"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <Users size={16} /> Clientes
              </Link>
              <Link
                href="/facturacion"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <FileText size={16} /> Facturación
              </Link>
              <Link
                href="/inventario"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <Package size={16} /> Inventario
              </Link>
              <Link
                href="/cupones"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
              >
                <Ticket size={16} /> Cupones
              </Link>
            </div>
          </div>
        </div>

        {/* Columna Derecha (1/3 de ancho en LG): Notificaciones y Productos más vendidos */}
        <div className="space-y-6">
          
          {/* Tarjeta de Notificaciones en Tiempo Real */}
          <div className="bg-[#0D261C] text-white rounded-3xl p-6 shadow-lg border border-white/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#D4AF37] animate-pulse" />
                <h3 className="font-serif font-bold text-white text-base">Notificaciones</h3>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title={soundEnabled ? "Silenciar" : "Activar sonido"}
              >
                {soundEnabled ? <Volume2 size={15} className="text-[#D4AF37]" /> : <VolumeX size={15} className="text-stone-400" />}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Bell size={24} className="opacity-20 text-white" />
                  <p>Sin novedades por ahora</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    className="block bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-3 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">{n.title}</p>
                        <p className="text-xs text-stone-300 truncate mt-0.5">{n.description}</p>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium shrink-0 ml-2">
                        {n.time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Productos más vendidos hoy */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-serif font-bold text-[#0D261C] mb-4 text-base">Más vendidos hoy</h3>
            {stats.topProducts.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Aún no hay ventas hoy.</p>
            ) : (
              <ul className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700 min-w-0 truncate">
                      <span className="text-stone-300 font-bold mr-2">{i + 1}.</span>
                      {p.name}
                    </span>
                    <span className="font-bold text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded-full text-xs shrink-0 ml-2">
                      {p.quantity} pzas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
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
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-bold text-[#0D261C] text-sm truncate">{dish.name}</p>
                          {dish.group && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-wider">
                              {dish.group}
                            </span>
                          )}
                        </div>
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
          groups={[
            ...new Set(
              (menu[dishEditor.catKey]?.items ?? [])
                .map((d) => d.group)
                .filter((g): g is string => Boolean(g)),
            ),
          ]}
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
