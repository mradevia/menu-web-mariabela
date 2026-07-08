"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, RefreshCw, Utensils, X, Ticket, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  listCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
  COUPON_TYPE_LABELS,
  type CouponView,
  type CouponType,
  type CouponInput,
} from "@/lib/services/coupons"

function describeValue(c: CouponView): string {
  if (c.type === "percent") return `${c.value}% de descuento`
  if (c.type === "fixed") return `$${c.value} de descuento`
  return "2x1"
}

export default function CuponesPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [coupons, setCoupons] = useState<CouponView[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    try {
      setCoupons(await listCoupons(supabase))
    } catch (e) {
      console.error("Error al cargar cupones:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (c: CouponView) => {
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)))
    try {
      await toggleCoupon(supabase, c.id, !c.is_active)
    } catch (e) {
      console.error(e)
      load()
    }
  }

  const remove = async (c: CouponView) => {
    if (!confirm(`¿Eliminar el cupón ${c.code}?`)) return
    try {
      await deleteCoupon(supabase, c.id)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Cupones y promociones</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        <button onClick={() => setShowForm(true)} className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2">
          <Plus size={18} /> Crear cupón
        </button>

        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-stone-400" size={22} /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <Ticket size={28} className="mx-auto mb-2" />
            <p className="text-sm">Aún no hay cupones creados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => {
              const expired = c.ends_at && new Date(c.ends_at) < new Date()
              return (
                <div key={c.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${c.is_active && !expired ? "border-stone-100" : "border-stone-100 opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                      <Ticket size={20} className="text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D261C] font-mono tracking-wide">{c.code}</p>
                      <p className="text-xs text-stone-500">{describeValue(c)}</p>
                      <p className="text-[10px] text-stone-400">
                        {COUPON_TYPE_LABELS[c.type]}
                        {c.max_uses != null ? ` · ${c.used_count}/${c.max_uses} usos` : ` · ${c.used_count} usos`}
                        {expired ? " · Expirado" : ""}
                      </p>
                    </div>
                    <button onClick={() => toggle(c)} title={c.is_active ? "Desactivar" : "Activar"} className="shrink-0">
                      {c.is_active ? <ToggleRight size={30} className="text-emerald-500" /> : <ToggleLeft size={30} className="text-stone-300" />}
                    </button>
                    <button onClick={() => remove(c)} className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showForm && (
        <CouponForm supabase={supabase} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />
      )}
    </div>
  )
}

function CouponForm({ supabase, onClose, onSaved }: {
  supabase: ReturnType<typeof createClient>
  onClose: () => void
  onSaved: () => void
}) {
  const [code, setCode] = useState("")
  const [type, setType] = useState<CouponType>("percent")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!code.trim()) { alert("Escribe el código del cupón."); return }
    if (type !== "2x1" && (!value || Number(value) <= 0)) { alert("Escribe el valor del descuento."); return }
    setSaving(true)
    try {
      const input: CouponInput = {
        code: code.trim(),
        type,
        value: type === "2x1" ? 0 : Number(value),
        description: description.trim() || undefined,
        endsAt: endsAt || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
      }
      await createCoupon(supabase, input)
      onSaved()
    } catch (e: any) {
      console.error(e)
      alert(e?.message?.includes("duplicate") ? "Ya existe un cupón con ese código." : "No se pudo crear el cupón.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">Nuevo cupón</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Código</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="BIENVENIDA10" className={inputCls + " font-mono uppercase"} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(["percent", "fixed", "2x1"] as CouponType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${type === t ? "bg-[#0D261C] text-white" : "bg-stone-50 text-stone-500"}`}>
                  {COUPON_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          {type !== "2x1" && (
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
                {type === "percent" ? "Porcentaje (%)" : "Monto ($)"}
              </label>
              <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder={type === "percent" ? "10" : "50"} className={inputCls} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Vence (opcional)</label>
              <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Usos máx. (opcional)</label>
              <input value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Ilimitado" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Descripción (opcional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Promoción de apertura" className={inputCls} />
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-5 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-[2] py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : "Crear cupón"}
          </button>
        </div>
      </div>
    </div>
  )
}
