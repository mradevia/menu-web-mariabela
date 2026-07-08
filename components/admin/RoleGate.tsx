// ============================================================================
//  RoleGate — Server Component reutilizable para proteger rutas por rol.
//  Verifica sesión + que el usuario tenga alguno de los roles permitidos.
//  La seguridad real de los datos la impone RLS en Supabase; esto es defensa
//  en profundidad + una UX clara ("no tienes acceso") en vez de errores crudos.
// ============================================================================
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserWithRoles, hasAnyRole, type RoleKey } from "@/lib/services/auth"

export async function RoleGate({
  allowed,
  loginNext,
  children,
}: {
  allowed: RoleKey[]
  loginNext: string
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const user = await getCurrentUserWithRoles(supabase)

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`)
  }

  if (!hasAnyRole(user, allowed)) {
    return (
      <div className="min-h-screen bg-[#0D261C] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-[#0D261C] mb-2">
            Acceso restringido
          </h1>
          <p className="text-stone-500 text-sm mb-6">
            Tu cuenta ({user.email}) no tiene permiso para entrar aquí.
            Contacta al administrador si crees que es un error.
          </p>
          <a
            href="/"
            className="inline-block py-3 px-6 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#991B1B] transition-colors"
          >
            Volver al menú
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
