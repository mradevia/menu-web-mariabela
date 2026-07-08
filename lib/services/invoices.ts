// ============================================================================
//  Servicio de FACTURACIÓN ADMINISTRATIVA.
//  ⚠️ NO hace timbrado SAT / PAC. Solo gestiona los datos fiscales y el estado
//  de cada solicitud de factura. La integración con un PAC queda para el futuro
//  (las columnas pdf_url / xml_url ya existen para guardar el resultado).
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type InvoiceStatus = "pending_data" | "ready" | "invoiced" | "sent" | "cancelled"

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending_data: "Pendiente de datos",
  ready: "Lista para facturar",
  invoiced: "Facturada",
  sent: "Enviada",
  cancelled: "Cancelada",
}

// Usos CFDI y regímenes fiscales más comunes (catálogo SAT resumido).
export const USO_CFDI = [
  { code: "G01", label: "G01 - Adquisición de mercancías" },
  { code: "G03", label: "G03 - Gastos en general" },
  { code: "P01", label: "P01 - Por definir" },
  { code: "D01", label: "D01 - Honorarios médicos" },
  { code: "CP01", label: "CP01 - Pagos" },
]

export const REGIMEN_FISCAL = [
  { code: "601", label: "601 - General de Ley Personas Morales" },
  { code: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
  { code: "616", label: "616 - Sin obligaciones fiscales" },
  { code: "621", label: "621 - Incorporación Fiscal" },
  { code: "626", label: "626 - Régimen Simplificado de Confianza (RESICO)" },
]

export interface InvoiceView {
  id: string
  order_id: string | null
  folio: string | null
  rfc: string | null
  razon_social: string | null
  uso_cfdi: string | null
  regimen_fiscal: string | null
  cp_fiscal: string | null
  email: string | null
  amount: number
  status: InvoiceStatus
  created_at: string
  order: { order_number: number } | null
}

const SELECT = `
  id, order_id, folio, rfc, razon_social, uso_cfdi, regimen_fiscal, cp_fiscal,
  email, amount, status, created_at,
  order:orders ( order_number )
`

function mapRow(row: any): InvoiceView {
  return {
    id: row.id,
    order_id: row.order_id,
    folio: row.folio,
    rfc: row.rfc,
    razon_social: row.razon_social,
    uso_cfdi: row.uso_cfdi,
    regimen_fiscal: row.regimen_fiscal,
    cp_fiscal: row.cp_fiscal,
    email: row.email,
    amount: Number(row.amount),
    status: row.status,
    created_at: row.created_at,
    order: row.order ?? null,
  }
}

export async function listInvoices(
  supabase: Client,
  statuses?: InvoiceStatus[],
): Promise<InvoiceView[]> {
  let query = supabase.from("invoices").select(SELECT).order("created_at", { ascending: false })
  if (statuses?.length) query = query.in("status", statuses)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export interface InvoiceInput {
  rfc: string
  razonSocial: string
  usoCfdi: string
  regimenFiscal: string
  cpFiscal: string
  email: string
  amount: number
  orderId?: string
}

export async function createInvoice(supabase: Client, input: InvoiceInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si ya tiene todos los datos fiscales, la marcamos lista para facturar.
  const hasAllData = input.rfc && input.razonSocial && input.usoCfdi && input.regimenFiscal && input.cpFiscal
  const status: InvoiceStatus = hasAllData ? "ready" : "pending_data"

  const { error } = await supabase.from("invoices").insert({
    rfc: input.rfc || null,
    razon_social: input.razonSocial || null,
    uso_cfdi: input.usoCfdi || null,
    regimen_fiscal: input.regimenFiscal || null,
    cp_fiscal: input.cpFiscal || null,
    email: input.email || null,
    amount: input.amount,
    order_id: input.orderId ?? null,
    status,
    created_by: user?.id ?? null,
  })
  if (error) throw error
}

// ---------------------------------------------------------------------------
//  SOLICITUDES DE FACTURA (invoice_requests)
//  El cliente las envía desde el formulario público; el staff las revisa.
// ---------------------------------------------------------------------------
export interface PublicInvoiceInput {
  rfc: string
  razonSocial: string
  usoCfdi: string
  regimenFiscal: string
  cpFiscal: string
  email: string
  orderNumber?: string // número de pedido/ticket que quiere facturar
}

/** Crea una solicitud de factura desde el FORMULARIO PÚBLICO (cliente sin login). */
export async function createPublicInvoiceRequest(
  supabase: Client,
  input: PublicInvoiceInput,
): Promise<void> {
  const { error } = await supabase.from("invoice_requests").insert({
    rfc: input.rfc || null,
    email: input.email || null,
    status: "pending",
    customer: {
      rfc: input.rfc,
      razon_social: input.razonSocial,
      uso_cfdi: input.usoCfdi,
      regimen_fiscal: input.regimenFiscal,
      cp_fiscal: input.cpFiscal,
      email: input.email,
      order_number: input.orderNumber ?? null,
    },
  })
  if (error) throw error
}

export interface InvoiceRequestView {
  id: string
  rfc: string | null
  email: string | null
  status: string
  customer: Record<string, any>
  created_at: string
}

/** Lista las solicitudes de factura pendientes que envió el público. */
export async function listInvoiceRequests(supabase: Client): Promise<InvoiceRequestView[]> {
  const { data, error } = await supabase
    .from("invoice_requests")
    .select("id, rfc, email, status, customer, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as InvoiceRequestView[]
}

/** Convierte una solicitud pública en una factura administrativa y la marca procesada. */
export async function processInvoiceRequest(
  supabase: Client,
  request: InvoiceRequestView,
): Promise<void> {
  const c = request.customer ?? {}
  await createInvoice(supabase, {
    rfc: c.rfc ?? request.rfc ?? "",
    razonSocial: c.razon_social ?? "",
    usoCfdi: c.uso_cfdi ?? "",
    regimenFiscal: c.regimen_fiscal ?? "",
    cpFiscal: c.cp_fiscal ?? "",
    email: c.email ?? request.email ?? "",
    amount: 0,
  })
  const { error } = await supabase
    .from("invoice_requests")
    .update({ status: "processed" })
    .eq("id", request.id)
  if (error) throw error
}

export async function updateInvoiceStatus(
  supabase: Client,
  id: string,
  status: InvoiceStatus,
): Promise<void> {
  const patch: Database["public"]["Tables"]["invoices"]["Update"] = { status }
  if (status === "invoiced") patch.issued_at = new Date().toISOString()
  const { error } = await supabase.from("invoices").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteInvoice(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("invoices").delete().eq("id", id)
  if (error) throw error
}
