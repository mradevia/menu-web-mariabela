"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { RefreshCw, Utensils, Lock, Unlock, DollarSign, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  getOpenCashSession,
  openCashSession,
  closeCashSession,
  listCashSessions,
  getSalesSummary,
  listExpenses,
  startOfDay,
  endOfDay,
  type CashSession,
} from "@/lib/services/finance"

export default function CajaPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<CashSession | null>(null)
  const [history, setHistory] = useState<CashSession[]>([])
  const [todaySalesNet, setTodaySalesNet] = useState(0)
  const [todayExpenses, setTodayExpenses] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const from = startOfDay().toISOString()
      const to = endOfDay().toISOString()
      const [open, hist, sales, expenses] = await Promise.all([
        getOpenCashSession(supabase),
        listCashSessions(supabase, 15),
        getSalesSummary(supabase, from, to),
        listExpenses(supabase, { from, to }),
      ])
      setSession(open)
      setHistory(hist)
      setTodaySalesNet(sales.net)
      setTodayExpenses(expenses.reduce((s, e) => s + e.amount, 0))
    } catch (e) {
      console.error("Error al cargar caja:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <RefreshCw className="animate-spin text-stone-400" size={26} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Corte de caja</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <a href="/admin" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
            <Utensils size={15} /> <span className="hidden sm:inline">Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* Resumen del día */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Ventas de hoy</p>
            <p className="text-2xl font-bold text-[#0D261C]">${todaySalesNet.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Gastos de hoy</p>
            <p className="text-2xl font-bold text-red-500">${todayExpenses.toFixed(0)}</p>
          </div>
        </div>

        {session ? (
          <CloseCashForm
            session={session}
            suggestedExpenses={todayExpenses}
            onClosed={load}
            supabase={supabase}
          />
        ) : (
          <OpenCashForm onOpened={load} supabase={supabase} />
        )}

        {/* Historial de cortes */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
          <h3 className="font-bold text-[#0D261C] mb-3 flex items-center gap-2">
            <History size={16} className="text-[#D4AF37]" /> Cortes recientes
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">Aún no hay cortes cerrados.</p>
          ) : (
            <div className="space-y-2">
              {history.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b border-stone-50 pb-2 last:border-0">
                  <div>
                    <p className="font-bold text-[#0D261C]">
                      {s.closed_at ? new Date(s.closed_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                    <p className="text-xs text-stone-400">
                      Esperado ${s.expected_amount.toFixed(0)} · Contado ${(s.counted_amount ?? 0).toFixed(0)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      (s.difference ?? 0) === 0
                        ? "text-stone-500"
                        : (s.difference ?? 0) > 0
                          ? "text-emerald-600"
                          : "text-red-500"
                    }`}
                  >
                    {(s.difference ?? 0) > 0 ? "+" : ""}${(s.difference ?? 0).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function OpenCashForm({ onOpened, supabase }: { onOpened: () => void; supabase: ReturnType<typeof createClient> }) {
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)

  const handleOpen = async () => {
    setSaving(true)
    try {
      await openCashSession(supabase, Number(amount) || 0)
      onOpened()
    } catch (e) {
      console.error(e)
      alert("No se pudo abrir la caja.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[#0D261C]/5 flex items-center justify-center mx-auto mb-3">
        <Unlock size={24} className="text-[#0D261C]" />
      </div>
      <h3 className="font-serif font-bold text-lg text-[#0D261C] mb-1">Caja cerrada</h3>
      <p className="text-sm text-stone-500 mb-4">Abre la caja registrando el efectivo inicial del turno.</p>
      <div className="relative max-w-xs mx-auto mb-3">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">$</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder="Efectivo inicial"
          className="w-full pl-9 p-3.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none text-center font-medium"
        />
      </div>
      <button
        onClick={handleOpen}
        disabled={saving}
        className="w-full max-w-xs mx-auto py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors disabled:opacity-50"
      >
        {saving ? "Abriendo..." : "Abrir caja"}
      </button>
    </div>
  )
}

function CloseCashForm({
  session,
  suggestedExpenses,
  onClosed,
  supabase,
}: {
  session: CashSession
  suggestedExpenses: number
  onClosed: () => void
  supabase: ReturnType<typeof createClient>
}) {
  const [cashSales, setCashSales] = useState("")
  const [cardSales, setCardSales] = useState("")
  const [transferSales, setTransferSales] = useState("")
  const [mpSales, setMpSales] = useState("")
  const [tips, setTips] = useState("")
  const [expensesTotal, setExpensesTotal] = useState(String(suggestedExpenses || ""))
  const [counted, setCounted] = useState("")
  const [saving, setSaving] = useState(false)

  const n = (v: string) => Number(v) || 0
  const expected = session.opening_amount + n(cashSales) + n(tips) - n(expensesTotal)
  const difference = n(counted) - expected

  const handleClose = async () => {
    if (!confirm("¿Cerrar la caja con estos valores? No se podrá modificar después.")) return
    setSaving(true)
    try {
      await closeCashSession(supabase, session, {
        cashSales: n(cashSales),
        cardSales: n(cardSales),
        transferSales: n(transferSales),
        mpSales: n(mpSales),
        tips: n(tips),
        expensesTotal: n(expensesTotal),
        countedAmount: n(counted),
      })
      onClosed()
    } catch (e) {
      console.error(e)
      alert("No se pudo cerrar la caja.")
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, hint?: string) => (
    <div>
      <label className="block text-xs font-bold text-[#0D261C] mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
        <input
          value={value}
          onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder="0"
          className="w-full pl-7 p-2.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none text-sm"
        />
      </div>
      {hint && <p className="text-[10px] text-stone-400 mt-0.5">{hint}</p>}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <Lock size={18} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-[#0D261C]">Caja abierta</h3>
          <p className="text-xs text-stone-400">
            Efectivo inicial: ${session.opening_amount.toFixed(0)} · Abierta{" "}
            {new Date(session.opened_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {field("Ventas en efectivo", cashSales, setCashSales)}
        {field("Ventas con tarjeta", cardSales, setCardSales)}
        {field("Transferencias", transferSales, setTransferSales)}
        {field("Mercado Pago", mpSales, setMpSales)}
        {field("Propinas", tips, setTips)}
        {field("Gastos del día", expensesTotal, setExpensesTotal, "Sugerido de tus gastos registrados")}
      </div>

      <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Efectivo esperado</span>
          <span className="font-bold text-[#0D261C]">${expected.toFixed(0)}</span>
        </div>
        <div className="border-t border-stone-200 pt-2">
          <label className="block text-xs font-bold text-[#0D261C] mb-1">Efectivo contado</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
            <input
              value={counted}
              onChange={(e) => setCounted(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="Cuenta el efectivo en caja"
              className="w-full pl-7 p-2.5 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between text-sm pt-1">
          <span className="text-stone-500">Diferencia</span>
          <span className={`font-bold ${difference === 0 ? "text-stone-600" : difference > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {difference > 0 ? "+" : ""}${difference.toFixed(0)}
          </span>
        </div>
      </div>

      <button
        onClick={handleClose}
        disabled={saving}
        className="w-full py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <DollarSign size={18} /> {saving ? "Cerrando..." : "Cerrar caja"}
      </button>
    </div>
  )
}
