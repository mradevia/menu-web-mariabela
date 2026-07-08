// ============================================================================
//  Cliente de Supabase con SERVICE ROLE (SALTA RLS).
//  ⚠️ SOLO SERVIDOR. El import 'server-only' hace que el build FALLE si alguien
//  intenta importarlo desde código de cliente. Úsalo únicamente en scripts,
//  Server Actions o Route Handlers de tareas administrativas (seed, crear
//  usuarios, etc.). Nunca lo expongas al navegador.
// ============================================================================
import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey || serviceRoleKey === "PENDIENTE_PEGAR_DESDE_DASHBOARD") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Pégala en .env.local desde el dashboard de Supabase (Project Settings → API → service_role).",
    )
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}
