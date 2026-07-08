// ============================================================================
//  Layout del panel /admin — edición del menú y configuración del negocio.
//  Solo admin/gerente (la escritura del menú además está protegida por RLS).
// ============================================================================
import { RoleGate } from "@/components/admin/RoleGate"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente"]} loginNext="/admin">
      {children}
    </RoleGate>
  )
}
