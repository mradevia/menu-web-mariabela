import { RoleGate } from "@/components/admin/RoleGate"

export default function GastosLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "contador"]} loginNext="/gastos">
      {children}
    </RoleGate>
  )
}
