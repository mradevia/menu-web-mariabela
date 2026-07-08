"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, RefreshCw, Utensils, ChefHat, Clock, Printer, LayoutDashboard, Check, Trash2, X, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { listOrders, updateOrderStatus, deleteOrder, type OrderView, type OrderStatus } from "@/lib/services/orders"
import NewOrderModal from "./NewOrderModal"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Nuevo",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  served: "Entregado",
  completed: "Pagado",
  cancelled: "Cancelado",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-stone-100 text-stone-700 border border-stone-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  preparing: "bg-amber-50 text-amber-700 border border-amber-200",
  ready: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  served: "bg-teal-50 text-teal-700 border border-teal-200",
  completed: "bg-amber-50 text-[#8a6d1c] border border-[#8a6d1c]/30",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
}

const STATUS_BORDERS: Record<OrderStatus, string> = {
  pending: "border-l-4 border-stone-400",
  confirmed: "border-l-4 border-blue-500",
  preparing: "border-l-4 border-amber-500",
  ready: "border-l-4 border-emerald-500",
  served: "border-l-4 border-teal-500",
  completed: "border-l-4 border-[#D4AF37]",
  cancelled: "border-l-4 border-red-500",
}

const FILTERS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "active", label: "Activos", statuses: ["pending", "confirmed", "preparing", "ready", "served"] },
  { key: "completed", label: "Pagados", statuses: ["completed"] },
  { key: "cancelled", label: "Cancelados", statuses: ["cancelled"] },
  { key: "all", label: "Todos" },
]

