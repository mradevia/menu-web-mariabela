"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Clock, ChefHat, CheckCircle2, Utensils, XCircle, RefreshCw, Flame, Timer, Check, Undo2, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  getKitchenQueue,
  updateOrderStatus,
  type OrderView,
  type OrderStatus,
} from "@/lib/services/orders"

const COLUMNS: { 
  status: OrderStatus[]; 
  title: string; 
  icon: React.ReactNode;
  theme: { 
    bg: string; 
    border: string; 
    text: string; 
    headerBg: string; 
    pillBg: string; 
    pillText: string;
    cardBorder: string;
  }
}[] = [
  { 
    status: ["pending", "confirmed"], 
    title: "Pendientes", 
    icon: <Timer size={16} />,
    theme: { 
      bg: "bg-stone-50", 
      border: "border-stone-200/80", 
      text: "text-blue-600", 
      headerBg: "bg-blue-50", 
      pillBg: "bg-blue-100/60", 
      pillText: "text-blue-800", 
      cardBorder: "border-l-4 border-blue-500"
    } 
  },
  { 
    status: ["preparing"], 
    title: "En preparación", 
    icon: <Flame size={16} />,
    theme: { 
      bg: "bg-stone-50", 
      border: "border-stone-200/80", 
      text: "text-amber-600", 
      headerBg: "bg-amber-50", 
      pillBg: "bg-amber-100/60", 
      pillText: "text-amber-800", 
      cardBorder: "border-l-4 border-amber-500"
    } 
  },
  { 
    status: ["ready"], 
    title: "Listos", 
    icon: <Check size={16} />,
    theme: { 
      bg: "bg-stone-50", 
      border: "border-stone-200/80", 
      text: "text-emerald-600", 
      headerBg: "bg-emerald-50", 
      pillBg: "bg-emerald-100/60", 
      pillText: "text-emerald-800", 
      cardBorder: "border-l-4 border-emerald-500"
    } 
  },
  { 
    status: ["served"], 
    title: "Entregados", 
    icon: <CheckCircle2 size={16} />,
    theme: { 
      bg: "bg-stone-50", 
      border: "border-stone-200/80", 
      text: "text-stone-600", 
      headerBg: "bg-stone-100", 
      pillBg: "bg-stone-200/60", 
      pillText: "text-stone-800", 
      cardBorder: "border-l-4 border-stone-400"
    } 
  },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Empezar",
  confirmed: "Empezar",
  preparing: "Listo",
  ready: "Entregar",
}

const PREV_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  preparing: "pending",
  ready: "preparing",
  served: "ready",
}

const PREV_LABEL: Partial<Record<OrderStatus, string>> = {
  preparing: "Pendiente",
  ready: "En preparación",
  served: "Listo",
}

function elapsedMinutes(createdAt: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60000))
}

