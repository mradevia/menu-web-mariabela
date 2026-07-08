"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Plus,
  RefreshCw,
  Utensils,
  X,
  AlertTriangle,
  Package,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  Phone,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  archiveInventoryItem,
  registerMovement,
  listSuppliers,
  createSupplier,
  archiveSupplier,
  type InventoryItem,
  type SupplierView,
} from "@/lib/services/inventory"

export default function InventarioPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<"insumos" | "proveedores">("insumos")
  const [items, setItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<SupplierView[]>([])
  const [loading, setLoading] = useState(true)
  const [itemEditor, setItemEditor] = useState<{ item: InventoryItem | null } | null>(null)
  const [movement, setMovement] = useState<{ item: InventoryItem } | null>(null)
  const [supplierEditor, setSupplierEditor] = useState(false)

  const load = useCallback(async () => {
    try {
      const [inv, sup] = await Promise.all([listInventory(supabase), listSuppliers(supabase)])
      setItems(inv)
      setSuppliers(sup)
    } catch (e) {
      console.error("Error al cargar inventario:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const lowStock = items.filter((i) => i.current_stock <= i.min_stock)

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Inventario</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          <button onClick={() => setTab("insumos")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${tab === "insumos" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"}`}>
            <Package size={16} /> Insumos
          </button>
          <button onClick={() => setTab("proveedores")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${tab === "proveedores" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"}`}>
            <Truck size={16} /> Proveedores
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="animate-spin text-stone-400" size={22} />
          </div>
        ) : tab === "insumos" ? (
          <>
            {lowStock.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>{lowStock.length} insumo(s)</strong> en o por debajo del stock mínimo:{" "}
                  {lowStock.map((i) => i.name).join(", ")}.
                </p>
              </div>
            )}

            <button onClick={() => setItemEditor({ item: null })} className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Agregar insumo
            </button>

            {items.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">Aún no hay insumos registrados.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const low = item.current_stock <= item.min_stock
                  return (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#0D261C] truncate">{item.name}</p>
                          <p className="text-xs text-stone-400">
                            {item.supplier?.name ? `${item.supplier.name} · ` : ""}Mín: {item.min_stock} {item.unit}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold ${low ? "text-red-500" : "text-[#0D261C]"}`}>
                            {item.current_stock} {item.unit}
                          </p>
                          {low && <p className="text-[10px] text-red-400 font-bold">Bajo stock</p>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        <button onClick={() => setMovement({ item })} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-600 transition-colors">
                          <ArrowDownCircle size={13} className="text-emerald-500" /> Movimiento
                        </button>
                        <button onClick={() => setItemEditor({ item })} className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-500 transition-colors">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setSupplierEditor(true)} className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Agregar proveedor
            </button>
            {suppliers.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">Aún no hay proveedores registrados.</p>
            ) : (
              <div className="space-y-2">
                {suppliers.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D261C] truncate">{s.name}</p>
                      <p className="text-xs text-stone-400 truncate">
                        {s.product || "—"}{s.contact_name ? ` · ${s.contact_name}` : ""}
                      </p>
                    </div>
                    {s.last_price != null && <span className="text-sm font-bold text-[#D4AF37]">${s.last_price.toFixed(0)}</span>}
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="p-2 rounded-lg bg-stone-50 text-stone-500 hover:text-[#0D261C] transition-colors">
                        <Phone size={15} />
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Archivar a ${s.name}?`)) return
                        await archiveSupplier(supabase, s.id)
                        load()
                      }}
                      className="p-2 rounded-lg bg-stone-50 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {itemEditor && (
        <ItemEditor
          supabase={supabase}
          item={itemEditor.item}
          suppliers={suppliers}
          onClose={() => setItemEditor(null)}
          onSaved={() => {
            setItemEditor(null)
            load()
          }}
        />
      )}

      {movement && (
        <MovementModal
          supabase={supabase}
          item={movement.item}
          onClose={() => setMovement(null)}
          onSaved={() => {
            setMovement(null)
            load()
          }}
        />
      )}

      {supplierEditor && (
        <SupplierEditor
          supabase={supabase}
          onClose={() => setSupplierEditor(false)}
          onSaved={() => {
            setSupplierEditor(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function ItemEditor({ supabase, item, suppliers, onClose, onSaved }: {
  supabase: ReturnType<typeof createClient>
  item: InventoryItem | null
  suppliers: SupplierView[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(item?.name ?? "")
  const [unit, setUnit] = useState(item?.unit ?? "kg")
  const [currentStock, setCurrentStock] = useState(item ? String(item.current_stock) : "0")
  const [minStock, setMinStock] = useState(item ? String(item.min_stock) : "0")
  const [cost, setCost] = useState(item ? String(item.cost) : "0")
  const [supplierId, setSupplierId] = useState(item?.supplier_id ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { alert("Escribe el nombre del insumo."); return }
    setSaving(true)
    try {
      if (item) {
        await updateInventoryItem(supabase, item.id, { name: name.trim(), unit, minStock: Number(minStock) || 0, cost: Number(cost) || 0, supplierId: supplierId || undefined })
      } else {
        await createInventoryItem(supabase, { name: name.trim(), unit, currentStock: Number(currentStock) || 0, minStock: Number(minStock) || 0, cost: Number(cost) || 0, supplierId: supplierId || undefined })
      }
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar el insumo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={item ? "Editar insumo" : "Nuevo insumo"} onClose={onClose}>
      <div className="p-6 space-y-4">
        <Field label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Jitomate" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unidad">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              {["kg", "g", "l", "ml", "pza", "caja", "bolsa"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          {!item && <Field label="Stock inicial"><input value={currentStock} onChange={(e) => setCurrentStock(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={inputCls} /></Field>}
          {item && <Field label="Stock actual"><input value={String(item.current_stock)} disabled className={inputCls + " bg-stone-50 text-stone-400"} /></Field>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock mínimo"><input value={minStock} onChange={(e) => setMinStock(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={inputCls} /></Field>
          <Field label="Costo unitario"><input value={cost} onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={inputCls} /></Field>
        </div>
        <Field label="Proveedor (opcional)">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputCls}>
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
      </div>
      <ModalFooter saving={saving} onClose={onClose} onSave={handleSave} label="Guardar insumo" />
    </Modal>
  )
}

function MovementModal({ supabase, item, onClose, onSaved }: {
  supabase: ReturnType<typeof createClient>
  item: InventoryItem
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<"in" | "out" | "adjustment">("in")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const q = Number(quantity)
    if (isNaN(q) || q < 0) { alert("Escribe una cantidad válida."); return }
    setSaving(true)
    try {
      await registerMovement(supabase, item, type, q, reason.trim() || undefined)
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo registrar el movimiento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Movimiento — ${item.name}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        <p className="text-sm text-stone-500">Stock actual: <strong className="text-[#0D261C]">{item.current_stock} {item.unit}</strong></p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setType("in")} className={`py-2.5 rounded-xl text-xs font-bold transition-colors flex flex-col items-center gap-1 ${type === "in" ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200" : "bg-stone-50 text-stone-500 border-2 border-transparent"}`}>
            <ArrowDownCircle size={16} /> Entrada
          </button>
          <button onClick={() => setType("out")} className={`py-2.5 rounded-xl text-xs font-bold transition-colors flex flex-col items-center gap-1 ${type === "out" ? "bg-red-50 text-red-500 border-2 border-red-200" : "bg-stone-50 text-stone-500 border-2 border-transparent"}`}>
            <ArrowUpCircle size={16} /> Salida
          </button>
          <button onClick={() => setType("adjustment")} className={`py-2.5 rounded-xl text-xs font-bold transition-colors flex flex-col items-center gap-1 ${type === "adjustment" ? "bg-blue-50 text-blue-600 border-2 border-blue-200" : "bg-stone-50 text-stone-500 border-2 border-transparent"}`}>
            <Pencil size={16} /> Ajuste
          </button>
        </div>
        <Field label={type === "adjustment" ? "Nuevo stock total" : "Cantidad"}>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0" className={inputCls} autoFocus />
        </Field>
        <Field label="Motivo (opcional)">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: compra, merma, conteo físico" className={inputCls} />
        </Field>
      </div>
      <ModalFooter saving={saving} onClose={onClose} onSave={handleSave} label="Registrar" />
    </Modal>
  )
}

function SupplierEditor({ supabase, onClose, onSaved }: {
  supabase: ReturnType<typeof createClient>
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [product, setProduct] = useState("")
  const [lastPrice, setLastPrice] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { alert("Escribe el nombre del proveedor."); return }
    setSaving(true)
    try {
      await createSupplier(supabase, {
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        product: product.trim() || undefined,
        lastPrice: lastPrice ? Number(lastPrice) : undefined,
      })
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar el proveedor.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Nuevo proveedor" onClose={onClose}>
      <div className="p-6 space-y-4">
        <Field label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Verduras del Valle" className={inputCls} /></Field>
        <Field label="Contacto (opcional)"><input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nombre del contacto" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono"><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="55 1234 5678" className={inputCls} /></Field>
          <Field label="Último precio"><input value={lastPrice} onChange={(e) => setLastPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0" className={inputCls} /></Field>
        </div>
        <Field label="Producto que vende"><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ej: Verduras, carnes, abarrotes" className={inputCls} /></Field>
      </div>
      <ModalFooter saving={saving} onClose={onClose} onSave={handleSave} label="Guardar proveedor" />
    </Modal>
  )
}

// --- Componentes UI compartidos ---
const inputCls = "w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl z-10">
          <h2 className="font-serif text-xl font-bold truncate">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full shrink-0"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalFooter({ saving, onClose, onSave, label }: { saving: boolean; onClose: () => void; onSave: () => void; label: string }) {
  return (
    <div className="sticky bottom-0 bg-white p-5 border-t border-stone-100 flex gap-3">
      <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm">Cancelar</button>
      <button onClick={onSave} disabled={saving} className="flex-[2] py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors disabled:opacity-50">
        {saving ? "Guardando..." : label}
      </button>
    </div>
  )
}
