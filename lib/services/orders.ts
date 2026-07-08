// ============================================================================
//  Servicio de PEDIDOS — creación, listado, cambio de estado y datos para
//  cocina y dashboard. Todo contra tablas reales (orders/order_items).
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"

export type OrderType = "dine_in" | "takeaway" | "pickup" | "delivery"

export interface OrderItemView {
  id: string
  product_name: string
  unit_price: number
  quantity: number
  line_total: number
  notes: string | null
  status: string
}

export interface OrderView {
  id: string
  order_number: number
  type: string
  status: OrderStatus
  payment_status: string
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string | null
  internal_notes: string | null
  created_at: string
  table: { number: number; name: string | null } | null
  customer: { full_name: string } | null
  items: OrderItemView[]
}

const ORDER_SELECT = `
  id, order_number, type, status, payment_status, subtotal, discount, tax, total,
  notes, internal_notes, created_at,
  table:tables ( number, name ),
  customer:customers ( full_name ),
  items:order_items ( id, product_name, unit_price, quantity, line_total, notes, status )
`

function mapOrderRow(row: any): OrderView {
  return {
    id: row.id,
    order_number: row.order_number,
    type: row.type,
    status: row.status,
    payment_status: row.payment_status,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total),
    notes: row.notes,
    internal_notes: row.internal_notes,
    created_at: row.created_at,
    table: row.table ?? null,
    customer: row.customer ?? null,
    items: (row.items ?? []).map((i: any) => ({
      id: i.id,
      product_name: i.product_name,
      unit_price: Number(i.unit_price),
      quantity: i.quantity,
      line_total: Number(i.line_total),
      notes: i.notes,
      status: i.status,
    })),
  }
}

/** Lista pedidos, opcionalmente filtrados por estado y rango de fechas. */
export async function listOrders(
  supabase: Client,
  opts?: { statuses?: OrderStatus[]; dateFrom?: string; dateTo?: string; limit?: number },
): Promise<OrderView[]> {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 100)

  if (opts?.statuses?.length) query = query.in("status", opts.statuses)
  if (opts?.dateFrom) query = query.gte("created_at", opts.dateFrom)
  if (opts?.dateTo) query = query.lte("created_at", opts.dateTo)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapOrderRow)
}

/** Obtiene un pedido individual por su id (para el ticket/comprobante). */
export async function getOrderById(supabase: Client, id: string): Promise<OrderView | null> {
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle()
  if (error) throw error
  return data ? mapOrderRow(data) : null
}

/** Pedidos activos para la vista de cocina (pendiente → listo), más los recién entregados. */
export async function getKitchenQueue(supabase: Client): Promise<OrderView[]> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const [{ data: active, error: activeError }, { data: served, error: servedError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .in("status", ["pending", "confirmed", "preparing", "ready"])
        .order("created_at", { ascending: true }),
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("status", "served")
        .gte("created_at", twoHoursAgo)
        .order("created_at", { ascending: false })
        .limit(20),
    ])

  if (activeError) throw activeError
  if (servedError) throw servedError

  return [...(active ?? []).map(mapOrderRow), ...(served ?? []).map(mapOrderRow)]
}

/** Cambia el estado de un pedido. El historial se registra solo (trigger de DB). */
export async function updateOrderStatus(
  supabase: Client,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
  if (error) throw error
}

/** Elimina permanentemente un pedido y sus renglones. */
export async function deleteOrder(
  supabase: Client,
  orderId: string,
): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", orderId)
  if (error) throw error
}

export interface NewOrderItemInput {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  notes?: string
}

export interface NewOrderInput {
  type: OrderType
  notes?: string
  items: NewOrderItemInput[]
  discount?: number
  couponId?: string // si se aplicó un cupón, para incrementar su contador de usos
}

/** Crea un pedido manual con sus renglones. Devuelve el id del pedido creado. */
export async function createOrder(supabase: Client, input: NewOrderInput): Promise<string> {
  if (input.items.length === 0) throw new Error("El pedido necesita al menos un producto.")

  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = Math.min(input.discount ?? 0, subtotal)
  const total = subtotal - discount

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      type: input.type,
      notes: input.notes ?? null,
      subtotal,
      discount,
      total,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single()

  if (orderError) throw orderError

  const itemRows = input.items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.productName,
    unit_price: i.unitPrice,
    quantity: i.quantity,
    line_total: i.unitPrice * i.quantity,
    notes: i.notes ?? null,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows)
  if (itemsError) throw itemsError

  // Si se aplicó un cupón, incrementamos su contador de usos (best-effort).
  if (input.couponId) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", input.couponId)
      .maybeSingle()
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 })
        .eq("id", input.couponId)
    }
  }

  return order.id
}

