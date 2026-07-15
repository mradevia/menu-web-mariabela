"use client"

import React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Utensils, // Used in DishCard
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Leaf,
  ArrowRight,
  Heart,
  MessageCircle,
  X,
  Star,
  Award,
  Instagram,
  Facebook,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  FileText,
  QrCode,
  Share2,
  Copy,
  Check,
} from "lucide-react"
import confetti from "canvas-confetti"
import QRCode from "qrcode"
import { useSiteData } from "@/hooks/use-site-data"
import { renderCategoryIcon } from "@/lib/icons"
import type { SiteSettings } from "@/lib/site-data"
import MesaBanner from "./MesaBanner"
import OrderConfirmation, { type ConfirmationStage } from "./OrderConfirmation"
import { createClient } from "@/lib/supabase/client"
import { createPublicOrder } from "@/lib/services/orders"

const BRAND_LOGO_WHITE = "/brand/mariabela-logo-white-sm.png"
const BRAND_LOGO_WHITE_HERO = "/brand/mariabela-logo-white-shadow.png"
const BRAND_ALT = "Maria Bela México & Italia"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

// Componente de tarjeta de platillo
const CATEGORY_FALLBACK_IMAGES = {
  desayunos: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600",
  entradas: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
  ensaladas: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
  sopas: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600",
  paninis: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600",
  pastas: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=600",
  pizzas: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600",
  especialidades: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?q=80&w=600",
  cortes: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
  bebidas: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600",
  calientes: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600",
  postres: "https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=600",
  infantil: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600",
}

// Componente de tarjeta de platillo
//
// Nota de rendimiento: NO usamos framer-motion aquí. Con categorías de 25+
// platillos, animar cada tarjeta con `whileInView` creaba decenas de
// IntersectionObservers y recálculos de layout que "trababan" el scroll y
// bloqueaban la apertura de descripciones. En su lugar:
//   - La aparición al hacer scroll se hace con una animación CSS ligera
//     (`animate-dish-in`) que corre en el compositor del navegador.
//   - La descripción se expande con una transición de `grid-template-rows`
//     (0fr → 1fr): es puramente CSS, no reflуye ni mueve a las tarjetas
//     vecinas, así que abrir una descripción jamás afecta a las demás.
function DishCard({ item, index, onAdd, onSelect }: { item: any; index: number; onAdd: (item: any) => void; onSelect: (item: any) => void }) {
  const [imageError, setImageError] = useState(false)
  const [liked, setLiked] = useState(false)
  const category = item.category || "desayunos"
  const fallback = CATEGORY_FALLBACK_IMAGES[category as keyof typeof CATEGORY_FALLBACK_IMAGES] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600"
  const imageUrl = (item.image && !imageError) ? item.image : fallback

  // Descripciones cortas (una línea) no necesitan botón "Ver más".
  const isLong = (item.ingredients?.length ?? 0) > 70

  return (
    <article
      style={{ animationDelay: `${(index % 6) * 55}ms` }}
      onClick={() => onSelect(item)}
      className="animate-dish-in bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_-6px_rgba(13,38,28,0.15)] border border-stone-100/80 flex flex-col hover:shadow-[0_18px_40px_-14px_rgba(13,38,28,0.35)] hover:-translate-y-1.5 transition-[transform,box-shadow] duration-300 ease-out group will-change-transform cursor-pointer"
    >
      <div className="relative h-48 lg:h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
        />
        {/* Degradado inferior para dar profundidad y legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Precio flotante, estilo etiqueta premium */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-[#0D261C] font-serif font-bold text-sm px-3 py-1 rounded-full shadow-md border border-white/60">
          ${item.price}
        </div>

        {/* Botón de favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLiked((v) => !v)
          }}
          aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md text-stone-500 hover:text-red-500 active:scale-90 transition-all duration-200"
        >
          <Heart size={15} className={liked ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.tags?.map((tag: string) => (
            <span
              key={tag}
              className="bg-[#991B1B] text-white text-[8px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content below image */}
      <div className="p-4 flex flex-col flex-1 bg-[#FDFDFB]">
        <h3 className="text-base font-serif font-bold text-[#0D261C] leading-tight group-hover:text-[#991B1B] transition-colors line-clamp-2 mb-2">
          {item.name}
        </h3>

        {/* Divisor dorado sutil */}
        <div className="h-[2px] w-8 bg-[#D4AF37]/70 rounded-full mb-3" />

        {/* Descripción truncada */}
        <p className="text-stone-500 text-xs italic leading-relaxed overflow-hidden line-clamp-2 min-h-[2rem]">
          "{item.ingredients}"
        </p>

        {/* Indicador "Ver más" */}
        {isLong && (
          <span className="self-start mt-1.5 mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#991B1B] hover:text-[#0D261C] transition-colors">
            Ver más
            <ChevronDown size={13} />
          </span>
        )}

        <div className="mt-auto pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd(item)
            }}
            className="w-full bg-[#0D261C] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-[#991B1B] transition-colors active:scale-[0.97] transform duration-100 shadow-sm"
          >
            <ShoppingBag size={13} /> Agregar
          </button>
        </div>
      </div>
    </article>
  )
}

