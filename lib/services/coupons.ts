// ============================================================================
//  Servicio de CUPONES — creación, activación y validación de descuentos.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type CouponType = "percent" | "fixed" | "2x1"

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percent: "Porcentaje",
  fixed: "Monto fijo",
  "2x1": "2x1",
}

export interface CouponView {
  id: string
  code: string
  description: string | null
  type: CouponType
  value: number
  starts_at: string | null
  ends_at: string | null
  max_uses: number | null
  used_count: number
  is_active: boolean
}

export async function listCoupons(supabase: Client): Promise<CouponView[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, description, type, value, starts_at, ends_at, max_uses, used_count, is_active")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((c) => ({ ...c, value: Number(c.value) })) as CouponView[]
}

export interface CouponInput {
  code: string
  description?: string
  type: CouponType
  value: number
  startsAt?: string
  endsAt?: string
  maxUses?: number
}

export async function createCoupon(supabase: Client, input: CouponInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from("coupons").insert({
    code: input.code.toUpperCase(),
    description: input.description ?? null,
    type: input.type,
    value: input.value,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    max_uses: input.maxUses ?? null,
    created_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function toggleCoupon(supabase: Client, id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id)
  if (error) throw error
}

export async function deleteCoupon(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) throw error
}

export interface CouponValidation {
  valid: boolean
  reason?: string
  coupon?: CouponView
  discount?: number
}

/**
 * Valida un cupón por código contra un subtotal y calcula el descuento.
 * Comprueba activo, vigencia y usos máximos.
 */
export async function validateCoupon(
  supabase: Client,
  code: string,
  subtotal: number,
): Promise<CouponValidation> {
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, description, type, value, starts_at, ends_at, max_uses, used_count, is_active")
    .eq("code", code.toUpperCase())
    .maybeSingle()

  if (error) throw error
  if (!data) return { valid: false, reason: "El cupón no existe." }

  const coupon = { ...data, value: Number(data.value) } as CouponView
  const now = new Date()

  if (!coupon.is_active) return { valid: false, reason: "El cupón está inactivo.", coupon }
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return { valid: false, reason: "El cupón aún no es válido.", coupon }
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return { valid: false, reason: "El cupón ya expiró.", coupon }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
    return { valid: false, reason: "El cupón alcanzó su límite de usos.", coupon }

  let discount = 0
  if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100
  else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal)
  // 2x1 se aplica a nivel de producto, aquí solo se marca como válido.

  return { valid: true, coupon, discount }
}
