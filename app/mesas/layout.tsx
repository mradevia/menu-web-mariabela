import { RoleGate } from "@/components/admin/RoleGate"

export default function MesasLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "mesero"]} loginNext="/mesas">
      {children}
    </RoleGate>
  )
}
