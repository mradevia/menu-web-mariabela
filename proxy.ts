// ============================================================================
//  Proxy raíz de Next 16 (antes "middleware"). Refresca la sesión de Supabase
//  y protege rutas. La convención middleware.ts fue renombrada a proxy.ts.
// ============================================================================
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas EXCEPTO:
     * - _next/static, _next/image (assets del build)
     * - favicon y archivos de imagen/estáticos comunes
     * Así la sesión se refresca en toda la app sin costo en assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico)$).*)",
  ],
}
