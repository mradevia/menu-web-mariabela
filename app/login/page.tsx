import { Suspense } from "react"
import LoginForm from "./LoginForm"

export const metadata = {
  title: "Acceso — Panel Maria Bela",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D261C]" />}>
      <LoginForm />
    </Suspense>
  )
}
