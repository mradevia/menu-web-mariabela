"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setLoading(false)
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.")
      return
    }

    // Refrescamos para que el servidor reciba la nueva cookie de sesión.
    router.replace(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Fondo con imagen y overlay sutil */}
      <div 
        className="absolute inset-0 z-0 bg-[#0D261C]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[#0D261C]/85 backdrop-blur-sm"></div>
      </div>

      {/* Tarjeta Glassmorphism Ultra Profesional */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#05140e]/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 blur-md"></div>
              <Lock size={24} className="text-[#D4AF37] relative z-10" strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-3xl font-normal text-white tracking-wide">
              Panel de Control
            </h1>
            <p className="text-stone-400 text-sm mt-3 font-light">
              Maria Bela • Acceso Restringido
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="administrador@mariabela.com"
                autoFocus
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-[#D4AF37]/50 transition-all duration-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2 ml-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-[#D4AF37]/50 transition-all duration-300 text-sm tracking-widest ${
                  error ? "border-red-500/50 bg-red-500/5" : ""
                }`}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl bg-[#D4AF37] text-[#0D261C] font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-[#e5c07b] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Autenticando
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-[#D4AF37] text-xs tracking-wide transition-colors group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Volver al menú
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
