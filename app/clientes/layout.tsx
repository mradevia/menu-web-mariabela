import { RoleGate } from "@/components/admin/RoleGate"

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "cajero", "mesero"]} loginNext="/clientes">
      {children}
    </RoleGate>
  )
}
