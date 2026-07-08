// ============================================================================
//  Helper de sesión para el middleware de Next.
//  Refresca la cookie de sesión de Supabase en cada request y, para las rutas
//  protegidas, redirige a /login si no hay usuario. El chequeo FINO de rol se
//  hace en app/admin/layout.tsx (Server Component); aquí solo verificamos que
//  exista sesión, que es lo barato y suficiente a nivel de middleware.
// ============================================================================
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Prefijos de ruta que requieren haber iniciado sesión.
const PROTECTED_PREFIXES = [
  "/admin",
  "/cocina",
  "/pedidos",
  "/mesas",
  "/reservaciones",
  "/caja",
  "/gastos",
  "/reportes",
  "/clientes",
  "/facturacion",
  "/inventario",
  "/cupones",
  "/ticket",
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANTE: no ejecutar código entre createServerClient y getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/"),
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", path)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
