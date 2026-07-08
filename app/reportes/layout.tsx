import { RoleGate } from "@/components/admin/RoleGate"

export default function ReportesLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin", "gerente", "contador"]} loginNext="/reportes">
      {children}
    </RoleGate>
  )
}