// Componente de encabezado de sección
function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-2 mb-12 mt-16 text-center px-4"
    >
      <div className="text-[#D4AF37] mb-3 p-4 bg-white rounded-full shadow-md border border-stone-100">{icon}</div>
      <h2 className="text-4xl md:text-5xl font-serif font-bold uppercase tracking-tight text-[#0D261C] leading-none text-balance">
        {title}
      </h2>
      <div className="flex items-center gap-4 mt-3">
        <div className="h-[2px] w-10 bg-[#991B1B]" />
        <p className="text-[#991B1B] font-bold uppercase text-[11px] tracking-[0.3em]">{subtitle}</p>
        <div className="h-[2px] w-10 bg-[#991B1B]" />
      </div>
    </motion.div>
  )
}

// Sidebar del Carrito
function CartSidebar({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeItem,
  clearCart,
  orderNotes,
  setOrderNotes,
  deliveryAddress,
  setDeliveryAddress,
  location,
  setLocation,
  settings,
}: {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  updateQuantity: (id: number, delta: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
  orderNotes: string
  setOrderNotes: (notes: string) => void
  deliveryAddress: string
  setDeliveryAddress: (address: string) => void
  location: { lat: number; lng: number } | null
  setLocation: (loc: { lat: number; lng: number } | null) => void
  settings: SiteSettings
}) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [isLocating, setIsLocating] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    stage: ConfirmationStage
    orderNumber: number | null
    errorMessage: string | null
    whatsappUrl: string | null
  } | null>(null)

  const handleGetLocation = () => {
    setIsLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location", error)
          setIsLocating(false)
          let errorMessage = "No se pudo obtener la ubicación."
          if (error.code === 1) errorMessage = "Permiso de ubicación denegado. Actívalo en la configuración de tu navegador."
          else if (error.code === 2) errorMessage = "Ubicación no disponible. Asegúrate de tener el GPS activado."
          else if (error.code === 3) errorMessage = "Se agotó el tiempo de espera para obtener la ubicación."
          alert(errorMessage)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    } else {
      setIsLocating(false)
      alert("Tu navegador no soporta geolocalización.")
    }
  }

  const buildWhatsappUrl = (orderNumber: number | null) => {
    const mesa = typeof window !== "undefined" ? sessionStorage.getItem("mariabela-mesa") : null
    const message =
      "Hola Maria Bela, " +
      (orderNumber ? `mi pedido #${orderNumber} es:\n\n` : "me gustaría ordenar:\n\n") +
      cart.map((item) => `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})`).join("\n") +
      `\n\n*Total: $${total}*` +
      (mesa ? `\n\n*Mesa: ${mesa}*` : "") +
      (location ? `\n\n*Ubicación GPS:* https://www.google.com/maps?q=${location.lat},${location.lng}` : "") +
      (deliveryAddress ? `\n*Dirección/Referencias:* ${deliveryAddress}` : "") +
      (orderNotes ? `\n\n*Notas:* ${orderNotes}` : "") +
      `\n\nGracias.`
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`
  }

  const handleCheckout = async () => {
    // Mesa (si el cliente llegó por el QR de una mesa).
    const mesaToken = typeof window !== "undefined" ? sessionStorage.getItem("mariabela-mesa-token") : null
    // Capturamos el WhatsApp de respaldo ANTES de vaciar el carrito.
    const fallbackWhatsappUrl = buildWhatsappUrl(null)

    setConfirmation({ stage: "saving", orderNumber: null, errorMessage: null, whatsappUrl: null })

    try {
      const supabase = createClient()
      const { orderNumber } = await createPublicOrder(supabase, {
        items: cart.map((item) => ({ legacyId: item.id, quantity: item.quantity })),
        mesaToken,
        deliveryAddress: deliveryAddress.trim() || undefined,
        location,
        notes: orderNotes.trim() || undefined,
      })

      const successWhatsappUrl = buildWhatsappUrl(orderNumber)

      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#0D261C', '#991B1B', '#ffffff', '#E5C07B'],
        zIndex: 9999,
      })

      setConfirmation({ stage: "success", orderNumber, errorMessage: null, whatsappUrl: successWhatsappUrl })
      clearCart()
    } catch (err) {
      console.error("Error al guardar el pedido:", err)
      setConfirmation({
        stage: "error",
        orderNumber: null,
        errorMessage: "No pudimos guardar tu pedido automáticamente.",
        whatsappUrl: fallbackWhatsappUrl,
      })
    }
  }

  const closeConfirmation = () => {
    setConfirmation(null)
    onClose()
  }

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0D261C]/40 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%", filter: "blur(10px)" }}
            animate={{ x: 0, filter: "blur(0px)" }}
            exit={{ x: "100%", filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-[#FDFDFB] z-[70] shadow-[0_0_40px_rgba(0,0,0,0.15)] flex flex-col"
          >
            {/* Encabezado elegante con textura sutil */}
            <div className="px-8 py-7 border-b border-stone-200/60 bg-white/80 backdrop-blur-md z-10 sticky top-0 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-1">Resumen de cuenta</p>
                <h2 className="font-serif text-3xl font-bold flex items-center gap-3 text-[#0D261C] leading-none">
                  Tu Pedido
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-stone-50 hover:bg-[#0D261C] text-stone-500 hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-[#FDFDFB]">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-stone-400 space-y-6 pb-20"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-2xl scale-150" />
                    <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100 relative z-10">
                      <ShoppingBag size={56} strokeWidth={1} className="text-[#0D261C]/30" />
                    </div>
                  </div>
                  <div className="text-center space-y-3 relative z-10">
                    <p className="font-serif text-2xl text-[#0D261C] font-bold">Sin apetito aún?</p>
                    <p className="text-sm text-stone-500 max-w-[260px] mx-auto leading-relaxed">Tu carrito está vacío. Descubre los sabores que hemos preparado para ti.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-6 px-10 py-3.5 bg-white text-[#0D261C] font-bold uppercase text-[10px] tracking-[0.2em] rounded-full border border-stone-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all shadow-sm relative z-10"
                  >
                    Ver Menú
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  {/* Lista de Items */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Platillo</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Subtotal</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {cart.map((item) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                          transition={{ duration: 0.25, type: "spring", bounce: 0.2 }}
                          key={item.id} 
                          className="flex gap-5 items-center group relative"
                        >
                          <div className="relative shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-[88px] h-[88px] object-cover rounded-2xl shadow-sm"
                              />
                            ) : (
                              <div className="w-[88px] h-[88px] bg-white rounded-2xl border border-stone-100 flex items-center justify-center text-stone-300 shadow-sm">
                                <Utensils size={28} strokeWidth={1.5} />
                              </div>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="absolute -top-2 -left-2 bg-white text-stone-400 hover:text-white hover:bg-red-500 w-6 h-6 flex items-center justify-center rounded-full shadow-md border border-stone-100 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-serif font-bold text-[#0D261C] leading-snug mb-1 text-[16px] pr-4">{item.name}</h4>
                              <p className="text-[#D4AF37] font-bold text-[15px]">${item.price}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center bg-white border border-stone-200 rounded-full p-1 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-[#0D261C] transition-colors"
                                >
                                  <Minus size={12} strokeWidth={2.5} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-[#0D261C]">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-[#0D261C] transition-colors"
                                >
                                  <Plus size={12} strokeWidth={2.5} />
                                </button>
                              </div>
                              <span className="font-bold text-[#0D261C] text-lg font-serif">${item.price * item.quantity}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Formularios de entrega */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100/80 space-y-7 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div key="address" className="relative z-10">
                      <label className="flex items-center justify-between mb-4">
                        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0D261C]">
                          <MapPin size={16} className="text-[#D4AF37]" /> Entrega
                        </span>
                      </label>
                      
                      {!location ? (
                        <button
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="w-full py-5 bg-[#FDFDFB] rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/40 hover:text-[#0D261C] transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                          <div className={`w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-stone-100 ${isLocating ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`}>
                            <MapPin size={18} className={isLocating ? "text-stone-300" : "text-[#D4AF37]"} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                            {isLocating ? "Buscando..." : "Usar mi ubicación"}
                          </span>
                        </button>
                      ) : (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-stone-200 shadow-sm mb-4 group">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                            className="opacity-90 group-hover:opacity-100 transition-opacity"
                          ></iframe>
                          <button
                            onClick={() => setLocation(null)}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-stone-500 hover:text-red-500 p-2 rounded-full shadow-md hover:scale-110 transition-all"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                      
                      <div className="relative mt-4">
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-2xl bg-[#FDFDFB] border border-stone-200 text-sm text-[#0D261C] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] resize-none h-20 transition-all shadow-inner"
                        />
                        <label className="absolute left-4 top-4 text-stone-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#D4AF37] peer-focus:uppercase peer-focus:tracking-widest pointer-events-none">
                          {location ? "Referencias adicionales..." : "Dirección completa..."}
                        </label>
                      </div>
                    </div>

                    <div key="notes" className="relative z-10 pt-2">
                      <div className="relative">
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder=" "
                          className="peer w-full px-4 pt-6 pb-2 rounded-2xl bg-[#FDFDFB] border border-stone-200 text-sm text-[#0D261C] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] resize-none h-24 transition-all shadow-inner"
                        />
                        <label className="absolute left-4 top-4 text-stone-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#D4AF37] peer-focus:uppercase peer-focus:tracking-widest pointer-events-none flex items-center gap-1.5">
                          <FileText size={12} /> Notas especiales (Opcional)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Fijo con el Checkout y Resumen */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-stone-200/80 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.08)] z-20">
                <div className="px-8 py-5 space-y-3 border-b border-stone-100">
                  <div className="flex justify-between items-center text-sm text-stone-500">
                    <span>Subtotal</span>
                    <span className="font-medium">${total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-stone-500">
                    <span>Envío</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">Por calcular</span>
                  </div>
                </div>
                
                <div className="px-8 py-6 bg-stone-50/50">
                  <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-stone-400 mb-1">Total a pagar</span>
                      <span className="text-3xl font-bold text-[#0D261C] font-serif leading-none">${total}</span>
                    </div>
                    <button
                      onClick={clearCart}
                      className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm hover:shadow"
                    >
                      <Trash2 size={12} /> Vaciar
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#0D261C] text-white py-4 px-6 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-[#123324] hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-between group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10">Confirmar Pedido</span>
                    <div className="bg-white/10 p-2 rounded-full relative z-10 group-hover:bg-[#D4AF37] transition-colors duration-300">
                      <ArrowRight size={16} className="text-white group-hover:text-[#0D261C]" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
      {confirmation && (
        <OrderConfirmation
          stage={confirmation.stage}
          orderNumber={confirmation.orderNumber}
          errorMessage={confirmation.errorMessage}
          whatsappUrl={confirmation.whatsappUrl}
          onClose={closeConfirmation}
          onRetryWhatsapp={() => {
            if (confirmation.whatsappUrl) window.open(confirmation.whatsappUrl, "_blank")
          }}
        />
      )}
    </>
  )
}

// Componente de Recomendación del Chef
function ChefSpecial({ items, onAdd, onSelect }: { items: any[]; onAdd: (item: any) => void; onSelect: (item: any) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (items.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [items])

  useEffect(() => {
    setImageError(false)
  }, [currentIndex])

  if (items.length === 0) return null

  const item = items[currentIndex]
  const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800"
  const imageUrl = (item.image && !imageError) ? item.image : fallbackImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="container mx-auto px-4 lg:px-6 py-8 mt-8"
    >
      <div className="relative bg-[#0D261C] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 group min-h-[420px] flex flex-col justify-center">
        <div className="absolute top-6 right-6 z-20">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-[#D4AF37] text-[#0D261C] font-bold px-4 py-2 rounded-full uppercase tracking-widest text-[9px] shadow-lg flex items-center gap-2"
          >
            <Award size={14} /> Recomendación del Chef
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-0 w-full"
          >
            <div
              onClick={() => onSelect(item)}
              className="h-64 md:h-auto overflow-hidden relative min-h-[300px] md:min-h-[400px] cursor-pointer"
            >
              <img
                src={imageUrl}
                alt={item.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D261C] via-[#0D261C]/20 to-transparent md:hidden" />
            </div>
            
            <div className="p-8 pb-16 md:p-12 lg:p-16 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Utensils size={120} className="text-white" />
              </div>

              <h3
                onClick={() => onSelect(item)}
                className="text-[#D4AF37] font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight cursor-pointer hover:underline"
              >
                {item.name}
              </h3>
              <p className="text-stone-300 text-sm md:text-base lg:text-lg mb-8 italic leading-relaxed font-light max-w-xl">
                "{item.ingredients}"
              </p>

              <div className="flex flex-wrap items-center gap-6 w-full">
                <div className="flex flex-col">
                  <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Precio</span>
                  <span className="text-3xl font-bold text-white">${item.price}</span>
                </div>
                <button
                  onClick={() => onAdd(item)}
                  className="flex-1 max-w-xs bg-white text-[#0D261C] py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95 transform duration-100"
                >
                  <ShoppingBag size={18} /> Ordenar
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-[#D4AF37] w-8" : "bg-white/20 w-2 hover:bg-white/40"
                }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600",
  "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1600",
  "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?q=80&w=1600",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
]

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
} as const

const heroItemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
    },
  },
} as const

export default function MenuClient({
  initialMenu,
  initialSettings,
}: {
  initialMenu?: import("@/lib/site-data").MenuData
  initialSettings?: SiteSettings
} = {}) {
  const { menu: MENU_DATABASE, settings, loaded } = useSiteData({
    menu: initialMenu,
    settings: initialSettings,
  })
  const [activeTab, setActiveTab] = useState("desayunos")
  const [searchTerm, setSearchTerm] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [featuredDishes, setFeaturedDishes] = useState<any[]>([])

  // Modal de Detalle de Platillo
  const [selectedDish, setSelectedDish] = useState<any | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  useEffect(() => {
    if (selectedDish) {
      setSelectedQuantity(1)
    }
  }, [selectedDish])

  // Estados para Código QR y Compartir
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [copied, setCopied] = useState(false)

  // Obtener URL actual
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin || "https://mariabelamenu.com")
    }
  }, [])

  // Generar Código QR con la librería local
  useEffect(() => {
    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0D261C", // Verde oscuro de la marca
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error al generar QR:", err))
    }
  }, [currentUrl])

  const navigateToCategory = (catKey: string) => {
    setActiveTab(catKey)
    setSearchTerm("")
    const menuElement = document.getElementById("menu")
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("mariabela-cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Error al cargar el carrito:", e)
      }
    }
    setIsCartLoaded(true)
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem("mariabela-cart", JSON.stringify(cart))
    }
  }, [cart, isCartLoaded])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [currentHeroIndex])

  const categories = Object.keys(MENU_DATABASE)

  // Si la categoría activa deja de existir (porque la jefa la eliminó en el
  // panel de administración), volvemos a la primera categoría disponible.
  useEffect(() => {
    if (loaded && categories.length > 0 && !MENU_DATABASE[activeTab]) {
      setActiveTab(categories[0])
    }
  }, [loaded, categories, activeTab, MENU_DATABASE])

  useEffect(() => {
    const allItems = Object.values(MENU_DATABASE).flatMap((category) => category.items)

    // Si la jefa eligió platillos a mano desde el panel, usamos esos, en su orden.
    const chosenIds = settings.featuredDishIds ?? []
    if (chosenIds.length > 0) {
      const byId = new Map(allItems.map((item) => [item.id, item]))
      const chosen = chosenIds.map((id) => byId.get(id)).filter(Boolean) as any[]
      if (chosen.length > 0) {
        setFeaturedDishes(chosen)
        return
      }
    }

    // Si no eligió ninguno, se muestran automáticamente algunos destacados al azar.
    const specialItems = allItems.filter((item) =>
      item.tags?.some((tag: string) => ["Chef", "Premium", "Estrella", "De la Casa"].includes(tag)),
    )
    const pool = specialItems.length > 0 ? specialItems : allItems

    if (pool.length > 0) {
      const shuffled = [...pool].sort(() => 0.5 - Math.random())
      setFeaturedDishes(shuffled.slice(0, 3))
    }
  }, [MENU_DATABASE, settings.featuredDishIds])

  const filteredItems = useMemo(() => {
    if (searchTerm) {
      return Object.entries(MENU_DATABASE).flatMap(([catKey, category]) =>
        category.items.map((item) => ({ ...item, category: catKey }))
      ).filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.ingredients.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else {
      const current = MENU_DATABASE[activeTab]
      if (!current) return []
      return current.items.map((item) => ({
        ...item,
        category: activeTab,
      }))
    }
  }, [activeTab, searchTerm, MENU_DATABASE])

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }]
    })
    setIsCartOpen(true)
  }

  const addToCartWithQuantity = (item: any, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: qty, image: item.image }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#1B4332] font-sans">
      {/* Banner de mesa (aparece solo si el cliente escaneó el QR de una mesa) */}
      <MesaBanner />
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-[#0D261C]/95 backdrop-blur-md py-2.5 shadow-2xl" 
            : "bg-transparent py-3 md:py-6"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center">
          <a
            href="#"
            aria-label="Ir al inicio de Maria Bela"
            className={`inline-flex shrink-0 items-center transition-all duration-500 ${
              scrolled
                ? "drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
                : "drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)]"
            }`}
          >
            <img
              src={BRAND_LOGO_WHITE}
              alt={BRAND_ALT}
              className="h-9 md:h-16 w-auto object-contain transition-all duration-500"
            />
          </a>

          <div className="flex items-center gap-4">
            <div className={`hidden lg:flex flex-col items-end ${scrolled ? "text-stone-300" : "text-white/90"}`}>
              <span className="text-[10px] font-bold uppercase">Abierto</span>
              <span className="text-[9px] font-medium">{settings.scheduleShort}</span>
            </div>
            <a
              onClick={() => setIsCartOpen(true)}
              className={`hidden sm:inline-block px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] transition-all transform hover:scale-105 shadow-lg ${
                scrolled 
                  ? "bg-[#D4AF37] text-[#0D261C] cursor-pointer" 
                  : "bg-white text-[#0D261C] cursor-pointer"
              }`}
            >
              Ver Carrito ({cartTotalItems})
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen md:h-screen py-20 md:py-0 flex items-center justify-center overflow-hidden bg-[#0D261C]">
        {/* Subtle grid texture overlay */}
        <div 
          className="absolute inset-0 z-2 pointer-events-none opacity-[0.035]" 
          style={{
            backgroundImage: `radial-gradient(circle, white 1.2px, transparent 1.2px)`,
            backgroundSize: "28px 28px"
          }}
        />

        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{ 
                scale: { duration: 6.5, ease: "linear" }, 
                opacity: { duration: 1.5, ease: "easeInOut" } 
              }}
              className="absolute inset-0"
            >
              <img
                src={HERO_IMAGES[currentHeroIndex]}
                className="w-full h-full object-cover opacity-45"
                alt="Maria Bela Ambience"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D261C] via-transparent to-[#0D261C]/50" />
              <div className="absolute inset-0 bg-black/25" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Social Sidebar (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.9, type: "spring" }}
          className="absolute left-6 bottom-32 z-30 hidden lg:flex flex-col items-center gap-4"
        >
          <div className="flex flex-col gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
              aria-label="Visítanos en Instagram"
            >
              <Instagram size={15} className="transition-transform duration-300 group-hover:rotate-6" />
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
              aria-label="Visítanos en Facebook"
            >
              <Facebook size={15} className="transition-transform duration-300 group-hover:rotate-6" />
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
              aria-label="Escríbenos por WhatsApp"
            >
              <MessageCircle size={15} className="transition-transform duration-300 group-hover:rotate-6" />
            </a>
          </div>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#D4AF37] to-transparent" />
          <span className="text-[8px] text-[#D4AF37]/90 tracking-[0.3em] font-bold uppercase select-none [writing-mode:vertical-lr] rotate-180">
            Síguenos
          </span>
        </motion.div>

        {/* Unified Slider Controls & Indicators (Desktop/Tablet Only) */}
        <div className="absolute bottom-10 right-10 hidden md:flex items-center gap-3.5 bg-black/40 backdrop-blur-md px-4.5 py-2.5 rounded-full border border-white/10 z-30 shadow-2xl">
          <button
            onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
            className="text-white/70 hover:text-[#D4AF37] transition-colors cursor-pointer active:scale-75"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                className={`h-1 rounded-full transition-all duration-350 cursor-pointer ${
                  idx === currentHeroIndex ? "bg-[#D4AF37] w-6" : "bg-white/20 w-1.5 hover:bg-white/45"
                }`}
                aria-label={`Ir a la imagen ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)}
            className="text-white/70 hover:text-[#D4AF37] transition-colors cursor-pointer active:scale-75"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Top Badge */}
            <motion.div variants={heroItemVariants} className="mb-4 sm:mb-6 flex items-center gap-4">
              <div className="h-[1px] w-6 md:w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
              <span className="text-[#D4AF37] font-semibold uppercase tracking-[0.35em] text-[10px] md:text-xs">
                Gastronomía Artesanal
              </span>
              <div className="h-[1px] w-6 md:w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
            </motion.div>

            {/* Logo Image */}
            <motion.div 
              variants={heroItemVariants} 
              className="mb-4 sm:mb-5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:scale-[1.01] transition-transform duration-500"
            >
              <img
                src={BRAND_LOGO_WHITE_HERO}
                alt={BRAND_ALT}
                className="h-auto w-[65vw] sm:w-[50vw] md:w-[70vw] max-w-[280px] md:max-w-[500px] max-h-[14vh] md:max-h-none object-contain"
              />
            </motion.div>

            {/* Slogan */}
            <motion.p
              variants={heroItemVariants}
              className="text-base sm:text-xl md:text-3xl font-light text-white/95 font-serif italic mb-4 sm:mb-6 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              El Corazón de México & El Alma de Italia
            </motion.p>

            {/* Description (Hidden on mobile to save space) */}
            <motion.p
              variants={heroItemVariants}
              className="max-w-lg mx-auto text-white/80 text-xs md:text-sm leading-relaxed mb-6 sm:mb-8 font-light tracking-wide text-balance drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] hidden sm:block"
            >
              Donde cada platillo cuenta una historia de tradición, pasión y sabores únicos. Una experiencia culinaria inolvidable.
            </motion.p>

            {/* Mobile/Tablet Social Links */}
            <motion.div
              variants={heroItemVariants}
              className="flex lg:hidden items-center justify-center gap-3.5 mb-5 sm:mb-8"
            >
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:text-[#D4AF37] hover:border-[#D4AF37] active:scale-90 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:text-[#D4AF37] hover:border-[#D4AF37] active:scale-90 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:text-[#D4AF37] hover:border-[#D4AF37] active:scale-90 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </motion.div>

            {/* Quick Links Dashboard (Linktree style, premium look) */}
            <div className="grid grid-cols-1 gap-2.5 w-full max-w-[280px] sm:max-w-md px-2">
              {/* Primary: Ver Menú Completo */}
              <motion.div variants={heroItemVariants}>
                <a
                  onClick={() => {
                    const menuElement = document.getElementById("menu")
                    if (menuElement) menuElement.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="bg-[#D4AF37] text-[#0D261C] py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-between shadow-lg shadow-[#D4AF37]/15 hover:bg-white hover:text-[#0D261C] transition-all duration-300 cursor-pointer group w-full"
                >
                  <div className="flex items-center gap-2">
                    <Utensils size={14} className="opacity-90" />
                    <span>Menú Maria Bela</span>
                  </div>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>

              {/* Grid for categories: Bebidas & Infantil */}
              <motion.div variants={heroItemVariants} className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  onClick={() => navigateToCategory("bebidas")}
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span>Menú Bebidas</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  onClick={() => navigateToCategory("infantil")}
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span>Menú Infantil</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>

              {/* Grid for services: Reservaciones & Facturación */}
              <motion.div variants={heroItemVariants} className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href="/reservar"
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span>Reservaciones</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="/facturar"
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span>Facturación</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>

              {/* Grid for secondary links: PDF & Ubicación */}
              <motion.div variants={heroItemVariants} className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href="/MENU MARIA BELA_IMPRESION.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span className="flex items-center gap-1"><FileText size={11} className="opacity-80" /> Menú PDF</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span className="flex items-center gap-1">
                    <motion.div
                      animate={{ y: [0, -1.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      <MapPin size={11} className="opacity-80" />
                    </motion.div> 
                    Ubicación
                  </span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>

              {/* Botón: Compartir Menú / Código QR */}
              <motion.div variants={heroItemVariants} className="w-full">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-white/5 border border-white/10 text-white w-full py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-[#D4AF37] hover:text-[#0D261C] hover:border-[#D4AF37] transition-all duration-300 cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <QrCode size={12} className="opacity-80 transition-transform group-hover:scale-110" />
                    Compartir Menú (Código QR)
                  </span>
                  <Share2 size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Mouse Indicator (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">Descubre</span>
          <div className="w-[20px] h-[34px] rounded-full border border-white/20 flex justify-center p-1.5 bg-black/10 backdrop-blur-xs">
            <motion.div
              animate={{
                y: [0, 10, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
              className="w-1 h-1 bg-[#D4AF37] rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Chef Special Section */}
      <ChefSpecial items={featuredDishes} onAdd={addToCart} onSelect={setSelectedDish} />

      {/* Search Bar */}
      <div id="menu" className="container mx-auto px-4 lg:px-6 py-8 flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-2 border border-stone-200 flex items-center overflow-hidden focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all duration-300">
          <div className="p-3 text-[#0D261C]">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Buscar platillos..."
            className="w-full py-3 text-sm font-medium outline-none placeholder:text-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="p-3 text-stone-400 hover:text-stone-600">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="sticky top-[56px] md:top-[88px] z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-500">
        <div className="w-full">
          <div className="flex overflow-x-auto gap-3 py-3 px-4 md:px-8 lg:justify-center category-scroll select-none">
            {categories.map((key) => {
              const category = MENU_DATABASE[key]
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-300 shrink-0 cursor-pointer ${
                    activeTab === key
                      ? "bg-[#0D261C] text-white shadow-md shadow-[#0D261C]/15 scale-105 border border-[#0D261C]"
                      : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700 border border-transparent"
                  }`}
                >
                  <div className={`transition-colors duration-300 ${activeTab === key ? "text-[#D4AF37]" : "text-stone-400"}`}>
                    {renderCategoryIcon(category.icon)}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{category.title.split(" ")[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Menu Grid */}
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + searchTerm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              title={searchTerm ? "Resultados" : MENU_DATABASE[activeTab]?.title ?? ""}
              subtitle={
                searchTerm
                  ? `Mostrando resultados para "${searchTerm}"`
                    : MENU_DATABASE[activeTab]?.subtitle ?? ""
              }
              icon={
                searchTerm ? <Search className="w-5 h-5" /> : renderCategoryIcon(MENU_DATABASE[activeTab]?.icon ?? "Utensils")
              }
            />

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredItems.map((item, index) => (
                  <DishCard key={item.id} item={item} index={index} onAdd={addToCart} onSelect={setSelectedDish} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Leaf className="mx-auto text-stone-300 mb-4" size={48} />
                <p className="text-stone-400 font-medium mb-6">No se encontraron platillos con esos criterios.</p>
                <button
                  onClick={() => {
                    setSearchTerm("")
                  }}
                  className="bg-[#D4AF37] text-[#0D261C] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#c5a028] transition-colors shadow-md"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-[#0D261C] rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200"
              className="w-full h-full object-cover"
              alt="Banner"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <Award size={40} className="text-[#D4AF37] mb-6" />
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 text-balance">
              Todos los desayunos incluyen <span className="text-[#D4AF37]">Jugo o Fruta</span> & Café o Té.
            </h3>
            <p className="text-stone-300 text-base md:text-lg font-medium mb-8">
              Disfruta el sabor de Maria Bela de {settings.scheduleHours}, {settings.scheduleDays.toLowerCase()}.
            </p>
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#D4AF37] text-[#0D261C] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
            >
              Ver Ubicación <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        {/* Reseñas */}
        <section className="mt-20">
          <SectionHeader
            title="Lo Que Dicen Nuestros Clientes"
            subtitle="Reseñas verificadas"
            icon={<Star className="w-5 h-5" />}
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "María García",
                review: "La mejor lasaña que he probado. El ambiente es acogedor y el servicio excelente.",
                rating: 5,
              },
              {
                name: "Carlos Mendoza",
                review: "Los chilaquiles son increíbles. Siempre vengo a desayunar aquí los sábados.",
                rating: 5,
              },
              {
                name: "Ana López",
                review: "Las pizzas artesanales son deliciosas. La Mariabela es mi favorita.",
                rating: 5,
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-md border border-stone-100"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-stone-600 italic mb-4">"{review.review}"</p>
                <p className="font-bold text-[#0D261C]">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0D261C] pt-16 pb-8 mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#991B1B] to-[#D4AF37]" />
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <div className="mx-auto inline-flex drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]">
              <img
                src={BRAND_LOGO_WHITE}
                alt={BRAND_ALT}
                className="h-auto w-[260px] max-w-[72vw] object-contain"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <MapPin className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Visítanos</h4>
              <p className="text-stone-400 text-sm">
                {settings.addressLine1}
                <br />
                {settings.addressLine2}
              </p>
            </div>
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <Clock className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Horario</h4>
              <p className="text-stone-400 text-sm">
                {settings.scheduleDays}
                <br />
                {settings.scheduleHours}
              </p>
            </div>
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <Phone className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Pedidos</h4>
              <p className="text-stone-400 text-sm">
                WhatsApp: {settings.phoneDisplay}
                <br />
                {settings.instagramHandle}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full text-white hover:bg-[#D4AF37] hover:text-[#0D261C] transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full text-white hover:bg-[#D4AF37] hover:text-[#0D261C] transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Maria Bela Selección Gastronómica • 2026 • Diseño Premium
            </p>
            <a
              href="/admin"
              className="inline-block mt-3 text-stone-600 hover:text-[#D4AF37] text-[10px] uppercase tracking-widest transition-colors"
            >
              Administración
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Floating Button */}
      <motion.button
        onClick={() => setIsCartOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50 bg-[#0D261C] text-[#D4AF37] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform border-2 border-[#D4AF37]"
      >
        <ShoppingBag size={28} />
        {cartTotalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#991B1B] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {cartTotalItems}
          </span>
        )}
      </motion.button>

      {/* Modal de Detalle de Platillo */}
      <AnimatePresence>
        {selectedDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDish(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
              className="relative w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden bg-[#FDFDFB] rounded-3xl shadow-[0_25px_60px_-15px_rgba(13,38,28,0.35)] border border-[#D4AF37]/35 flex flex-col md:flex-row z-10 ring-1 ring-[#D4AF37]/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-5 right-5 z-40 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-md text-[#0D261C] hover:bg-[#991B1B] hover:text-white hover:border-[#991B1B] rounded-full transition-all duration-300 shadow-md border border-stone-200/50 cursor-pointer active:scale-90"
                aria-label="Cerrar modal"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              {/* Left Column: Image (Top on mobile) */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[250px] md:min-h-[450px] overflow-hidden">
                <img
                  src={selectedDish.image || CATEGORY_FALLBACK_IMAGES[selectedDish.category as keyof typeof CATEGORY_FALLBACK_IMAGES] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600"}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
                {/* Vignette gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Float badges */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2 z-20">
                  {selectedDish.tags?.map((tag: string) => {
                    const tagLower = tag.toLowerCase()
                    const isEstrella = tagLower === "estrella" || tagLower === "best seller" || tagLower === "recomendado" || tagLower === "de la casa"
                    const isPicante = tagLower === "picante" || tagLower === "hot"
                    const isLight = tagLower === "light" || tagLower === "vegetariano" || tagLower === "fresh" || tagLower === "vegano"
                    
                    return (
                      <span
                        key={tag}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                          isEstrella
                            ? "bg-[#0D261C]/90 text-[#D4AF37] border-[#D4AF37]/35"
                            : isPicante
                            ? "bg-[#991B1B]/95 text-white border-[#991B1B]/30"
                            : isLight
                            ? "bg-emerald-800/90 text-emerald-100 border-emerald-500/20"
                            : "bg-stone-900/80 text-stone-200 border-stone-700/30"
                        }`}
                      >
                        {isEstrella && <Star size={10} className="fill-[#D4AF37] text-[#D4AF37] animate-pulse" />}
                        {isPicante && <span className="text-[10px]">🔥</span>}
                        {isLight && <Leaf size={10} className="fill-current text-current" />}
                        <span>{tag}</span>
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Info & Actions (Scrolls independently on desktop) */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-[#FDFDFB] md:overflow-y-auto max-h-full">
                <div className="space-y-5">
                  {/* Category breadcrumb */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#D4AF37]">
                      {MENU_DATABASE[selectedDish.category]?.title || selectedDish.category}
                    </span>
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
                  </div>

                  {/* Title & Price Row */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#0D261C] leading-tight tracking-wide">
                      {selectedDish.name}
                    </h3>
                    <div className="flex items-baseline gap-1 text-[#D4AF37] font-serif">
                      <span className="text-lg font-light">$</span>
                      <span className="text-3xl font-bold tracking-tight">{selectedDish.price}</span>
                      <span className="text-[9px] text-stone-400 font-sans tracking-widest uppercase ml-2.5 font-bold">MXN</span>
                    </div>
                  </div>

                  {/* Luxury Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-[1px] w-10 bg-gradient-to-r from-[#991B1B] to-transparent" />
                    <span className="text-[#991B1B] text-[8px] opacity-75">◆</span>
                    <div className="h-[1px] w-10 bg-gradient-to-l from-[#991B1B] to-transparent" />
                  </div>

                  {/* Description / Ingredients */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Ingredientes y Preparación
                    </h4>
                    <div className="bg-[#FAF9F5] border border-stone-200/40 rounded-2xl p-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)]">
                      <p className="text-stone-700 text-[13px] leading-relaxed font-serif italic text-pretty">
                        {selectedDish.ingredients || "Preparado con los ingredientes más frescos de la casa, siguiendo recetas artesanales tradicionales."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer section of modal: Quantity & Add Button */}
                <div className="mt-8 pt-5 border-t border-stone-200/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Quantity Selector Section */}
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D261C]">Cantidad</span>
                      
                      {/* Quantity Selector (iOS Style) */}
                      <div className="flex items-center bg-stone-100 border border-stone-200/40 rounded-full p-1 shadow-inner">
                        <button
                          onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-stone-500 hover:text-[#991B1B] shadow-sm hover:shadow active:scale-95 transition-all duration-200 cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-[#0D261C] select-none">
                          {selectedQuantity}
                        </span>
                        <button
                          onClick={() => setSelectedQuantity((q) => q + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-stone-500 hover:text-[#0D261C] shadow-sm hover:shadow active:scale-95 transition-all duration-200 cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Price subtotal preview */}
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Subtotal</p>
                      <p className="font-serif text-[#D4AF37] font-bold text-xl">${selectedDish.price * selectedQuantity}</p>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => {
                      addToCartWithQuantity(selectedDish, selectedQuantity)
                      setSelectedDish(null)
                    }}
                    className="w-full bg-[#0D261C] text-white py-3.5 px-6 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#991B1B] active:scale-[0.98] transition-all duration-300 flex items-center justify-between group overflow-hidden relative shadow-lg shadow-[#0D261C]/10 cursor-pointer border border-white/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={13} className="transition-transform group-hover:scale-110" />
                      Agregar al pedido
                    </span>
                    <span className="font-serif font-bold text-xs bg-white/10 px-3.5 py-1 rounded-full text-[#D4AF37] border border-white/5 shadow-inner">
                      ${selectedDish.price * selectedQuantity}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        clearCart={clearCart}
        orderNotes={orderNotes}
        setOrderNotes={setOrderNotes}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        location={location}
        setLocation={setLocation}
        settings={settings}
      />

      {/* Modal de Código QR / Compartir Menú */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo / Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Caja del Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm overflow-hidden bg-[#0D261C]/95 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center z-10"
            >
              {/* Botón de cerrar */}
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3 mt-2 animate-pulse">
                <QrCode size={24} />
              </div>

              <h3 className="font-serif text-lg font-bold text-white mb-1">
                Compartir Menú
              </h3>
              <p className="text-xs text-white/60 max-w-xs mb-5">
                Escanea el código QR desde tu celular para acceder directamente al menú digital de Maria Bela.
              </p>

              {/* Contenedor del QR */}
              <div className="bg-white p-3.5 rounded-2xl border border-white/10 shadow-lg mb-5">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Menu QR Code"
                    className="w-44 h-44 rounded-lg select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-[#0D261C] font-semibold text-xs">
                    Generando QR...
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-[#D4AF37]" />
                      <span className="text-[#D4AF37]">¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar enlace del menú</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent("¡Hola! Te comparto el menú digital de Maria Bela para ordenar o ver nuestros platillos: " + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-[#0D261C] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={14} className="fill-[#0D261C] text-[#0D261C]" />
                  <span>Compartir por WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
