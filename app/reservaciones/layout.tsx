import { RoleGate } from "@/components/admin/RoleGate"

export default function ReservacionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "cajero", "mesero"]} loginNext="/reservaciones">
      {children}
    </RoleGate>
  )
}
