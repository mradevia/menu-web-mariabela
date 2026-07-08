"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { X, Search, Plus, Minus, Trash2, ShoppingBag, Ticket, Check, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  createOrder,
  fetchOrderableProducts,
  type OrderableProduct,
  type OrderType,
} from "@/lib/services/orders"
import { validateCoupon } from "@/lib/services/coupons"

interface CartLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

const TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "En mesa",
  takeaway: "Para llevar",
  pickup: "Recoger",
  delivery: "Delivery",
}

export default function NewOrderModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [products, setProducts] = useState<OrderableProduct[]>([])
  const [search, setSearch] = useState("")
  const [type, setType] = useState<OrderType>("dine_in")
  const [notes, setNotes] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cupón
  const [couponCode, setCouponCode] = useState("")
  const [coupon, setCoupon] = useState<{ id: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  useEffect(() => {
    fetchOrderableProducts(supabase)
      .then(setProducts)
      .catch((e) => console.error("Error al cargar productos:", e))
      .finally(() => setLoading(false))
  }, [supabase])

  const filtered = products.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const addToCart = useCallback((p: OrderableProduct) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id)
      if (existing) {
        return prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { productId: p.id, productName: p.name, unitPrice: p.price, quantity: 1 }]
    })
  }, [])

  const changeQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const removeLine = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId))
  }, [])

  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0
  const total = subtotal - discount

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    if (subtotal <= 0) {
      setCouponError("Agrega productos antes de aplicar un cupón.")
      return
    }
    setCheckingCoupon(true)
    setCouponError(null)
    try {
      const result = await validateCoupon(supabase, couponCode.trim(), subtotal)
      if (!result.valid || !result.coupon) {
        setCoupon(null)
        setCouponError(result.reason ?? "Cupón no válido.")
      } else {
        setCoupon({ id: result.coupon.id, discount: result.discount ?? 0 })
      }
    } catch (e) {
      console.error(e)
      setCouponError("No se pudo validar el cupón.")
    } finally {
      setCheckingCoupon(false)
    }
  }

  const clearCoupon = () => {
    setCoupon(null)
    setCouponCode("")
    setCouponError(null)
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Agrega al menos un producto al pedido.")
      return
    }
    setSaving(true)
    try {
      await createOrder(supabase, {
        type,
        notes: notes.trim() || undefined,
        discount,
        couponId: coupon?.id,
        items: cart.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
      })
      onCreated()
    } catch (e) {
      console.error("Error al crear el pedido:", e)
      alert("No se pudo crear el pedido. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl sm:rounded-3xl rounded-t-3xl shadow-2xl h-[92vh] sm:h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-wide">Nuevo pedido</h2>
            <p className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider mt-0.5">Creación de comanda rápida</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Lado Izquierdo: Lista de productos */}
          <div className="flex-1 flex flex-col border-r border-stone-100 min-h-0 bg-stone-50/30">
            {/* Filtros y Buscador */}
            <div className="p-4 space-y-3 bg-white border-b border-stone-100 shadow-sm">
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TYPE_LABELS) as OrderType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm border ${
                      type === t 
                        ? "bg-[#0D261C] text-white border-transparent" 
                        : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-stone-100 rounded-xl px-4 border border-stone-200/80 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/10 transition-all">
                <Search size={20} className="text-stone-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar platillo (ej: Milanesa, frapuccino)..."
                  className="w-full py-3.5 px-3 outline-none text-base bg-transparent font-medium text-stone-800 placeholder-stone-400"
                />
              </div>
            </div>

            {/* Listado de Platillos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
                  <RefreshCw className="animate-spin text-stone-400" size={24} />
                  <p className="text-sm font-medium">Cargando menú...</p>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-12 font-medium">No se encontraron platillos con esa búsqueda.</p>
              ) : (
                filtered.map((p) => {
                  const qtyInCart = cart.find((l) => l.productId === p.id)?.quantity ?? 0
                  return (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${
                        qtyInCart > 0 
                          ? "bg-[#0D261C]/5 border-[#0D261C]/30 shadow-inner" 
                          : "bg-white border-stone-100 shadow-sm"
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <h4 className="text-base sm:text-lg font-bold text-[#0D261C] leading-snug">{p.name}</h4>
                        <span className="inline-block text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">{p.categoryTitle}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-base sm:text-lg font-extrabold text-[#D4AF37]">${p.price}</span>
                        {qtyInCart > 0 ? (
                          <div className="flex items-center gap-1 bg-[#0D261C] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md shadow-[#0D261C]/15">
                            <span>{qtyInCart} pza(s)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-10 h-10 rounded-full bg-[#0D261C]/5 border border-[#0D261C]/10 text-[#0D261C] hover:bg-[#0D261C] hover:text-white flex items-center justify-center transition-all shadow-sm"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Lado Derecho: Carrito / Resumen de comanda */}
          <div className="w-full md:w-80 flex flex-col bg-white border-t md:border-t-0 md:border-l border-stone-100 h-1/2 md:h-full">
            {/* Notas del pedido */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/20">
              <label className="text-xs font-bold text-[#0D261C] uppercase tracking-wider">Notas del pedido</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: sin cebolla, salsa aparte, entregar rápido..."
                className="w-full mt-1.5 p-3 rounded-xl border border-stone-200 text-sm resize-none h-16 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all font-medium text-stone-700 bg-white"
              />
            </div>

            {/* Listado del Carrito */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/30">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Platillos añadidos</h3>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-300 flex flex-col items-center justify-center gap-2">
                  <ShoppingBag size={32} className="opacity-20 text-[#0D261C]" />
                  <p className="text-xs font-bold text-stone-400">Sin platillos seleccionados</p>
                </div>
              ) : (
                cart.map((l) => (
                  <div key={l.productId} className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-[#0D261C] leading-snug flex-1">{l.productName}</p>
                      <button 
                        onClick={() => removeLine(l.productId)} 
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-50 transition-colors shrink-0"
                        title="Eliminar de la comanda"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-1 border border-stone-200/60">
                        <button
                          onClick={() => changeQty(l.productId, -1)}
                          className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 active:scale-90 transition-all text-stone-600 font-extrabold"
                          title="Restar 1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-extrabold w-8 text-center text-[#0D261C]">{l.quantity}</span>
                        <button
                          onClick={() => changeQty(l.productId, 1)}
                          className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 active:scale-90 transition-all text-stone-600 font-extrabold"
                          title="Sumar 1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-base font-extrabold text-[#D4AF37]">
                        ${(l.unitPrice * l.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total y botón crear */}
            <div className="p-4 border-t border-stone-100 bg-white">
              {/* Cupón */}
              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 mb-3 animate-fade-in">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Check size={14} className="shrink-0" /> Cupón aplicado
                  </span>
                  <button onClick={clearCoupon} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/10 transition-all">
                      <Ticket size={16} className="text-stone-400 shrink-0" />
                      <input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                        placeholder="Código de cupón"
                        className="w-full py-2.5 px-2 outline-none text-xs bg-transparent font-mono font-bold uppercase tracking-wider"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      disabled={checkingCoupon || !couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 transition-colors disabled:opacity-40"
                    >
                      {checkingCoupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500 mt-1 font-semibold">{couponError}</p>}
                </div>
              )}

              {discount > 0 && (
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-stone-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(0)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex items-center justify-between mb-2 text-xs font-bold text-emerald-600">
                  <span>Descuento</span>
                  <span>-${discount.toFixed(0)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4 bg-stone-50/50 p-3 rounded-2xl border border-stone-100">
                <span className="text-base font-bold text-stone-500">Total comanda</span>
                <span className="text-2xl font-black text-[#0D261C]">${total.toFixed(0)}</span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={saving || cart.length === 0}
                className="w-full py-4 rounded-2xl bg-[#0D261C] text-white font-extrabold text-base hover:bg-[#153a2b] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:shadow-lg hover:shadow-[#0D261C]/15 flex items-center justify-center gap-2"
              >
                {saving ? "Creando..." : "Crear comanda"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
