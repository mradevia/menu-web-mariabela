"use client"

import { useState, useEffect, useCallback } from "react"
import { QrCode, Download, RotateCcw, Check, ExternalLink } from "lucide-react"
import { generateQrDataUrl, downloadQr } from "@/lib/qr"
import type { SiteSettings } from "@/lib/site-data"

interface Props {
  settings: SiteSettings
  saveSettings: (s: SiteSettings) => void
}

// Sección "Código QR del menú" dentro de Mi negocio.
// Genera el QR en el propio navegador (sin depender de internet ni servicios externos),
// permite descargarlo para imprimir, y permite cambiar a qué enlace apunta.
export default function QrSection({ settings, saveSettings }: Props) {
  // settings.menuUrl puede no existir todavía si el navegador guardó datos
  // antes de que este campo se agregara. Nunca asumimos que está definido.
  const menuUrl = settings.menuUrl ?? ""

  const [effectiveUrl, setEffectiveUrl] = useState("")
  const [urlInput, setUrlInput] = useState(menuUrl)
  const [qrImage, setQrImage] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)

  // La URL real a usar: la que configuró la jefa, o si está vacía, la del sitio actual.
  useEffect(() => {
    const current = menuUrl.trim() || (typeof window !== "undefined" ? window.location.origin : "")
    setEffectiveUrl(current)
  }, [menuUrl])

  useEffect(() => setUrlInput(menuUrl), [menuUrl])

  const regenerate = useCallback(async (url: string) => {
    if (!url) return
    setGenerating(true)
    try {
      const dataUrl = await generateQrDataUrl(url, 600)
      setQrImage(dataUrl)
    } catch (e) {
      console.error("Error al generar el QR:", e)
    } finally {
      setGenerating(false)
    }
  }, [])

  useEffect(() => {
    regenerate(effectiveUrl)
  }, [effectiveUrl, regenerate])

  const handleSaveUrl = () => {
    saveSettings({ ...settings, menuUrl: urlInput.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetToAutomatic = () => {
    setUrlInput("")
    saveSettings({ ...settings, menuUrl: "" })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDownload = () => {
    if (!qrImage) return
    downloadQr(qrImage, "menu-mariabela-qr.png")
  }

  const isAutomatic = !menuUrl.trim()

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-4">
      <div className="flex items-center gap-2 text-[#0D261C]">
        <QrCode size={18} className="text-[#D4AF37]" />
        <h3 className="font-bold">Código QR del menú</h3>
      </div>
      <p className="text-xs text-stone-500 -mt-2">
        Este es el código que puedes imprimir en las mesas, tarjetas o carteles para que los
        clientes accedan al menú digital escaneándolo con su celular.
      </p>

      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        {/* Vista previa del QR */}
        <div className="shrink-0 bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-center w-44 h-44">
          {generating ? (
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#0D261C] rounded-full animate-spin" />
          ) : qrImage ? (
            <img src={qrImage} alt="Código QR del menú" className="w-full h-full object-contain" />
          ) : (
            <QrCode size={48} className="text-stone-300" />
          )}
        </div>

        <div className="flex-1 w-full space-y-3">
          {/* A dónde apunta ahora mismo */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
              El código lleva a:
            </p>
            <div className="flex items-center gap-1.5 text-sm text-[#0D261C] font-medium break-all bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              <ExternalLink size={14} className="shrink-0 text-[#D4AF37]" />
              <span className="truncate">{effectiveUrl || "..."}</span>
            </div>
            {isAutomatic && (
              <p className="text-[11px] text-stone-400 mt-1">
                Usando automáticamente la dirección de esta página. Cuando tengas tu dominio final,
                pégalo abajo.
              </p>
            )}
          </div>

          {/* Botones principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={!qrImage}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#991B1B] transition-colors disabled:opacity-40"
            >
              <Download size={16} /> Descargar QR
            </button>
            <button
              onClick={handleResetToAutomatic}
              disabled={isAutomatic}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-300 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors disabled:opacity-40"
            >
              <RotateCcw size={16} /> Usar el link automático
            </button>
          </div>
        </div>
      </div>

      {/* Cambiar manualmente a qué enlace apunta */}
      <div className="pt-3 border-t border-stone-100">
        <label className="block text-sm font-bold text-[#0D261C] mb-1.5">
          Cambiar el enlace del código QR
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://tu-dominio.com"
            className="flex-1 p-3 rounded-xl border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-base"
          />
          <button
            onClick={handleSaveUrl}
            className={`shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors ${
              saved ? "bg-green-600 text-white" : "bg-[#0D261C] text-white hover:bg-[#991B1B]"
            }`}
          >
            {saved ? <Check size={16} /> : null} {saved ? "Guardado" : "Actualizar QR"}
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-1.5">
          Déjalo vacío y presiona "Usar el link automático" para que el QR siempre apunte a esta
          misma página, sin tener que actualizarlo manualmente.
        </p>
      </div>
    </section>
  )
}
