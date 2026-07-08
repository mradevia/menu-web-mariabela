"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Plus,
  Search,
  RefreshCw,
  Utensils,
  Phone,
  Mail,
  MessageCircle,
  X,
  Pencil,
  Star,
  Cake,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  getCustomerOrders,
  type CustomerView,
  type CustomerInput,
  type CustomerOrderRow,
} from "@/lib/services/customers"

export default function ClientesPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<CustomerView[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editor, setEditor] = useState<{ customer: CustomerView | null } | null>(null)
  const [detail, setDetail] = useState<CustomerView | null>(null)

  const load = useCallback(async () => {
    try {
      setCustomers(await listCustomers(supabase))
    } catch (e) {
      console.error("Error al cargar clientes:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const term = search.trim().toLowerCase()
  const filtered = customers.filter(
    (c) =>
      !term ||
      c.full_name.toLowerCase().includes(term) ||
      (c.phone ?? "").includes(term) ||
      (c.email ?? "").toLowerCase().includes(term),
  )

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Clientes</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        <button
          onClick={() => setEditor({ customer: null })}
          className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Nuevo cliente
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center px-3">
          <Search size={18} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full py-3 px-2 outline-none text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="animate-spin text-stone-400" size={22} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-stone-400 py-10 text-sm">
            {customers.length === 0 ? "Aún no hay clientes registrados." : "Sin resultados."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setDetail(c)}
                className="w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5 flex items-center gap-3 text-left hover:border-[#D4AF37]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#0D261C]/5 flex items-center justify-center text-[#0D261C] font-bold shrink-0">
                  {c.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0D261C] truncate">{c.full_name}</p>
                  <p className="text-xs text-stone-400 truncate">
                    {c.phone || c.email || "Sin contacto"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[#D4AF37]">${(c.totalSpent ?? 0).toFixed(0)}</p>
                  <p className="text-[10px] text-stone-400">{c.ordersCount ?? 0} pedido(s)</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {editor && (
        <CustomerEditor
          supabase={supabase}
          customer={editor.customer}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null)
            load()
          }}
        />
      )}

      {detail && (
        <CustomerDetail
          supabase={supabase}
          customer={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setEditor({ customer: detail })
            setDetail(null)
          }}
          onArchived={() => {
            setDetail(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function CustomerDetail({
  supabase,
  customer,
  onClose,
  onEdit,
  onArchived,
}: {
  supabase: ReturnType<typeof createClient>
  customer: CustomerView
  onClose: () => void
  onEdit: () => void
  onArchived: () => void
}) {
  const [orders, setOrders] = useState<CustomerOrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerOrders(supabase, customer.id)
      .then(setOrders)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [supabase, customer.id])

  const wa = customer.whatsapp || customer.phone
  const waUrl = wa ? `https://wa.me/${wa.replace(/[^0-9]/g, "")}` : null

  const archive = async () => {
    if (!confirm(`¿Archivar a ${customer.full_name}? Su historial se conserva.`)) return
    try {
      await archiveCustomer(supabase, customer.id)
      onArchived()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold truncate">{customer.full_name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full shrink-0">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[#D4AF37]">${(customer.totalSpent ?? 0).toFixed(0)}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Total gastado</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[#0D261C]">{customer.ordersCount ?? 0}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Pedidos</p>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-1.5 text-sm">
            {customer.phone && (
              <p className="flex items-center gap-2 text-stone-600"><Phone size={14} className="text-[#D4AF37]" /> {customer.phone}</p>
            )}
            {customer.email && (
              <p className="flex items-center gap-2 text-stone-600"><Mail size={14} className="text-[#D4AF37]" /> {customer.email}</p>
            )}
            {customer.birthday && (
              <p className="flex items-center gap-2 text-stone-600"><Cake size={14} className="text-[#D4AF37]" /> {new Date(customer.birthday + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</p>
            )}
            {customer.notes && (
              <p className="flex items-start gap-2 text-stone-500 bg-amber-50 rounded-lg p-2 mt-2"><Star size={14} className="text-amber-500 shrink-0 mt-0.5" /> {customer.notes}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            {waUrl && (
              <a href={waUrl} target="_blank" className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            <button onClick={onEdit} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5">
              <Pencil size={15} /> Editar
            </button>
          </div>

          {/* Historial */}
          <div>
            <h3 className="font-bold text-[#0D261C] text-sm mb-2">Historial de pedidos</h3>
            {loading ? (
              <p className="text-xs text-stone-400 py-3 text-center">Cargando...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">Sin pedidos registrados aún.</p>
            ) : (
              <div className="space-y-1.5">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-sm border-b border-stone-50 pb-1.5 last:border-0">
                    <span className="text-stone-500">
                      #{o.order_number} · {new Date(o.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </span>
                    <span className="font-bold text-[#0D261C]">${o.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={archive} className="w-full text-xs text-stone-400 hover:text-red-500 transition-colors pt-2">
            Archivar cliente
          </button>
        </div>
      </div>
    </div>
  )
}

function CustomerEditor({
  supabase,
  customer,
  onClose,
  onSaved,
}: {
  supabase: ReturnType<typeof createClient>
  customer: CustomerView | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CustomerInput>({
    fullName: customer?.full_name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    whatsapp: customer?.whatsapp ?? "",
    address: customer?.address ?? "",
    birthday: customer?.birthday ?? "",
    notes: customer?.notes ?? "",
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof CustomerInput, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      alert("Escribe el nombre del cliente.")
      return
    }
    setSaving(true)
    try {
      if (customer) await updateCustomer(supabase, customer.id, form)
      else await createCustomer(supabase, form)
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar el cliente.")
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof CustomerInput, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">{customer ? "Editar cliente" : "Nuevo cliente"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {field("Nombre completo", "fullName", "text", "Ej: Ana López")}
          <div className="grid grid-cols-2 gap-3">
            {field("Teléfono", "phone", "tel", "55 1234 5678")}
            {field("WhatsApp", "whatsapp", "tel", "521551234...")}
          </div>
          {field("Correo", "email", "email", "correo@ejemplo.com")}
          {field("Cumpleaños", "birthday", "date")}
          {field("Dirección", "address", "text", "Calle, colonia...")}
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Notas <span className="font-normal text-stone-400 normal-case">(favoritos, alergias...)</span>
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Ej: le gusta la mesa de la ventana, alérgico a nueces..."
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none resize-none h-20"
            />
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-5 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  )
}
