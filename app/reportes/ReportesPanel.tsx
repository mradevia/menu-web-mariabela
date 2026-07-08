"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { RefreshCw, Utensils, Download, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  getSalesSummary,
  getDailySales,
  listExpenses,
  toCsv,
  downloadCsv,
  type SalesSummary,
  type DailySalesRow,
} from "@/lib/services/finance"

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default function ReportesPanel() {
  const supabase = useMemo(() => createClient(), [])
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [sales, setSales] = useState<SalesSummary | null>(null)
  const [daily, setDaily] = useState<DailySalesRow[]>([])
  const [expensesTotal, setExpensesTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const range = useMemo(() => {
    const from = new Date(year, month, 1, 0, 0, 0)
    const to = new Date(year, month + 1, 0, 23, 59, 59)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [year, month])

  const load = useCallback(async () => {
    try {
      const [summary, dailyRows, expenses] = await Promise.all([
        getSalesSummary(supabase, range.from, range.to),
        getDailySales(supabase, range.from, range.to),
        listExpenses(supabase, { from: range.from, to: range.to }),
      ])
      setSales(summary)
      setDaily(dailyRows)
      setExpensesTotal(expenses.reduce((s, e) => s + e.amount, 0))
    } catch (e) {
      console.error("Error al cargar reportes:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, range])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const net = sales?.net ?? 0
  const utilidad = net - expensesTotal
  const margen = net > 0 ? (utilidad / net) * 100 : 0
  const maxDay = Math.max(1, ...daily.map((d) => d.net))

  const exportCsv = () => {
    const rows = daily.map((d) => [d.date, d.ordersCount, d.net.toFixed(2)])
    rows.push(["", "", ""])
    rows.push(["TOTAL VENTAS", sales?.ordersCount ?? 0, net.toFixed(2)])
    rows.push(["TOTAL GASTOS", "", expensesTotal.toFixed(2)])
    rows.push(["UTILIDAD ESTIMADA", "", utilidad.toFixed(2)])
    const csv = toCsv(["Fecha", "Pedidos", "Ventas netas"], rows)
    downloadCsv(`reporte-${MONTHS[month].toLowerCase()}-${year}.csv`, csv)
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Reportes</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* Selector de periodo */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="p-2 rounded-lg border border-stone-200 text-sm font-bold outline-none">
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="p-2 rounded-lg border border-stone-200 text-sm font-bold outline-none">
            {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={exportCsv}
            disabled={loading || daily.length === 0}
            className="ml-auto px-4 py-2 rounded-lg bg-[#0D261C] text-white text-sm font-bold hover:bg-[#153a2b] transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-stone-400" size={24} />
          </div>
        ) : (
          <>
            {/* Tarjetas de utilidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                  <TrendingUp size={14} />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Ventas</p>
                </div>
                <p className="text-2xl font-bold text-[#0D261C]">${net.toFixed(0)}</p>
                <p className="text-[10px] text-stone-400">{sales?.ordersCount ?? 0} pedidos</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex items-center gap-1.5 text-red-400 mb-1">
                  <TrendingDown size={14} />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Gastos</p>
                </div>
                <p className="text-2xl font-bold text-red-500">${expensesTotal.toFixed(0)}</p>
              </div>
              <div className="col-span-2 bg-[#0D261C] rounded-2xl p-4 shadow-sm text-white">
                <div className="flex items-center gap-1.5 text-[#D4AF37] mb-1">
                  <Wallet size={14} />
                  <p className="text-[10px] uppercase tracking-widest font-bold">Utilidad estimada</p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold">${utilidad.toFixed(0)}</p>
                  <p className="text-sm text-stone-300">Margen {margen.toFixed(0)}%</p>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Aproximada: ventas − gastos registrados (no incluye costo de insumos por platillo).
                </p>
              </div>
            </div>

            {/* Ventas por día (barras simples) */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-[#0D261C] mb-3">Ventas por día</h3>
              {daily.length === 0 ? (
                <p className="text-sm text-stone-400 py-4 text-center">Sin ventas en este periodo.</p>
              ) : (
                <div className="space-y-1.5">
                  {daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 w-14 shrink-0">
                        {new Date(d.date + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                      </span>
                      <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-[#D4AF37] rounded-full"
                          style={{ width: `${(d.net / maxDay) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#0D261C] w-16 text-right shrink-0">${d.net.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
