// ============================================================================
//  Servicio de AUTENTICACIÓN y ROLES.
//  Funciones puras que reciben un cliente de Supabase (browser o server).
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

export type RoleKey =
  | "admin"
  | "gerente"
  | "cajero"
  | "chef"
  | "mesero"
  | "contador"
  | "solo_lectura"

export interface CurrentUser {
  id: string
  email: string | null
  fullName: string | null
  roles: RoleKey[]
}

/**
 * Devuelve el usuario autenticado junto con sus roles, o null si no hay sesión.
 * Los roles se leen de user_roles ⋈ roles.
 */
export async function getCurrentUserWithRoles(
  supabase: Client,
): Promise<CurrentUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roleRows, error } = await supabase
    .from("user_roles")
    .select("roles(key)")
    .eq("user_id", user.id)

  if (error) {
    console.error("Error al leer roles del usuario:", error)
  }

  const roles = (roleRows ?? [])
    .map((r) => (r.roles as { key: string } | null)?.key)
    .filter((k): k is RoleKey => Boolean(k)) as RoleKey[]

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    roles,
  }
}

/** ¿El usuario tiene alguno de los roles indicados? */
export function hasAnyRole(user: CurrentUser | null, allowed: RoleKey[]): boolean {
  if (!user) return false
  return user.roles.some((r) => allowed.includes(r))
}

/** Inicia sesión con email y contraseña. */
export async function signIn(supabase: Client, email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

/** Cierra la sesión. */
export async function signOut(supabase: Client) {
  return supabase.auth.signOut()
}
