import { RoleGate } from "@/components/admin/RoleGate"

export default function FacturacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "contador"]} loginNext="/facturacion">
      {children}
    </RoleGate>
  )
}
