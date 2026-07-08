"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, RefreshCw, Utensils, X, FileText, Info, Inbox } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  listInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  listInvoiceRequests,
  processInvoiceRequest,
  INVOICE_STATUS_LABELS,
  USO_CFDI,
  REGIMEN_FISCAL,
  type InvoiceView,
  type InvoiceStatus,
  type InvoiceInput,
  type InvoiceRequestView,
} from "@/lib/services/invoices"

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  pending_data: "bg-amber-50 text-amber-700",
  ready: "bg-blue-50 text-blue-700",
  invoiced: "bg-emerald-50 text-emerald-700",
  sent: "bg-teal-50 text-teal-700",
  cancelled: "bg-red-50 text-red-500",
}

const FILTERS: { key: string; label: string; statuses?: InvoiceStatus[] }[] = [
  { key: "pending", label: "Por facturar", statuses: ["pending_data", "ready"] },
  { key: "done", label: "Facturadas", statuses: ["invoiced", "sent"] },
  { key: "all", label: "Todas" },
]

export default function FacturacionPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [invoices, setInvoices] = useState<InvoiceView[]>([])
  const [requests, setRequests] = useState<InvoiceRequestView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    try {
      const f = FILTERS.find((x) => x.key === filter)
      const [inv, reqs] = await Promise.all([
        listInvoices(supabase, f?.statuses),
        listInvoiceRequests(supabase),
      ])
      setInvoices(inv)
      setRequests(reqs)
    } catch (e) {
      console.error("Error al cargar facturas:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, filter])

  const acceptRequest = async (req: InvoiceRequestView) => {
    try {
      await processInvoiceRequest(supabase, req)
      load()
    } catch (e) {
      console.error(e)
      alert("No se pudo procesar la solicitud.")
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const changeStatus = async (inv: InvoiceView, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status } : x)))
    try {
      await updateInvoiceStatus(supabase, inv.id, status)
    } catch (e) {
      console.error(e)
      load()
    }
  }

  const remove = async (inv: InvoiceView) => {
    if (!confirm("¿Eliminar esta solicitud de factura?")) return
    try {
      await deleteInvoice(supabase, inv.id)
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
            <h1 className="font-serif text-lg font-bold leading-none">Facturación</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                filter === f.key ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-stone-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* Aviso importante */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Este módulo gestiona los <strong>datos fiscales y el estado</strong> de cada solicitud.
            El timbrado ante el SAT se hará cuando se integre un PAC de facturación.
          </p>
        </div>

        {/* Solicitudes enviadas por clientes desde la web */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/30 p-4">
            <h3 className="font-bold text-[#0D261C] mb-3 flex items-center gap-2">
              <Inbox size={16} className="text-[#D4AF37]" />
              Solicitudes de clientes ({requests.length})
            </h3>
            <div className="space-y-2">
              {requests.map((req) => {
                const c = req.customer ?? {}
                return (
                  <div key={req.id} className="flex items-center gap-3 border border-stone-100 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0D261C] text-sm">{c.razon_social || req.rfc}</p>
                      <p className="text-xs text-stone-400">
                        {req.rfc}
                        {c.order_number ? ` · Ticket ${c.order_number}` : ""}
                        {req.email ? ` · ${req.email}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptRequest(req)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0D261C] text-white hover:bg-[#153a2b] transition-colors shrink-0"
                    >
                      Procesar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Nueva solicitud de factura
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="animate-spin text-stone-400" size={22} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <FileText size={28} className="mx-auto mb-2" />
            <p className="text-sm">No hay solicitudes en esta vista.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[#0D261C]">{inv.razon_social || inv.rfc || "Sin datos"}</p>
                    <p className="text-xs text-stone-400">
                      {inv.rfc || "RFC pendiente"}
                      {inv.order?.order_number ? ` · Pedido #${inv.order.order_number}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#D4AF37]">${inv.amount.toFixed(0)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}>
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(["ready", "invoiced", "sent"] as InvoiceStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(inv, s)}
                      disabled={inv.status === s}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        inv.status === s
                          ? "bg-[#0D261C] text-white cursor-default"
                          : "bg-stone-50 border border-stone-200 text-stone-500 hover:border-[#D4AF37]"
                      }`}
                    >
                      {INVOICE_STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => changeStatus(inv, "cancelled")}
                    disabled={inv.status === "cancelled"}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                  <button onClick={() => remove(inv)} className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-stone-400 hover:text-red-500 transition-colors ml-auto">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <InvoiceForm
          supabase={supabase}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function InvoiceForm({
  supabase,
  onClose,
  onSaved,
}: {
  supabase: ReturnType<typeof createClient>
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<InvoiceInput>({
    rfc: "",
    razonSocial: "",
    usoCfdi: USO_CFDI[1].code,
    regimenFiscal: REGIMEN_FISCAL[4].code,
    cpFiscal: "",
    email: "",
    amount: 0,
  })
  const [amountStr, setAmountStr] = useState("")
  const [saving, setSaving] = useState(false)

  const set = (k: keyof InvoiceInput, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.rfc.trim()) {
      alert("El RFC es obligatorio.")
      return
    }
    setSaving(true)
    try {
      await createInvoice(supabase, { ...form, amount: Number(amountStr) || 0 })
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar la solicitud.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">Datos de facturación</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">RFC</label>
            <input
              value={form.rfc}
              onChange={(e) => set("rfc", e.target.value.toUpperCase())}
              placeholder="XAXX010101000"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Razón social</label>
            <input
              value={form.razonSocial}
              onChange={(e) => set("razonSocial", e.target.value)}
              placeholder="Nombre o razón social"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">CP fiscal</label>
              <input
                value={form.cpFiscal}
                onChange={(e) => set("cpFiscal", e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="55700"
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                <input
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full pl-7 p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Uso de CFDI</label>
            <select
              value={form.usoCfdi}
              onChange={(e) => set("usoCfdi", e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none text-sm"
            >
              {USO_CFDI.map((u) => <option key={u.code} value={u.code}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Régimen fiscal</label>
            <select
              value={form.regimenFiscal}
              onChange={(e) => set("regimenFiscal", e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none text-sm"
            >
              {REGIMEN_FISCAL.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Correo</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
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
            {saving ? "Guardando..." : "Guardar solicitud"}
          </button>
        </div>
      </div>
    </div>
  )
}
