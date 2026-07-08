"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, QrCode, Pencil, Trash2, X, Download, RefreshCw, Utensils, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
  TABLE_STATUS_LABELS,
  type TableView,
  type TableStatus,
} from "@/lib/services/tables"
import { generateQrDataUrl, downloadQr } from "@/lib/qr"

const STATUS_COLORS: Record<TableStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  occupied: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_food: "bg-blue-50 text-blue-700 border-blue-200",
  to_pay: "bg-[#D4AF37]/10 text-[#8a6d1c] border-[#D4AF37]/30",
  reserved: "bg-purple-50 text-purple-700 border-purple-200",
  disabled: "bg-stone-100 text-stone-400 border-stone-200",
}

const STATUSES = Object.keys(TABLE_STATUS_LABELS) as TableStatus[]

export default function MesasPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [tables, setTables] = useState<TableView[]>([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState<{ table: TableView | null } | null>(null)
  const [qrModal, setQrModal] = useState<{ table: TableView; dataUrl: string } | null>(null)

  const load = useCallback(async () => {
    try {
      setTables(await listTables(supabase))
    } catch (e) {
      console.error("Error al cargar mesas:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()
    const channel = supabase
      .channel("mesas")
      .on("postgres_changes", { event: "*", schema: "public", table: "tables" }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, supabase])

  const cycleStatus = async (table: TableView) => {
    const idx = STATUSES.indexOf(table.status)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: next } : t)))
    try {
      await updateTable(supabase, table.id, { status: next })
    } catch (e) {
      console.error(e)
      load()
    }
  }

  const showQr = async (table: TableView) => {
    if (!table.qr_token) return
    const base = window.location.origin
    const url = `${base}/?mesa=${table.qr_token}`
    const dataUrl = await generateQrDataUrl(url)
    setQrModal({ table, dataUrl })
  }

  const removeTable = async (table: TableView) => {
    if (!confirm(`¿Eliminar la Mesa ${table.number}?`)) return
    try {
      await deleteTable(supabase, table.id)
      load()
    } catch (e) {
      console.error(e)
      alert("No se pudo eliminar la mesa.")
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Mesas</h1>
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
              href="/"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <Utensils size={15} /> <span className="hidden sm:inline">Menú</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5">
        <button
          onClick={() => setEditor({ table: null })}
          className="w-full mb-4 py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Agregar mesa
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-stone-400" size={24} />
          </div>
        ) : tables.length === 0 ? (
          <p className="text-center text-stone-400 py-12 text-sm">
            Aún no hay mesas. Agrega la primera para generar su QR.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`rounded-2xl border-2 p-4 ${STATUS_COLORS[table.status]} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-2xl font-bold text-[#0D261C]">{table.number}</p>
                    {table.name && <p className="text-xs text-stone-500">{table.name}</p>}
                  </div>
                  <span className="text-[10px] text-stone-400">{table.seats} pers.</span>
                </div>

                <button
                  onClick={() => cycleStatus(table)}
                  className="mt-2 w-full text-[11px] font-bold py-1 rounded-lg bg-white/60 hover:bg-white transition-colors"
                  title="Clic para cambiar estado"
                >
                  {TABLE_STATUS_LABELS[table.status]}
                </button>

                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => showQr(table)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/60 hover:bg-white text-[#0D261C] text-[11px] font-bold transition-colors"
                    title="Ver QR de la mesa"
                  >
                    <QrCode size={13} /> QR
                  </button>
                  <button
                    onClick={() => setEditor({ table })}
                    className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-stone-500 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeTable(table)}
                    className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-stone-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editor && (
        <TableEditor
          table={editor.table}
          existingNumbers={tables.map((t) => t.number)}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null)
            load()
          }}
        />
      )}

      {qrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-xs w-full text-center">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-[#0D261C]">Mesa {qrModal.table.number}</h3>
              <button onClick={() => setQrModal(null)} className="p-1.5 hover:bg-stone-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <img src={qrModal.dataUrl} alt={`QR Mesa ${qrModal.table.number}`} className="w-full rounded-2xl border border-stone-100" />
            <p className="text-xs text-stone-400 mt-2">
              El cliente escanea y ve el menú con su mesa asociada.
            </p>
            <button
              onClick={() => downloadQr(qrModal.dataUrl, `mesa-${qrModal.table.number}-qr.png`)}
              className="w-full mt-4 py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Descargar QR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TableEditor({
  table,
  existingNumbers,
  onClose,
  onSaved,
}: {
  table: TableView | null
  existingNumbers: number[]
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [number, setNumber] = useState(table ? String(table.number) : "")
  const [name, setName] = useState(table?.name ?? "")
  const [seats, setSeats] = useState(table ? String(table.seats) : "2")
  const [zone, setZone] = useState(table?.zone ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const num = Number(number)
    if (!num || num < 1) {
      alert("Escribe un número de mesa válido.")
      return
    }
    if (!table && existingNumbers.includes(num)) {
      alert(`Ya existe la Mesa ${num}.`)
      return
    }
    setSaving(true)
    try {
      if (table) {
        await updateTable(supabase, table.id, {
          number: num,
          name: name.trim(),
          seats: Number(seats) || 2,
          zone: zone.trim(),
        })
      } else {
        await createTable(supabase, {
          number: num,
          name: name.trim() || undefined,
          seats: Number(seats) || 2,
          zone: zone.trim() || undefined,
        })
      }
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar la mesa.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl">
        <div className="bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">{table ? "Editar mesa" : "Nueva mesa"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Número</label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="1"
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Personas</label>
              <input
                value={seats}
                onChange={(e) => setSeats(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="2"
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Nombre <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Terraza 1"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Zona <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="Ej: Interior, Terraza, Barra"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
        </div>
        <div className="p-5 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar mesa"}
          </button>
        </div>
      </div>
    </div>
  )
}
