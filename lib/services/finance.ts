// ============================================================================
//  Servicio de FINANZAS — corte de caja, gastos, resumen de ventas y CSV.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

// ---------------------------------------------------------------------------
//  Utilidades de fecha
// ---------------------------------------------------------------------------
export function startOfDay(d = new Date()): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
export function endOfDay(d = new Date()): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

// ---------------------------------------------------------------------------
//  GASTOS
// ---------------------------------------------------------------------------
export const EXPENSE_CATEGORIES = [
  "renta",
  "luz",
  "agua",
  "gas",
  "nomina",
  "insumos",
  "reparaciones",
  "publicidad",
  "otros",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  renta: "Renta",
  luz: "Luz",
  agua: "Agua",
  gas: "Gas",
  nomina: "Nómina",
  insumos: "Insumos",
  reparaciones: "Reparaciones",
  publicidad: "Publicidad",
  otros: "Otros",
}

export interface ExpenseView {
  id: string
  category: string
  amount: number
  description: string | null
  paid_at: string | null
  created_at: string
}

export async function listExpenses(
  supabase: Client,
  opts?: { from?: string; to?: string },
): Promise<ExpenseView[]> {
  let query = supabase
    .from("expenses")
    .select("id, category, amount, description, paid_at, created_at")
    .eq("status", "registered")
    .order("created_at", { ascending: false })

  if (opts?.from) query = query.gte("created_at", opts.from)
  if (opts?.to) query = query.lte("created_at", opts.to)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((e) => ({ ...e, amount: Number(e.amount) }))
}

export async function createExpense(
  supabase: Client,
  input: { category: ExpenseCategory; amount: number; description?: string; paidAt?: string },
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from("expenses").insert({
    category: input.category,
    amount: input.amount,
    description: input.description ?? null,
    paid_at: input.paidAt ?? new Date().toISOString().slice(0, 10),
    created_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function deleteExpense(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
//  VENTAS (desde pedidos completados/pagados)
// ---------------------------------------------------------------------------
export interface SalesSummary {
  ordersCount: number
  gross: number
  discounts: number
  net: number
}

/** Resume las ventas (pedidos no cancelados) en un rango de fechas. */
export async function getSalesSummary(
  supabase: Client,
  from: string,
  to: string,
): Promise<SalesSummary> {
  const { data, error } = await supabase
    .from("orders")
    .select("total, discount")
    .neq("status", "cancelled")
    .gte("created_at", from)
    .lte("created_at", to)
  if (error) throw error

  const rows = data ?? []
  const gross = rows.reduce((s, o) => s + Number(o.total) + Number(o.discount), 0)
  const discounts = rows.reduce((s, o) => s + Number(o.discount), 0)
  const net = rows.reduce((s, o) => s + Number(o.total), 0)
  return { ordersCount: rows.length, gross, discounts, net }
}

export interface DailySalesRow {
  date: string
  ordersCount: number
  net: number
}

/** Ventas agrupadas por día en un rango (para reportes y CSV). */
export async function getDailySales(
  supabase: Client,
  from: string,
  to: string,
): Promise<DailySalesRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .neq("status", "cancelled")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true })
  if (error) throw error

  const byDay = new Map<string, { count: number; net: number }>()
  for (const o of data ?? []) {
    const key = new Date(o.created_at).toISOString().slice(0, 10)
    const cur = byDay.get(key) ?? { count: 0, net: 0 }
    cur.count += 1
    cur.net += Number(o.total)
    byDay.set(key, cur)
  }
  return [...byDay.entries()].map(([date, v]) => ({ date, ordersCount: v.count, net: v.net }))
}

// ---------------------------------------------------------------------------
//  CORTE DE CAJA
// ---------------------------------------------------------------------------
export interface CashSession {
  id: string
  opening_amount: number
  cash_sales: number
  card_sales: number
  transfer_sales: number
  mp_sales: number
  tips: number
  expenses_total: number
  expected_amount: number
  counted_amount: number | null
  difference: number | null
  status: string
  opened_at: string
  closed_at: string | null
}

/** Devuelve la sesión de caja abierta (si hay alguna). */
export async function getOpenCashSession(supabase: Client): Promise<CashSession | null> {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as CashSession) ?? null
}

export async function openCashSession(supabase: Client, openingAmount: number): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from("cash_register_sessions").insert({
    opening_amount: openingAmount,
    opened_by: user?.id ?? null,
  })
  if (error) throw error
}

export interface CloseCashInput {
  cashSales: number
  cardSales: number
  transferSales: number
  mpSales: number
  tips: number
  expensesTotal: number
  countedAmount: number
}

/** Cierra la caja calculando efectivo esperado y diferencia. */
export async function closeCashSession(
  supabase: Client,
  session: CashSession,
  input: CloseCashInput,
): Promise<{ expected: number; difference: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const expected = session.opening_amount + input.cashSales + input.tips - input.expensesTotal
  const difference = input.countedAmount - expected

  const { error } = await supabase
    .from("cash_register_sessions")
    .update({
      cash_sales: input.cashSales,
      card_sales: input.cardSales,
      transfer_sales: input.transferSales,
      mp_sales: input.mpSales,
      tips: input.tips,
      expenses_total: input.expensesTotal,
      expected_amount: expected,
      counted_amount: input.countedAmount,
      difference,
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: user?.id ?? null,
    })
    .eq("id", session.id)

  if (error) throw error
  return { expected, difference }
}

/** Historial de cortes cerrados. */
export async function listCashSessions(supabase: Client, limit = 30): Promise<CashSession[]> {
  const { data, error } = await supabase
    .from("cash_register_sessions")
    .select("*")
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as CashSession[]
}

// ---------------------------------------------------------------------------
//  CSV — genera y descarga en el navegador
// ---------------------------------------------------------------------------
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM para que Excel abra bien los acentos.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
