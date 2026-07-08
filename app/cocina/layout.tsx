import { RoleGate } from "@/components/admin/RoleGate"

export default function CocinaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["chef", "gerente", "admin"]} loginNext="/cocina">
      {children}
    </RoleGate>
  )
}
