import { RoleGate } from "@/components/admin/RoleGate"

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente"]} loginNext="/inventario">
      {children}
    </RoleGate>
  )
}
