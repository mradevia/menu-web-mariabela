import { RoleGate } from "@/components/admin/RoleGate"

export default function CajaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "cajero"]} loginNext="/caja">
      {children}
    </RoleGate>
  )
}
