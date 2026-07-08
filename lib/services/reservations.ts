// ============================================================================
//  Servicio de RESERVACIONES — CRUD, cambio de estado y comprobante WhatsApp.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "attended"
  | "no_show"

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  attended: "Asistió",
  no_show: "No asistió",
}

export interface ReservationView {
  id: string
  customer_name: string
  phone: string | null
  email: string | null
  party_size: number
  reserved_for: string // ISO
  deposit_amount: number
  payment_status: string
  notes: string | null
  status: ReservationStatus
  table_id: string | null
}

const SELECT = `
  id, customer_name, phone, email, party_size, reserved_for,
  deposit_amount, payment_status, notes, status, table_id
`

function mapRow(row: any): ReservationView {
  return {
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    email: row.email,
    party_size: row.party_size,
    reserved_for: row.reserved_for,
    deposit_amount: Number(row.deposit_amount),
    payment_status: row.payment_status,
    notes: row.notes,
    status: row.status,
    table_id: row.table_id,
  }
}

/** Reservaciones en un rango de fechas (inclusive). Fechas en ISO. */
export async function listReservations(
  supabase: Client,
  opts?: { from?: string; to?: string; statuses?: ReservationStatus[] },
): Promise<ReservationView[]> {
  let query = supabase.from("reservations").select(SELECT).order("reserved_for", { ascending: true })

  if (opts?.from) query = query.gte("reserved_for", opts.from)
  if (opts?.to) query = query.lte("reserved_for", opts.to)
  if (opts?.statuses?.length) query = query.in("status", opts.statuses)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export interface NewReservationInput {
  customerName: string
  phone?: string
  email?: string
  partySize: number
  reservedFor: string // ISO
  depositAmount?: number
  notes?: string
}

export async function createReservation(
  supabase: Client,
  input: NewReservationInput,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      customer_name: input.customerName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      party_size: input.partySize,
      reserved_for: input.reservedFor,
      deposit_amount: input.depositAmount ?? 0,
      payment_status: (input.depositAmount ?? 0) > 0 ? "paid" : "none",
      notes: input.notes ?? null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id
}

/**
 * Crea una reservación desde el FORMULARIO PÚBLICO (cliente sin login).
 * Entra siempre como 'pending' y sin anticipo (lo exige la política RLS).
 * El staff la confirma después desde /reservaciones.
 */
export async function createPublicReservation(
  supabase: Client,
  input: {
    customerName: string
    phone?: string
    email?: string
    partySize: number
    reservedFor: string
    notes?: string
  },
): Promise<void> {
  const { error } = await supabase.from("reservations").insert({
    customer_name: input.customerName,
    phone: input.phone ?? null,
    email: input.email ?? null,
    party_size: input.partySize,
    reserved_for: input.reservedFor,
    notes: input.notes ?? null,
    status: "pending",
    deposit_amount: 0,
    payment_status: "none",
  })
  if (error) throw error
}

export async function updateReservationStatus(
  supabase: Client,
  id: string,
  status: ReservationStatus,
): Promise<void> {
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id)
  if (error) throw error
}

export async function updateReservation(
  supabase: Client,
  id: string,
  patch: Partial<NewReservationInput>,
): Promise<void> {
  const row: Database["public"]["Tables"]["reservations"]["Update"] = {}
  if (patch.customerName !== undefined) row.customer_name = patch.customerName
  if (patch.phone !== undefined) row.phone = patch.phone
  if (patch.email !== undefined) row.email = patch.email
  if (patch.partySize !== undefined) row.party_size = patch.partySize
  if (patch.reservedFor !== undefined) row.reserved_for = patch.reservedFor
  if (patch.depositAmount !== undefined) row.deposit_amount = patch.depositAmount
  if (patch.notes !== undefined) row.notes = patch.notes

  const { error } = await supabase.from("reservations").update(row).eq("id", id)
  if (error) throw error
}

export async function deleteReservation(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("reservations").delete().eq("id", id)
  if (error) throw error
}

/** Construye un mensaje de WhatsApp listo para confirmar/recordar la reserva. */
export function buildReservationWhatsappUrl(
  reservation: ReservationView,
  kind: "confirm" | "reminder",
): string | null {
  if (!reservation.phone) return null
  const date = new Date(reservation.reserved_for)
  const fecha = date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
  const hora = date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

  const message =
    kind === "confirm"
      ? `Hola ${reservation.customer_name}, confirmamos tu reservación en Maria Bela para ${reservation.party_size} persona(s) el ${fecha} a las ${hora}. ¡Te esperamos!`
      : `Hola ${reservation.customer_name}, te recordamos tu reservación en Maria Bela hoy ${fecha} a las ${hora} para ${reservation.party_size} persona(s). ¡Nos vemos pronto!`

  const phone = reservation.phone.replace(/[^0-9]/g, "")
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
