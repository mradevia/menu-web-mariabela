import { RoleGate } from "@/components/admin/RoleGate"

export default function CuponesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente"]} loginNext="/cupones">
      {children}
    </RoleGate>
  )
}
