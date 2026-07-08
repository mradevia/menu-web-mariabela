import { RoleGate } from "@/components/admin/RoleGate"

export default function TicketLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "cajero", "mesero"]} loginNext="/pedidos">
      {children}
    </RoleGate>
  )
}
