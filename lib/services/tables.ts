// ============================================================================
//  Servicio de MESAS — CRUD, estados y token para el QR por mesa.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type TableStatus =
  | "available"
  | "occupied"
  | "waiting_food"
  | "to_pay"
  | "reserved"
  | "disabled"

export interface TableView {
  id: string
  number: number
  name: string | null
  seats: number
  zone: string | null
  status: TableStatus
  qr_token: string | null
}

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: "Libre",
  occupied: "Ocupada",
  waiting_food: "Esperando comida",
  to_pay: "Lista para pagar",
  reserved: "Reservada",
  disabled: "Deshabilitada",
}

/** Genera un token corto y único para el QR de una mesa. */
function makeToken(): string {
  return "mesa-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)
}

export async function listTables(supabase: Client): Promise<TableView[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("id, number, name, seats, zone, status, qr_token")
    .order("number", { ascending: true })
  if (error) throw error
  return (data ?? []) as TableView[]
}

export async function createTable(
  supabase: Client,
  input: { number: number; name?: string; seats?: number; zone?: string },
): Promise<TableView> {
  const { data, error } = await supabase
    .from("tables")
    .insert({
      number: input.number,
      name: input.name ?? null,
      seats: input.seats ?? 2,
      zone: input.zone ?? null,
      qr_token: makeToken(),
    })
    .select("id, number, name, seats, zone, status, qr_token")
    .single()
  if (error) throw error
  return data as TableView
}

export async function updateTable(
  supabase: Client,
  id: string,
  patch: Partial<{ number: number; name: string; seats: number; zone: string; status: TableStatus }>,
): Promise<void> {
  const { error } = await supabase.from("tables").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteTable(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("tables").delete().eq("id", id)
  if (error) throw error
}

/** Busca una mesa por su token de QR (para asociar pedidos desde el QR). */
export async function findTableByToken(
  supabase: Client,
  token: string,
): Promise<TableView | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("id, number, name, seats, zone, status, qr_token")
    .eq("qr_token", token)
    .maybeSingle()
  if (error) throw error
  return (data as TableView) ?? null
}
