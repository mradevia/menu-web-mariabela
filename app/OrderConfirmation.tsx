"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, ChefHat, MessageCircle, X, PartyPopper } from "lucide-react"

export type ConfirmationStage = "saving" | "success" | "error"

interface Props {
  stage: ConfirmationStage
  orderNumber: number | null
  errorMessage: string | null
  whatsappUrl: string | null
  onClose: () => void
  onRetryWhatsapp: () => void
}

/**
 * Pantalla de confirmación de pedido, estilo apps de delivery: primero un
 * loader ("Confirmando tu pedido..."), luego éxito con el número de pedido
 * y, si algo falla al guardar, opción de completar por WhatsApp como respaldo.
 */
export default function OrderConfirmation({
  stage,
  orderNumber,
  errorMessage,
  whatsappUrl,
  onClose,
  onRetryWhatsapp,
}: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#0D261C]/95 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center relative"
        >
          {stage !== "saving" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {stage === "saving" && (
            <>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat size={36} className="text-[#0D261C]" />
                </div>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0D261C] mb-2">Confirmando tu pedido</h2>
              <p className="text-stone-500 text-sm">Danos un momento, ya casi está listo...</p>
            </>
          )}

          {stage === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center relative"
              >
                <motion.div
                  initial={{ scale: 1.6, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1, repeat: 2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-200"
                />
                <Check size={44} strokeWidth={3} className="text-emerald-500 relative z-10" />
              </motion.div>

              <h2 className="font-serif text-2xl font-bold text-[#0D261C] mb-1 flex items-center justify-center gap-2">
                ¡Pedido confirmado! <PartyPopper size={20} className="text-[#D4AF37]" />
              </h2>
              {orderNumber != null && (
                <p className="text-[#D4AF37] font-bold text-sm mb-2">Pedido #{orderNumber}</p>
              )}
              <p className="text-stone-500 text-sm mb-6">
                Tu pedido ya está en cocina. En un momento comenzarán a prepararlo con mucho cariño.
              </p>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl border-2 border-emerald-500/30 text-emerald-700 bg-emerald-50 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <MessageCircle size={17} /> Enviar comprobante por WhatsApp
                </a>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors"
              >
                Volver al menú
              </button>
            </>
          )}

          {stage === "error" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
                <MessageCircle size={32} className="text-amber-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0D261C] mb-2">Casi listo...</h2>
              <p className="text-stone-500 text-sm mb-6">
                {errorMessage ?? "No pudimos registrar tu pedido en este momento."} Puedes enviarlo por WhatsApp para que lo recibamos de inmediato.
              </p>
              <button
                onClick={onRetryWhatsapp}
                className="w-full py-3.5 rounded-xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={17} /> Enviar por WhatsApp
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
