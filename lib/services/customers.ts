// ============================================================================
//  Servicio de CLIENTES (CRM) — CRUD, historial de consumo y total gastado.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export interface CustomerView {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  birthday: string | null
  notes: string | null
  created_at: string
  // Agregados (se calculan aparte):
  ordersCount?: number
  totalSpent?: number
}

const SELECT = "id, full_name, phone, email, whatsapp, address, birthday, notes, created_at"

/** Lista clientes con su total gastado y número de pedidos (agregado en una consulta). */
export async function listCustomers(supabase: Client): Promise<CustomerView[]> {
  const { data: customers, error } = await supabase
    .from("customers")
    .select(SELECT)
    .eq("status", "active")
    .order("full_name", { ascending: true })
  if (error) throw error

  // Agregar totales por cliente desde orders (una sola consulta).
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id, total")
    .neq("status", "cancelled")
    .not("customer_id", "is", null)
  if (ordersError) throw ordersError

  const agg = new Map<string, { count: number; total: number }>()
  for (const o of orders ?? []) {
    if (!o.customer_id) continue
    const cur = agg.get(o.customer_id) ?? { count: 0, total: 0 }
    cur.count += 1
    cur.total += Number(o.total)
    agg.set(o.customer_id, cur)
  }

  return (customers ?? []).map((c) => {
    const a = agg.get(c.id)
    return { ...c, ordersCount: a?.count ?? 0, totalSpent: a?.total ?? 0 }
  })
}

export interface CustomerInput {
  fullName: string
  phone?: string
  email?: string
  whatsapp?: string
  address?: string
  birthday?: string
  notes?: string
}

export async function createCustomer(supabase: Client, input: CustomerInput): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      whatsapp: input.whatsapp ?? null,
      address: input.address ?? null,
      birthday: input.birthday || null,
      notes: input.notes ?? null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id
}

export async function updateCustomer(
  supabase: Client,
  id: string,
  input: CustomerInput,
): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      whatsapp: input.whatsapp ?? null,
      address: input.address ?? null,
      birthday: input.birthday || null,
      notes: input.notes ?? null,
    })
    .eq("id", id)
  if (error) throw error
}

/** Baja lógica (status archived) para no perder el historial de pedidos. */
export async function archiveCustomer(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("customers").update({ status: "archived" }).eq("id", id)
  if (error) throw error
}

export interface CustomerOrderRow {
  id: string
  order_number: number
  total: number
  status: string
  created_at: string
}

/** Historial de pedidos de un cliente. */
export async function getCustomerOrders(
  supabase: Client,
  customerId: string,
): Promise<CustomerOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((o) => ({ ...o, total: Number(o.total) }))
}
