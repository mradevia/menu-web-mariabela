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
} from "lucide-react"
import confetti from "canvas-confetti"
import { MENU_DATABASE } from "./menu"


interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

// Componente de tarjeta de platillo
function DishCard({ item, index, onAdd }: { item: any; index: number; onAdd: (item: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100 flex flex-col hover:shadow-2xl transition-all duration-300"
    >
      <div
        className="relative h-56 lg:h-64 overflow-hidden cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.img
          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-[#991B1B] text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
          <h3 className="text-xl lg:text-2xl font-serif font-bold leading-tight mb-1 drop-shadow-lg text-balance">
            {item.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-bold text-xl lg:text-2xl">${item.price}</span>
            <span className="text-stone-400 text-[10px] font-medium uppercase tracking-widest">M.N.</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-[#D4AF37] text-black p-2 rounded-full shadow-xl transition-transform group-hover:scale-110">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-5 bg-stone-50 border-t border-stone-200"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-[#0D261C] p-2 rounded-lg shrink-0">
                <Utensils size={16} className="text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Descripción del Chef
                </h4>
                <p className="text-stone-700 font-medium text-sm leading-relaxed italic">"{item.ingredients}"</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAdd(item)}
                className="flex-1 bg-[#0D261C] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#991B1B] transition-colors active:scale-95 transform duration-100"
              >
                <ShoppingBag size={16} /> Agregar
              </button>
              <button className="p-3 bg-stone-200 rounded-xl text-stone-600 hover:bg-stone-300 transition-colors">
                <Heart size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    window.open(`https://wa.me/5215512345678?text=${encodeURIComponent(message)}`, "_blank")
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
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl shadow-sm"
                      />
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

  useEffect(() => {
    if (items.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [items])

  if (items.length === 0) return null

  const item = items[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="container mx-auto px-4 lg:px-6 py-8 mt-8"
    >
      <div className="relative bg-[#0D261C] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 group min-h-[500px] md:min-h-[400px]">
        <div className="absolute top-6 right-6 z-20">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-[#D4AF37] text-[#0D261C] font-bold px-4 py-2 rounded-full uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2"
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
            className="grid md:grid-cols-2 gap-0 h-full"
          >
            <div className="h-64 md:h-auto overflow-hidden relative min-h-[300px]">
              <img
                src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D261C] via-transparent to-transparent md:hidden" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Utensils size={120} className="text-white" />
              </div>

              <h3 className="text-[#D4AF37] font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {item.name}
              </h3>
              <p className="text-stone-300 text-base md:text-lg mb-8 italic leading-relaxed font-light">
                "{item.ingredients}"
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Precio</span>
                  <span className="text-3xl font-bold text-white">${item.price}</span>
                </div>
                <button
                  onClick={() => onAdd(item)}
                  className="flex-1 bg-white text-[#0D261C] py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95 transform duration-100"
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

export default function MariaBela() {
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
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const allItems = Object.values(MENU_DATABASE).flatMap((category) => category.items)
    const specialItems = allItems.filter((item) =>
      item.tags?.some((tag: string) => ["Chef", "Premium", "Estrella", "De la Casa"].includes(tag)),
    )
    const pool = specialItems.length > 0 ? specialItems : allItems

    if (pool.length > 0) {
      const shuffled = [...pool].sort(() => 0.5 - Math.random())
      setFeaturedDishes(shuffled.slice(0, 3))
    }
  }, [])

  const filteredItems = useMemo(() => {
    let items: any[] = []
    if (searchTerm) {
      items = Object.values(MENU_DATABASE).flatMap((category) => category.items)
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.ingredients.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else {
      items = MENU_DATABASE[activeTab as keyof typeof MENU_DATABASE].items
    }

    return items
  }, [activeTab, searchTerm])

  const categories = Object.keys(MENU_DATABASE)

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
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#0D261C]/95 backdrop-blur-md py-3 shadow-2xl" : "bg-transparent py-6"
          }`}
      >
        <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h1
              className={`text-2xl md:text-3xl font-serif font-bold tracking-tight leading-none ${scrolled ? "text-white" : "text-white drop-shadow-lg"
                }`}
            >
              Maria<span className={scrolled ? "text-[#D4AF37]" : "text-[#D4AF37]"}>Bela</span>
            </h1>
            <span
              className={`text-[8px] font-bold tracking-[0.4em] uppercase ${scrolled ? "text-[#D4AF37]" : "text-white/80"
                }`}
            >
              México & Italia
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden lg:flex flex-col items-end ${scrolled ? "text-stone-300" : "text-white/90"}`}>
              <span className="text-[10px] font-bold uppercase">Abierto</span>
              <span className="text-[9px] font-medium">LUN-SÁB 9:00 — 16:00</span>
            </div>
            <a
              onClick={() => setIsCartOpen(true)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all transform hover:scale-105 shadow-lg ${scrolled ? "bg-[#D4AF37] text-[#0D261C] cursor-pointer" : "bg-white text-[#0D261C] cursor-pointer"
                }`}
            >
              Ver Carrito ({cartTotalItems})
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0D261C]">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={HERO_IMAGES[currentHeroIndex]}
                className="w-full h-full object-cover opacity-50"
                alt="Maria Bela Ambience"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D261C] via-transparent to-[#0D261C]/30" />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]/60" />
              <span className="text-[#D4AF37] font-medium uppercase tracking-[0.3em] text-[10px] md:text-xs">
                Gastronomía Artesanal
              </span>
              <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]/60" />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-medium text-white leading-none tracking-tight mb-4">
              Maria<span className="italic text-[#D4AF37] font-light">Bela</span>
            </h1>

            <p className="text-xl md:text-3xl font-light text-white/90 font-serif italic mb-8 tracking-wide">
              El Corazón de México & El Alma de Italia
            </p>

            <p className="max-w-2xl mx-auto text-white/70 text-sm md:text-base leading-relaxed mb-10 font-light tracking-wide text-balance">
              Donde cada platillo cuenta una historia de tradición, pasión y sabores únicos. Una experiencia culinaria
              inolvidable.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#menu"
                className="bg-[#D4AF37] text-[#0D261C] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Ver Menú Digital
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/MENU MARIA BELA_IMPRESION.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-[#0D261C] transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <FileText size={16} /> Descargar PDF
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.google.com/maps/search/?api=1&query=Maria+Bela+Coacalco"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] hover:text-[#0D261C] transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <MapPin size={16} />
                </motion.div>
                Ver Ubicación
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 2, repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest">Descubre</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
          </div>
        </motion.div>
      </section>

      {/* Chef Special Section */}
      <ChefSpecial items={featuredDishes} onAdd={addToCart} />

      {/* Search Bar */}
      <div id="menu" className="container mx-auto px-4 lg:px-6 py-8 flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-2 border border-stone-200 flex items-center overflow-hidden">
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
      <nav className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-md py-4 border-b border-stone-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 lg:gap-4 pb-2 no-scrollbar lg:justify-center">
            {categories.map((key) => {
              const category = MENU_DATABASE[key as keyof typeof MENU_DATABASE]
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap flex flex-col items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shrink-0 ${activeTab === key
                      ? "bg-[#0D261C] text-white shadow-lg scale-105"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                >
                  <div className={activeTab === key ? "text-[#D4AF37]" : ""}>{category.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{category.title.split(" ")[0]}</span>
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
              title={searchTerm ? "Resultados" : MENU_DATABASE[activeTab as keyof typeof MENU_DATABASE].title}
              subtitle={
                searchTerm
                  ? `Mostrando resultados para "${searchTerm}"`
                    : MENU_DATABASE[activeTab as keyof typeof MENU_DATABASE].subtitle
              }
              icon={
                searchTerm ? <Search className="w-5 h-5" /> : MENU_DATABASE[activeTab as keyof typeof MENU_DATABASE].icon
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
              Disfruta el sabor de Maria Bela de 9:00 AM a 4:00 PM, de lunes a sábado.
            </p>
            <a
              href="https://maps.google.com"
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-none">
              Maria<span className="text-[#D4AF37]">Bela</span>
            </h2>
            <p className="text-[#D4AF37] text-xs mt-2 font-bold tracking-[0.5em] uppercase">México & Italia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <MapPin className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Visítanos</h4>
              <p className="text-stone-400 text-sm">
                Eje 8, Villa de las Flores
                <br />
                Coacalco de Berriozábal, EdoMéx.
              </p>
            </div>
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <Clock className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Horario</h4>
              <p className="text-stone-400 text-sm">
                Lunes a Sábado
                <br />
                9:00 AM — 4:00 PM
              </p>
            </div>
            <div className="bg-[#0D261C]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center">
              <Phone className="mx-auto text-[#D4AF37] mb-3" size={28} />
              <h4 className="font-bold uppercase tracking-widest text-sm text-white mb-2">Pedidos</h4>
              <p className="text-stone-400 text-sm">
                WhatsApp: 55 1234 5678
                <br />
                @mariabelacoacalco
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <a
              href="#"
              className="bg-white/10 p-3 rounded-full text-white hover:bg-[#D4AF37] hover:text-[#0D261C] transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="bg-white/10 p-3 rounded-full text-white hover:bg-[#D4AF37] hover:text-[#0D261C] transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Maria Bela Selección Gastronómica • 2026 • Diseño Premium
            </p>
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
      />
    </div>
  )
}
