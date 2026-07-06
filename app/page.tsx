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
function DishCard({ item, index, onAdd }: { item: any; index: number; onAdd: (item: any) => void }) {
  const [imageError, setImageError] = useState(false)
  const category = item.category || "desayunos"
  const fallback = CATEGORY_FALLBACK_IMAGES[category as keyof typeof CATEGORY_FALLBACK_IMAGES] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600"
  const imageUrl = (item.image && !imageError) ? item.image : fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="relative h-48 lg:h-52 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={item.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

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
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-base font-serif font-bold text-[#0D261C] leading-tight group-hover:text-[#991B1B] transition-colors line-clamp-2">
            {item.name}
          </h3>
          <span className="text-[#D4AF37] font-bold text-base shrink-0">${item.price}</span>
        </div>

        <p className="text-stone-500 text-xs italic leading-relaxed line-clamp-2 mb-4 min-h-[2rem]">
          "{item.ingredients}"
        </p>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAdd(item)}
            className="flex-1 bg-[#0D261C] text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-[#991B1B] transition-colors active:scale-95 transform duration-100"
          >
            <ShoppingBag size={13} /> Agregar
          </button>
          <button className="p-2.5 bg-stone-100 rounded-xl text-stone-500 hover:bg-stone-200 hover:text-red-500 transition-colors">
            <Heart size={15} />
          </button>
        </div>
      </div>
    </motion.div>
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

  const handleCheckout = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
    })

    const message =
      "Hola Maria Bela, me gustaría ordenar:\n\n" +
      cart.map((item) => `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})`).join("\n") +
      `\n\n*Total: $${total}*` +
      (location ? `\n\n*Ubicación GPS:* https://www.google.com/maps?q=${location.lat},${location.lng}` : "") +
      (deliveryAddress ? `\n*Dirección/Referencias:* ${deliveryAddress}` : "") +
      (orderNotes ? `\n\n*Notas:* ${orderNotes}` : "") +
      `\n\nGracias.`
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#0D261C] text-white">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-3">
                <ShoppingBag className="text-[#D4AF37]" /> Tu Pedido
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p className="font-medium">Tu carrito está vacío</p>
                  <button
                    onClick={onClose}
                    className="text-[#D4AF37] font-bold uppercase text-xs tracking-widest hover:underline"
                  >
                    Ver Menú
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#0D261C]/5 rounded-xl border border-stone-200 flex items-center justify-center text-[#0D261C]/40 shrink-0">
                          <Utensils size={24} />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-[#0D261C] leading-tight mb-1">{item.name}</h4>
                        <p className="text-[#D4AF37] font-bold text-sm mb-2">${item.price * item.quantity}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stone-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-stone-100 text-stone-500"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-stone-100 text-stone-500"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 ml-auto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div key="address" className="pt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                      Ubicación de entrega
                    </label>
                    {!location ? (
                      <button
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="w-full py-4 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 hover:bg-stone-200 hover:border-stone-400 transition-all flex flex-col items-center justify-center gap-2 group mb-3"
                      >
                        <div className={`bg-white p-2 rounded-full shadow-sm ${isLocating ? "animate-pulse" : ""}`}>
                          <MapPin size={20} className={isLocating ? "text-stone-400" : "text-[#D4AF37]"} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {isLocating ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
                        </span>
                      </button>
                    ) : (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100 mb-3">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        ></iframe>
                        <button
                          onClick={() => setLocation(null)}
                          className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        location
                          ? "Referencias adicionales (color de casa, entre calles...)"
                          : "Calle, número, colonia, referencias..."
                      }
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-[#D4AF37] resize-none h-20"
                    />
                  </div>
                  <div key="notes" className="pt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                      Notas adicionales
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Instrucciones especiales, alergias, etc."
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-[#D4AF37] resize-none h-24"
                    />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-[#0D261C]">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <button
                  onClick={clearCart}
                  className="w-full border border-stone-200 text-stone-500 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-100 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Vaciar Carrito
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#0D261C] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle size={20} /> Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Componente de Recomendación del Chef
function ChefSpecial({ items, onAdd }: { items: any[]; onAdd: (item: any) => void }) {
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
            <div className="h-64 md:h-auto overflow-hidden relative min-h-[300px] md:min-h-[400px]">
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

              <h3 className="text-[#D4AF37] font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
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

export default function MariaBela() {
  const { menu: MENU_DATABASE, settings, loaded } = useSiteData()
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
                  href={`https://wa.me/${settings.whatsapp}?text=Hola%20Maria%20Bela%2C%20me%20gustar%C3%ADa%20hacer%20una%20reservaci%C3%B3n.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 text-white py-2.5 px-3.5 rounded-xl font-bold uppercase tracking-widest text-[8.5px] sm:text-[9.5px] flex items-center justify-between backdrop-blur-xs hover:bg-white hover:text-[#0D261C] hover:border-white transition-all duration-300 cursor-pointer group"
                >
                  <span>Reservaciones</span>
                  <ArrowRight size={11} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=Hola%20Maria%20Bela%2C%20necesito%20facturar%20mi%20consumo.`}
                  target="_blank"
                  rel="noopener noreferrer"
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
      <ChefSpecial items={featuredDishes} onAdd={addToCart} />

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
                  <DishCard key={item.id} item={item} index={index} onAdd={addToCart} />
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
