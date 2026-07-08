"use client"

import { useState } from "react"
import { FileText, Check, Loader2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createPublicInvoiceRequest, USO_CFDI, REGIMEN_FISCAL } from "@/lib/services/invoices"

export default function FacturarForm() {
  const [rfc, setRfc] = useState("")
  const [razonSocial, setRazonSocial] = useState("")
  const [cpFiscal, setCpFiscal] = useState("")
  const [usoCfdi, setUsoCfdi] = useState(USO_CFDI[1].code)
  const [regimenFiscal, setRegimenFiscal] = useState(REGIMEN_FISCAL[4].code)
  const [email, setEmail] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!rfc.trim() || !razonSocial.trim() || !email.trim()) {
      setError("Por favor completa RFC, razón social y correo.")
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      await createPublicInvoiceRequest(supabase, {
        rfc: rfc.trim().toUpperCase(),
        razonSocial: razonSocial.trim(),
        usoCfdi,
        regimenFiscal,
        cpFiscal: cpFiscal.trim(),
        email: email.trim(),
        orderNumber: orderNumber.trim() || undefined,
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError("No se pudo enviar tu solicitud. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0D261C] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check size={30} className="text-emerald-500" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#0D261C] mb-2">¡Datos recibidos!</h1>
          <p className="text-stone-500 text-sm mb-6">
            Recibimos tus datos fiscales. Procesaremos tu factura y te la enviaremos al correo <strong>{email}</strong>.
          </p>
          <a href="/" className="inline-block py-3 px-6 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors">
            Volver al menú
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D261C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#0D261C] text-white px-6 py-6 text-center relative">
          <a href="/" className="absolute left-4 top-4 text-stone-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </a>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto mb-2">
            <FileText size={22} className="text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl font-bold">Solicita tu factura</h1>
          <p className="text-stone-400 text-xs mt-1">Déjanos tus datos fiscales</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0D261C] mb-1.5">RFC *</label>
            <input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} required placeholder="XAXX010101000" className={inputCls + " uppercase"} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D261C] mb-1.5">Razón social *</label>
            <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} required placeholder="Nombre o razón social" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0D261C] mb-1.5">CP fiscal</label>
              <input value={cpFiscal} onChange={(e) => setCpFiscal(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="55700" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0D261C] mb-1.5">Nº de ticket/pedido</label>
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Ej: 1024" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D261C] mb-1.5">Uso de CFDI</label>
            <select value={usoCfdi} onChange={(e) => setUsoCfdi(e.target.value)} className={inputCls + " text-sm"}>
              {USO_CFDI.map((u) => <option key={u.code} value={u.code}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D261C] mb-1.5">Régimen fiscal</label>
            <select value={regimenFiscal} onChange={(e) => setRegimenFiscal(e.target.value)} className={inputCls + " text-sm"}>
              {REGIMEN_FISCAL.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0D261C] mb-1.5">Correo *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" className={inputCls} />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? (<><Loader2 size={18} className="animate-spin" /> Enviando...</>) : "Enviar solicitud"}
          </button>
          <p className="text-[11px] text-stone-400 text-center">
            El restaurante procesará tu factura y te la enviará por correo.
          </p>
        </form>
      </div>
    </div>
  )
}

const inputCls = "w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
