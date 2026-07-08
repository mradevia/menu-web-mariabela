// ============================================================================
//  Servicio de INVENTARIO — insumos, proveedores y movimientos de stock.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

// ---------------------------------------------------------------------------
//  INSUMOS
// ---------------------------------------------------------------------------
export interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
  min_stock: number
  cost: number
  supplier_id: string | null
  supplier?: { name: string } | null
}

export async function listInventory(supabase: Client): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, unit, current_stock, min_stock, cost, supplier_id, supplier:suppliers(name)")
    .eq("status", "active")
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? []).map((i: any) => ({
    ...i,
    current_stock: Number(i.current_stock),
    min_stock: Number(i.min_stock),
    cost: Number(i.cost),
    supplier: i.supplier ?? null,
  }))
}

export async function createInventoryItem(
  supabase: Client,
  input: { name: string; unit: string; currentStock: number; minStock: number; cost: number; supplierId?: string },
): Promise<void> {
  const { error } = await supabase.from("inventory_items").insert({
    name: input.name,
    unit: input.unit,
    current_stock: input.currentStock,
    min_stock: input.minStock,
    cost: input.cost,
    supplier_id: input.supplierId ?? null,
  })
  if (error) throw error
}

export async function updateInventoryItem(
  supabase: Client,
  id: string,
  input: { name: string; unit: string; minStock: number; cost: number; supplierId?: string },
): Promise<void> {
  const { error } = await supabase
    .from("inventory_items")
    .update({
      name: input.name,
      unit: input.unit,
      min_stock: input.minStock,
      cost: input.cost,
      supplier_id: input.supplierId ?? null,
    })
    .eq("id", id)
  if (error) throw error
}

export async function archiveInventoryItem(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("inventory_items").update({ status: "archived" }).eq("id", id)
  if (error) throw error
}

/**
 * Registra un movimiento de inventario (entrada/salida/ajuste) y actualiza el
 * stock actual del insumo de forma consistente.
 */
export async function registerMovement(
  supabase: Client,
  item: InventoryItem,
  type: "in" | "out" | "adjustment",
  quantity: number,
  reason?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error: movError } = await supabase.from("inventory_movements").insert({
    item_id: item.id,
    type,
    quantity,
    reason: reason ?? null,
    created_by: user?.id ?? null,
  })
  if (movError) throw movError

  // Nuevo stock según el tipo de movimiento.
  let newStock = item.current_stock
  if (type === "in") newStock += quantity
  else if (type === "out") newStock = Math.max(0, newStock - quantity)
  else newStock = quantity // ajuste = fija el valor

  const { error: updError } = await supabase
    .from("inventory_items")
    .update({ current_stock: newStock })
    .eq("id", item.id)
  if (updError) throw updError
}

// ---------------------------------------------------------------------------
//  PROVEEDORES
// ---------------------------------------------------------------------------
export interface SupplierView {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  product: string | null
  last_price: number | null
  notes: string | null
}

export async function listSuppliers(supabase: Client): Promise<SupplierView[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_name, phone, email, product, last_price, notes")
    .eq("status", "active")
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? []).map((s) => ({ ...s, last_price: s.last_price != null ? Number(s.last_price) : null }))
}

export async function createSupplier(
  supabase: Client,
  input: { name: string; contactName?: string; phone?: string; email?: string; product?: string; lastPrice?: number; notes?: string },
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from("suppliers").insert({
    name: input.name,
    contact_name: input.contactName ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    product: input.product ?? null,
    last_price: input.lastPrice ?? null,
    notes: input.notes ?? null,
    created_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function archiveSupplier(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("suppliers").update({ status: "archived" }).eq("id", id)
  if (error) throw error
}