function OrderCard({
  order,
  now,
  onAdvance,
  onRegress,
  onCancel,
  theme,
}: {
  order: OrderView
  now: number
  onAdvance: (order: OrderView) => void
  onRegress: (order: OrderView) => void
  onCancel: (order: OrderView) => void
  theme: typeof COLUMNS[0]["theme"]
}) {
  const mins = elapsedMinutes(order.created_at, now)
  const urgent = mins >= 20 && order.status !== "served"
  const next = NEXT_STATUS[order.status]
  const prev = PREV_STATUS[order.status]
  const label =
    order.table?.number != null
      ? `Mesa ${order.table.number}`
      : order.customer?.full_name ?? (order.type === "takeaway" ? "Para llevar" : order.type === "delivery" ? "Delivery" : "Mostrador")

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden bg-white rounded-2xl border border-stone-200 p-4 space-y-4 hover:shadow-md transition-all duration-300 ${theme.cardBorder}`}
    >
      {/* Urgent Glow Indicator */}
      {urgent && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" 
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-sans font-extrabold text-lg text-stone-900 tracking-tight">#{order.order_number}</h3>
          <p className="text-sm font-semibold text-stone-500 mt-1">{label}</p>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full ${
            urgent ? "bg-red-55/90 text-red-700 border border-red-200 shadow-sm animate-pulse" : "bg-stone-100 text-stone-600 border border-stone-200"
          }`}
        >
          <Clock size={12} className={urgent ? "animate-pulse" : ""} /> {mins}m
        </div>
      </div>

      <ul className="space-y-2">
        {order.items.map((item) => (
          <li key={item.id} className="text-sm text-stone-700 flex flex-col">
            <div className="flex gap-2">
              <span className={`font-extrabold text-[#0D261C]`}>{item.quantity}×</span> 
              <span className="font-semibold text-stone-850">{item.product_name}</span>
            </div>
            {item.notes && (
              <span className="text-xs text-stone-500 pl-4 italic mt-1 border-l-2 border-stone-200 ml-1.5 py-0.5">
                {item.notes}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-xl px-3 py-2 flex gap-2">
          <span>📝</span>
          <span className="font-semibold">{order.notes}</span>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-stone-100">
        {prev && (
          <button
            onClick={() => onRegress(order)}
            title={PREV_LABEL[order.status]}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-all active:scale-95"
          >
            <Undo2 size={16} />
          </button>
        )}
        
        {next && (
          <button
            onClick={() => onAdvance(order)}
            className="flex-1 py-2.5 rounded-xl bg-[#0D261C] text-white hover:bg-[#153a2b] text-xs font-bold transition-all active:scale-95 shadow-sm shadow-[#0D261C]/10"
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}

        {next && (
          <button
            onClick={() => onCancel(order)}
            title="Cancelar pedido"
            className="p-2.5 rounded-xl border border-red-150 bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function KitchenBoard() {
  const [orders, setOrders] = useState<OrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    try {
      const data = await getKitchenQueue(supabase)
      setOrders(data)
    } catch (e) {
      console.error("Error al cargar comandas:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()

    const channel = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, load)
      .subscribe()

    const tick = setInterval(() => setNow(Date.now()), 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(tick)
    }
  }, [load, supabase])

  const advance = async (order: OrderView) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)))
    try {
      await updateOrderStatus(supabase, order.id, next)
    } catch (e) {
      console.error("Error al cambiar estado:", e)
      load()
    }
  }

  const regress = async (order: OrderView) => {
    const prev = PREV_STATUS[order.status]
    if (!prev) return
    setOrders((prevOrders) => prevOrders.map((o) => (o.id === order.id ? { ...o, status: prev } : o)))
    try {
      await updateOrderStatus(supabase, order.id, prev)
    } catch (e) {
      console.error("Error al revertir estado:", e)
      load()
    }
  }

  const cancel = async (order: OrderView) => {
    if (!confirm(`¿Cancelar el pedido #${order.order_number}?`)) return
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)))
    try {
      await updateOrderStatus(supabase, order.id, "cancelled")
    } catch (e) {
      console.error("Error al cancelar:", e)
      load()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="text-[#0D261C]" size={32} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-10">
      <header className="sticky top-0 z-10 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38F24] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <ChefHat size={26} className="text-[#0D261C]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white leading-none">Cocina</h1>
            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mt-1.5">
              Comandas en tiempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 rounded-xl text-white font-bold transition-all flex items-center gap-2 active:scale-95"
          >
            <LayoutDashboard size={14} /> Panel
          </Link>
          <Link
            href="/"
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 rounded-xl text-white font-bold transition-all flex items-center gap-2 active:scale-95"
          >
            <Utensils size={14} /> Menú
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
        {COLUMNS.map((col) => {
          const items = orders
            .filter((o) => col.status.includes(o.status))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

          return (
            <div key={col.title} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className={`flex items-center gap-2 ${col.theme.text}`}>
                  {col.icon}
                  <h2 className="font-bold text-sm uppercase tracking-wider">{col.title}</h2>
                </div>
                <div className={`text-xs font-bold ${col.theme.pillBg} ${col.theme.pillText} px-2.5 py-1 rounded-full border ${col.theme.border}`}>
                  {items.length}
                </div>
              </div>
              
              <div className={`flex-1 rounded-3xl ${col.theme.bg} border ${col.theme.border} p-4 shadow-sm`}>
                <div className="space-y-4 min-h-[200px]">
                  <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-[200px] text-stone-400 gap-3"
                      >
                        <ChefHat size={32} className="opacity-15" />
                        <p className="text-sm font-medium">Sin pedidos aquí</p>
                      </motion.div>
                    ) : (
                      items.map((order) => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          now={now} 
                          onAdvance={advance} 
                          onRegress={regress}
                          onCancel={cancel}
                          theme={col.theme}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