export default function PedidosPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [orders, setOrders] = useState<OrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("active")
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  
  // Modal de eliminación personalizada
  const [orderToDelete, setOrderToDelete] = useState<OrderView | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const active = FILTERS.find((f) => f.key === filter)
      const data = await listOrders(supabase, { statuses: active?.statuses })
      setOrders(data)
    } catch (e) {
      console.error("Error al cargar pedidos:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, filter])

  useEffect(() => {
    setLoading(true)
    load()

    const channel = supabase
      .channel("pedidos-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, supabase])

  const changeStatus = async (order: OrderView, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
    try {
      await updateOrderStatus(supabase, order.id, status)
    } catch (e) {
      console.error("Error al cambiar estado:", e)
      load()
    }
  }

  const handleDelete = (order: OrderView) => {
    setOrderToDelete(order)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    setDeleting(true)
    try {
      await deleteOrder(supabase, orderToDelete.id)
      setOrderToDelete(null)
      load()
    } catch (e) {
      console.error("Error al eliminar pedido:", e)
      alert("No se pudo eliminar el pedido.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Pedidos</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <LayoutDashboard size={15} /> <span className="hidden sm:inline">Panel</span>
            </Link>
            <Link
              href="/cocina"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <ChefHat size={15} /> <span className="hidden sm:inline">Cocina</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <Utensils size={15} /> <span className="hidden sm:inline">Menú</span>
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5">
        <button
          onClick={() => setShowNewOrder(true)}
          className="w-full mb-4 py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Nuevo pedido
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-stone-400" size={24} />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-stone-400 py-12 text-sm">No hay pedidos en esta vista.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const isOpen = expanded === order.id
              const label =
                order.table?.number != null
                  ? `Mesa ${order.table.number}`
                  : order.customer?.full_name ?? "Mostrador"
              return (
                <div key={order.id} className="relative overflow-hidden rounded-2xl bg-stone-100 shadow-sm border border-stone-200/40">
                  {/* Fondo de acción - Deslizar derecha (Completar/Pagar) */}
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-600 text-white flex items-center pl-5 gap-2 rounded-l-2xl">
                    <Check size={20} className="animate-pulse shrink-0" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Completar</span>
                  </div>
                  
                  {/* Fondo de acción - Deslizar izquierda (Cancelar) */}
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-red-600 text-white flex items-center justify-end pr-5 gap-2 rounded-r-2xl">
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Cancelar</span>
                    <Trash2 size={20} className="animate-pulse shrink-0" />
                  </div>

                  {/* Tarjeta Deslizable */}
                  <motion.div
                    drag={isOpen ? false : "x"}
                    dragDirectionLock
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0.5, right: 0.5 }}
                    onDragEnd={(event, info) => {
                      if (info.offset.x > 140) {
                        // Swipe Derecha -> Completar
                        if (order.status !== "completed") {
                          changeStatus(order, "completed")
                        }
                      } else if (info.offset.x < -140) {
                        // Swipe Izquierda -> Cancelar
                        if (order.status !== "cancelled") {
                          changeStatus(order, "cancelled")
                        }
                      }
                    }}
                    style={{ touchAction: isOpen ? "auto" : "pan-y" }}
                    className={`relative z-10 bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md transition-all duration-250 ${isOpen ? "" : "cursor-grab active:cursor-grabbing"} ${STATUS_BORDERS[order.status]}`}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="w-full flex items-center gap-3 p-4 sm:p-5 text-left select-none"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-sans font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">#{order.order_number}</p>
                          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-1">
                          {label} · {order.items.length} producto(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-extrabold text-[#0D261C]">${order.total.toFixed(0)}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-stone-400 flex items-center gap-1 justify-end mt-1">
                          <Clock size={12} /> {new Date(order.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-stone-100 p-5 bg-stone-50/70 space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Detalle del Pedido</p>
                          <ul className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200/60 px-4 py-2 space-y-1">
                            {order.items.map((item) => (
                              <li key={item.id} className="text-sm text-stone-700 flex justify-between py-2 first:pt-0 last:pb-0">
                                <span>
                                  <span className="font-extrabold text-[#0D261C] mr-2">{item.quantity}×</span> 
                                  <span className="font-semibold text-stone-850">{item.product_name}</span>
                                </span>
                                <span className="font-extrabold text-stone-600">${item.line_total.toFixed(0)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {order.notes && (
                          <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-xl px-4 py-2.5 flex gap-2">
                            <span>📝</span>
                            <span className="font-medium">{order.notes}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200/60 items-center justify-between">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-2">Cambiar estado:</p>
                            {(["pending", "confirmed", "preparing", "ready", "served", "completed"] as OrderStatus[]).map(
                              (s) => (
                                <button
                                  key={s}
                                  onClick={() => changeStatus(order, s)}
                                  disabled={order.status === s}
                                  className={`text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 border ${
                                    order.status === s
                                      ? "bg-[#0D261C] text-white border-transparent shadow-sm"
                                      : "bg-white border-stone-200 text-stone-600 hover:border-[#D4AF37] hover:text-[#0D261C]"
                                  }`}
                                >
                                  {STATUS_LABELS[s]}
                                </button>
                              ),
                            )}
                            <button
                              onClick={() => changeStatus(order, "cancelled")}
                              disabled={order.status === "cancelled"}
                              className="text-xs font-bold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-40"
                            >
                              Cancelar
                            </button>
                            
                            <button
                              onClick={() => handleDelete(order)}
                              className="text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all active:scale-95 flex items-center gap-1.5"
                              title="Eliminar de la base de datos"
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>
                          </div>
                          <a
                            href={`/ticket/${order.id}`}
                            target="_blank"
                            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-[#0D261C] text-white hover:bg-[#153a2b] transition-all flex items-center gap-1.5 shadow-sm shadow-[#0D261C]/10 active:scale-95 ml-auto"
                          >
                            <Printer size={14} /> Ticket
                          </a>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={() => {
            setShowNewOrder(false)
            load()
          }}
        />
      )}

      {/* Modal de confirmación de eliminación personalizada */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-100"
            >
              {/* Header */}
              <div className="bg-red-50 px-6 py-5 flex items-center gap-3 border-b border-red-100">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stone-900 leading-snug">Eliminar Pedido</h3>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-0.5">Confirmación de seguridad</p>
                </div>
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="p-1.5 hover:bg-red-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm font-semibold text-stone-700 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar permanentemente el <span className="font-extrabold text-[#0D261C]">Pedido #{orderToDelete.order_number}</span>?
                </p>
                <div className="mt-3 bg-stone-50 border border-stone-200/60 rounded-2xl p-4.5 space-y-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Cliente / Origen:</span>
                    <span className="font-bold text-stone-850">
                      {orderToDelete.table?.number != null ? `Mesa ${orderToDelete.table.number}` : orderToDelete.customer?.full_name ?? "Mostrador"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Monto Total:</span>
                    <span className="font-extrabold text-[#D4AF37]">${orderToDelete.total.toFixed(0)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-red-500 font-bold mt-4 flex items-center gap-1.5">
                  ⚠ Esta acción es irreversible y borrará el pedido de todos los reportes y cocina.
                </p>
              </div>

              {/* Actions */}
              <div className="bg-stone-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  onClick={() => setOrderToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2 hover:shadow-lg hover:shadow-red-600/15 disabled:opacity-40"
                >
                  {deleting ? "Eliminando..." : "Eliminar permanentemente"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