// ---------------------------------------------------------------------------
//  PEDIDO PÚBLICO — lo crea el cliente desde el menú (sin login).
//  El carrito público trabaja con `legacy_id` (el Dish.id numérico); aquí lo
//  resolvemos al UUID real de products para poder guardar el pedido.
// ---------------------------------------------------------------------------
export interface PublicOrderItemInput {
  legacyId: number
  quantity: number
}

export interface PublicOrderInput {
  items: PublicOrderItemInput[]
  mesaToken?: string | null // qr_token de la mesa, si vino de un QR
  deliveryAddress?: string
  location?: { lat: number; lng: number } | null
  notes?: string
}

/**
 * Crea un pedido desde el menú público (cliente sin sesión). Devuelve el
 * número de pedido creado (para mostrarlo en la pantalla de confirmación).
 * Nunca lanza si el guardado en Supabase falla por red — el llamador decide
 * el fallback (ej. seguir con WhatsApp).
 */
export async function createPublicOrder(
  supabase: Client,
  input: PublicOrderInput,
): Promise<{ orderId: string; orderNumber: number }> {
  if (input.items.length === 0) throw new Error("El pedido necesita al menos un producto.")

  // Resolver legacy_id -> uuid real + nombre/precio actual del producto.
  const legacyIds = input.items.map((i) => i.legacyId)
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, legacy_id, name, price")
    .in("legacy_id", legacyIds)

  if (prodError) throw prodError
  const byLegacyId = new Map((products ?? []).map((p) => [p.legacy_id, p]))

  // Resolver la mesa por su qr_token (si vino de un QR), sin bloquear el pedido si falla.
  let tableId: string | null = null
  if (input.mesaToken) {
    const { data: table } = await supabase
      .from("tables")
      .select("id")
      .eq("qr_token", input.mesaToken)
      .maybeSingle()
    tableId = table?.id ?? null
  }

  const type: OrderType = tableId ? "dine_in" : input.deliveryAddress || input.location ? "delivery" : "takeaway"

  const notesParts: string[] = []
  if (input.notes) notesParts.push(input.notes)
  if (input.deliveryAddress) notesParts.push(`Dirección/Referencias: ${input.deliveryAddress}`)
  if (input.location) notesParts.push(`Ubicación GPS: https://www.google.com/maps?q=${input.location.lat},${input.location.lng}`)

  const lineItems = input.items.map((i) => {
    const p = byLegacyId.get(i.legacyId)
    return {
      productId: p?.id ?? null,
      productName: p?.name ?? `Producto #${i.legacyId}`,
      unitPrice: p ? Number(p.price) : 0,
      quantity: i.quantity,
    }
  })

  const subtotal = lineItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      type,
      table_id: tableId,
      status: "pending",
      payment_status: "unpaid",
      subtotal,
      total: subtotal,
      delivery_address: input.deliveryAddress || null,
      notes: notesParts.join(" · ") || null,
    })
    .select("id, order_number")
    .single()

  if (orderError) throw orderError

  const itemRows = lineItems.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.productName,
    unit_price: i.unitPrice,
    quantity: i.quantity,
    line_total: i.unitPrice * i.quantity,
    status: "pending" as const,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows)
  if (itemsError) throw itemsError

  return { orderId: order.id, orderNumber: order.order_number }
}

/** Productos activos para elegir al armar un pedido (id UUID real, no legacy_id). */
export interface OrderableProduct {
  id: string
  name: string
  price: number
  categoryTitle: string
}

export async function fetchOrderableProducts(supabase: Client): Promise<OrderableProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, is_active, categories(title, sort_order)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    categoryTitle: p.categories?.title ?? "",
  }))
}

// ---------------------------------------------------------------------------
//  Dashboard — KPIs básicos con datos reales
// ---------------------------------------------------------------------------
export interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  activeOrders: number
  averageTicket: number
  topProducts: { name: string; quantity: number }[]
}

export async function getDashboardStats(supabase: Client): Promise<DashboardStats> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startIso = startOfDay.toISOString()

  const [{ data: todayOrders, error: todayError }, { count: activeCount, error: activeError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("total, status")
        .gte("created_at", startIso)
        .neq("status", "cancelled"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "confirmed", "preparing", "ready"]),
    ])

  if (todayError) throw todayError
  if (activeError) throw activeError

  const revenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const count = (todayOrders ?? []).length

  const { data: topItems, error: topError } = await supabase
    .from("order_items")
    .select("product_name, quantity")
    .gte("created_at", startIso)

  if (topError) throw topError

  const byProduct = new Map<string, number>()
  for (const item of topItems ?? []) {
    byProduct.set(item.product_name, (byProduct.get(item.product_name) ?? 0) + item.quantity)
  }
  const topProducts = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  return {
    todayOrders: count,
    todayRevenue: revenue,
    activeOrders: activeCount ?? 0,
    averageTicket: count > 0 ? revenue / count : 0,
    topProducts,
  }
}
