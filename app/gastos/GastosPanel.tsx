"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, Trash2, RefreshCw, Utensils, Download, Receipt } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  listExpenses,
  createExpense,
  deleteExpense,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  toCsv,
  downloadCsv,
  type ExpenseView,
  type ExpenseCategory,
} from "@/lib/services/finance"

// Filtro por mes (por defecto el mes actual).
function monthRange(year: number, month: number) {
  const from = new Date(year, month, 1, 0, 0, 0)
  const to = new Date(year, month + 1, 0, 23, 59, 59)
  return { from: from.toISOString(), to: to.toISOString() }
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default function GastosPanel() {
  const supabase = useMemo(() => createClient(), [])
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [expenses, setExpenses] = useState<ExpenseView[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    try {
      const { from, to } = monthRange(year, month)
      setExpenses(await listExpenses(supabase, { from, to }))
    } catch (e) {
      console.error("Error al cargar gastos:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, year, month])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  const exportCsv = () => {
    const rows = expenses.map((e) => [
      new Date(e.created_at).toLocaleDateString("es-MX"),
      EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category,
      e.description ?? "",
      e.amount,
    ])
    const csv = toCsv(["Fecha", "Categoría", "Descripción", "Monto"], rows)
    downloadCsv(`gastos-${MONTHS[month].toLowerCase()}-${year}.csv`, csv)
  }

  const remove = async (e: ExpenseView) => {
    if (!confirm("¿Eliminar este gasto?")) return
    try {
      await deleteExpense(supabase, e.id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Gastos</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* Selector de mes + total */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="p-2 rounded-lg border border-stone-200 text-sm font-bold outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="p-2 rounded-lg border border-stone-200 text-sm font-bold outline-none"
            >
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="ml-auto text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Total del mes</p>
              <p className="text-xl font-bold text-red-500">${total.toFixed(0)}</p>
            </div>
          </div>
          {byCategory.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {byCategory.map(([cat, amount]) => (
                <span key={cat} className="text-[11px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                  {EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat}: ${amount.toFixed(0)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 py-3 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Registrar gasto
          </button>
          <button
            onClick={exportCsv}
            disabled={expenses.length === 0}
            className="px-4 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={16} /> <span className="hidden sm:inline">CSV</span>
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="animate-spin text-stone-400" size={22} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <Receipt size={28} className="mx-auto mb-2" />
            <p className="text-sm">No hay gastos en {MONTHS[month]} {year}.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 divide-y divide-stone-50">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3.5">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0D261C] text-sm">
                    {EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category}
                  </p>
                  {e.description && <p className="text-xs text-stone-400 truncate">{e.description}</p>}
                  <p className="text-[10px] text-stone-400">{new Date(e.created_at).toLocaleDateString("es-MX")}</p>
                </div>
                <span className="font-bold text-red-500">${e.amount.toFixed(0)}</span>
                <button onClick={() => remove(e)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ExpenseForm
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

function ExpenseForm({
  supabase,
  onClose,
  onSaved,
}: {
  supabase: ReturnType<typeof createClient>
  onClose: () => void
  onSaved: () => void
}) {
  const [category, setCategory] = useState<ExpenseCategory>("insumos")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Escribe un monto válido.")
      return
    }
    setSaving(true)
    try {
      await createExpense(supabase, {
        category,
        amount: Number(amount),
        description: description.trim() || undefined,
      })
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo registrar el gasto.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl">
        <div className="bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">Registrar gasto</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                className="w-full pl-9 p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Descripción <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: proveedor de verduras"
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
            {saving ? "Guardando..." : "Guardar gasto"}
          </button>
        </div>
      </div>
    </div>
  )
}
