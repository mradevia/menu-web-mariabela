"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarCheck, Check, Loader2, ArrowLeft, Users, Clock, Mail, Phone, User, MessageSquare, ChevronRight, Calendar, Sparkles, MapPin, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { createClient } from "@/lib/supabase/client"
import { createPublicReservation, listReservations } from "@/lib/services/reservations"

export default function ReservarForm() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [partySize, setPartySize] = useState("2")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("") // Starts empty to force a time selection
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Custom party size inputs (for 8+ guests)
  const [showCustomPartyInput, setShowCustomPartyInput] = useState(false)
  const [customPartySize, setCustomPartySize] = useState("")

  // Availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [busySlots, setBusySlots] = useState<string[]>([])
  
  const [timeType, setTimeType] = useState<"comida" | "cena">("comida")

  const dateInputRef = useRef<HTMLInputElement>(null)
  const today = new Date().toISOString().slice(0, 10)

  // Trigger confetti when reservation is successful
  useEffect(() => {
    if (done) {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#D4AF37", "#1B4332", "#FCFAF5", "#C59B27"]
      })
    }
  }, [done])

  // Query Supabase for existing reservations on selected date
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date) {
        setBusySlots([])
        return
      }
      setIsCheckingAvailability(true)
      try {
        const supabase = createClient()
        // Define day start and end in local timezone, then convert to UTC ISO strings
        const dFrom = new Date(`${date}T00:00:00`)
        const dTo = new Date(`${date}T23:59:59`)
        
        const resList = await listReservations(supabase, {
          from: dFrom.toISOString(),
          to: dTo.toISOString(),
          statuses: ["pending", "confirmed", "attended"]
        })
        
        // Extract time (HH:MM) from the UTC timestamps (converted to local date objects)
        const bookedTimes = resList.map(r => {
          const dateObj = new Date(r.reserved_for)
          const hours = dateObj.getHours().toString().padStart(2, '0')
          const minutes = dateObj.getMinutes().toString().padStart(2, '0')
          return `${hours}:${minutes}`
        })
        
        setBusySlots(bookedTimes)
      } catch (err) {
        console.error("Error loading availability:", err)
        setBusySlots([])
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    fetchAvailability()
  }, [date])

  const selectTime = (selectedTime: string) => {
    setTime(selectedTime)
  }

  const handlePartySelect = (num: string) => {
    if (num === "8") {
      setShowCustomPartyInput(true)
      setPartySize(customPartySize || "8")
    } else {
      setShowCustomPartyInput(false)
      setPartySize(num)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !phone.trim() || !date || !time) {
      setError("Por favor completa tu nombre, teléfono, fecha y horario.")
      return
    }
    
    // Safety check if slot is fully booked
    if (getSlotStatus(time) === "full") {
      setError("Este horario se ha llenado recientemente. Por favor elige otro.")
      return
    }

    // Safety check if 8+ is selected but no specific quantity is typed
    if (showCustomPartyInput && (!customPartySize || Number(customPartySize) < 8)) {
      setError("Por favor especifica el número exacto de personas (mínimo 8).")
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      await createPublicReservation(supabase, {
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        partySize: Number(partySize) || 1,
        reservedFor: new Date(`${date}T${time}:00`).toISOString(),
        notes: notes.trim() || undefined,
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError("No se pudo enviar tu reservación. Intenta de nuevo o llámanos.")
    } finally {
      setSaving(false)
    }
  }

  // Date and Time friendly formatters for UI
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "Selecciona una fecha"
    const [year, month, day] = dateStr.split("-").map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
  }

  const formatFriendlyTime = (timeStr: string) => {
    if (!timeStr) return "Selecciona una hora"
    const [hours, minutes] = timeStr.split(":")
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? "PM" : "AM"
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  // Check capacity for a specific time slot (e.g. limit to 3 tables per slot)
  const getSlotStatus = (slot: string) => {
    const count = busySlots.filter(t => t === slot).length
    if (count >= 3) return "full"
    if (count >= 1) return "few"
    return "available"
  }

  const partyOptions = ["1", "2", "3", "4", "5", "6", "7", "8"]
  const comidaSlots = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
  const cenaSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"]
  const activeSlots = timeType === "comida" ? comidaSlots : cenaSlots

  const isStep1Valid = date !== "" && time !== "" && getSlotStatus(time) !== "full" && (!showCustomPartyInput || (customPartySize !== "" && Number(customPartySize) >= 8))

  if (done) {
    return (
      <div className="min-h-screen bg-[#06110C] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Dynamic Animated Background SVG */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#06110C] bg-[radial-gradient(circle_at_50%_120%,#1B4332_0%,#06110C_70%)] opacity-85" />
          
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 20, 0],
              y: [0, -35, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#1B4332]/20 rounded-full blur-[120px]"
          />
          
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.5"
              animate={{
                d: [
                  "M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z",
                  "M-100 330 C 250 280, 450 190, 850 270 C 1250 350, 1450 250, 1800 310 L 1800 1000 L -100 1000 Z",
                  "M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z",
                ]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.93, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-[#FCFAF5] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/20 relative z-10"
        >
          {/* VIP Voucher Header */}
          <div className="bg-[#0D261C] p-5 text-center border-b border-[#D4AF37]/35 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
              className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-2"
            >
              <CheckCircle2 size={20} className="text-[#D4AF37]" />
            </motion.div>
            <h1 className="font-serif text-xl font-bold text-white tracking-wide">Maria Bela</h1>
            <p className="text-[#D4AF37] font-medium text-[9px] tracking-[0.25em] uppercase mt-0.5">Mesa Solicitada</p>
          </div>
          
          {/* Ticket Body */}
          <div className="p-5 sm:p-6 text-center text-[#0D261C]">
            <p className="text-[#0D261C] font-serif font-bold text-xs tracking-wider uppercase mb-4">
              Pendiente de Confirmación
            </p>
            
            {/* Elegant Ticket Voucher Container */}
            <div className="bg-white border border-[#E9E4DC] rounded-2xl p-5 text-left relative shadow-sm">
              <div className="absolute top-0 right-0 px-2.5 py-1 bg-[#0D261C]/5 border-bl border-[#E9E4DC] text-[#0D261C] text-[9px] uppercase font-bold tracking-wider rounded-bl-xl rounded-tr-2xl">
                Ticket #{(Math.floor(Math.random() * 90000) + 10000)}
              </div>
              
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[9px] uppercase text-stone-400 font-bold tracking-widest block">Invitado</span>
                  <span className="text-[#0D261C] font-serif font-bold text-xl">{name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-2">
                  <div>
                    <span className="text-[9px] uppercase text-stone-400 font-bold tracking-widest block flex items-center gap-1">
                      <Users size={9} className="text-[#0D261C]/65" /> Personas
                    </span>
                    <span className="text-[#0D261C] font-serif font-medium text-base">{partySize} {Number(partySize) === 1 ? 'persona' : 'personas'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-stone-400 font-bold tracking-widest block flex items-center gap-1">
                      <Clock size={9} className="text-[#0D261C]/65" /> Hora
                    </span>
                    <span className="text-[#0D261C] font-serif font-medium text-base">{formatFriendlyTime(time)}</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-2">
                  <span className="text-[9px] uppercase text-stone-400 font-bold tracking-widest block flex items-center gap-1">
                    <Calendar size={9} className="text-[#0D261C]/65" /> Fecha
                  </span>
                  <span className="text-[#0D261C] font-serif font-medium text-base capitalize">{formatFriendlyDate(date)}</span>
                </div>
              </div>

              {/* Ticket cutout */}
              <div className="relative border-t border-dashed border-stone-300 my-3.5 pt-3">
                <div className="absolute -left-8.5 -top-3 w-5 h-5 rounded-full bg-[#06110C] border border-[#D4AF37]/10" />
                <div className="absolute -right-8.5 -top-3 w-5 h-5 rounded-full bg-[#06110C] border border-[#D4AF37]/10" />
                
                <span className="text-[11px] text-stone-500 text-center block leading-relaxed">
                  Te confirmaremos por teléfono al: <strong className="text-[#0D261C] font-semibold">{phone}</strong>
                </span>
              </div>
            </div>

            <p className="text-stone-500 text-xs mt-5 mb-5 leading-relaxed">
              Hemos recibido tu solicitud. El staff de Maria Bela revisará la disponibilidad de mesas y te contactará a la brevedad.
            </p>

            <a 
              href="/" 
              className="w-full inline-block py-3.5 px-6 rounded-xl bg-[#0D261C] text-white font-sans font-bold tracking-wider hover:bg-[#153a2b] transition-all duration-300 shadow-md shadow-[#0D261C]/15"
            >
              Volver al menú
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06110C] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Animated Background SVG */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Shifting radial gradient background */}
        <div className="absolute inset-0 bg-[#06110C] bg-[radial-gradient(circle_at_50%_120%,#1B4332_0%,#06110C_70%)] opacity-85" />
        
        {/* Floating green/gold blur elements */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 25, 0],
            y: [0, -35, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{
            scale: [1, 1.22, 1],
            x: [0, -30, 0],
            y: [0, 35, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#1B4332]/20 rounded-full blur-[125px]"
        />
        
        {/* Moving organic SVG curves */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            animate={{
              d: [
                "M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z",
                "M-100 330 C 250 280, 450 190, 850 270 C 1250 350, 1450 250, 1800 310 L 1800 1000 L -100 1000 Z",
                "M-100 300 C 200 350, 400 150, 800 300 C 1200 450, 1400 200, 1800 350 L 1800 1000 L -100 1000 Z",
              ]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Main Container Card (Dual Pane) */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl bg-[#FCFAF5] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[580px] relative border border-[#D4AF37]/15 z-10"
      >
        {/* Left Side: Brand & Dynamic Preview (Deep Forest Green Background) */}
        <div className="hidden md:flex md:w-5/12 bg-[#0D261C] p-7 flex-col justify-between relative overflow-hidden">
          {/* Gold vertical bar divider */}
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#D4AF37]/25" />
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[#D4AF37] w-4.5 h-4.5 animate-pulse" />
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#D4AF37]/90">Experiencia Gastronómica</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">Maria Bela</h2>
            <p className="text-stone-400 text-[10px] tracking-[0.25em] uppercase mt-0.5">México & Italia</p>
          </div>

          {/* Luxury Dynamic Invitation Preview Card */}
          <div className="bg-[#091A13]/80 border border-[#D4AF37]/15 rounded-2xl p-4.5 my-4 backdrop-blur-md shadow-inner">
            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold block mb-3 border-b border-[#D4AF37]/10 pb-1">Tu Reservación</span>
            
            <div className="space-y-3">
              {/* Guests */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Users size={12} className="text-[#D4AF37]" />
                </div>
                <div>
                  <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block">Mesa para</span>
                  <span className="text-white text-xs font-serif font-medium">
                    {showCustomPartyInput && customPartySize 
                      ? `${customPartySize} personas` 
                      : `${partySize} ${Number(partySize) === 1 ? 'persona' : 'personas'}`}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Calendar size={12} className="text-[#D4AF37]" />
                </div>
                <div>
                  <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block">Fecha</span>
                  <span className="text-white text-xs font-serif font-medium capitalize">
                    {date ? formatFriendlyDate(date) : "Sin seleccionar"}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <Clock size={12} className="text-[#D4AF37]" />
                </div>
                <div>
                  <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block">Horario</span>
                  <span className="text-white text-xs font-serif font-medium">
                    {time ? formatFriendlyTime(time) : "Sin seleccionar"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Details */}
          <div className="space-y-3">
            <p className="text-stone-400 text-xs italic leading-relaxed font-light">
              "La cocina une lo que el mar y la tierra separan. Vive la experiencia gastronómica en Coacalco."
            </p>
            <div className="flex items-center gap-2 text-stone-500 text-[9px] uppercase tracking-wider">
              <MapPin size={11} className="text-[#D4AF37]" />
              <span>Coacalco de Berriozábal</span>
            </div>
          </div>
        </div>

        {/* Right Side: Step Form (Luxurious Cream Background) */}
        <div className="w-full md:w-7/12 p-5 sm:p-7 flex flex-col justify-between min-h-[500px] bg-[#FCFAF5]">
          {/* Header Mobile / Title */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E9E4DC]">
              <div className="flex items-center gap-2">
                {step > 1 ? (
                  <button 
                    onClick={() => setStep(1)}
                    className="p-1.5 -ml-1 rounded-full hover:bg-stone-200/50 text-[#0D261C] transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <a 
                    href="/" 
                    className="p-1.5 -ml-1 rounded-full hover:bg-stone-200/50 text-[#0D261C] transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </a>
                )}
                <div>
                  <h1 className="text-[#0D261C] font-serif text-lg sm:text-xl font-bold tracking-wide">Reserva tu mesa</h1>
                  <span className="text-[#0D261C]/50 text-[9px] uppercase tracking-[0.12em] md:hidden font-bold">Maria Bela</span>
                </div>
              </div>

              {/* Progress step dots */}
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "bg-[#0D261C] scale-125" : "bg-stone-300"}`} />
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-[#0D261C] scale-125" : "bg-stone-300"}`} />
              </div>
            </div>

            {/* Mobile Summary Banner (Only visible in step 2 on mobile devices) */}
            {step === 2 && (
              <div className="md:hidden bg-[#0D261C] text-white px-3.5 py-2.5 rounded-xl mb-4 flex items-center justify-between border border-[#D4AF37]/25 shadow-md">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-[#D4AF37] font-bold">Mesa Solicitada</span>
                  <span className="text-xs font-serif font-medium">
                    {showCustomPartyInput && customPartySize ? `${customPartySize} personas` : `${partySize} personas`} · {date ? formatFriendlyDate(date).split(",")[1] || formatFriendlyDate(date) : ""}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-stone-400 font-bold block">Hora</span>
                  <span className="text-xs font-serif font-medium text-[#D4AF37]">{formatFriendlyTime(time)}</span>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl mb-4 text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Steps Forms */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Date Picker (Enhanced Clickable Area) */}
                    <div>
                      <label className="block text-xs sm:text-sm font-serif font-bold text-[#0D261C] mb-1.5 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#0D261C]/70" /> 1. Elige la fecha de tu visita *
                      </label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => {
                          try {
                            dateInputRef.current?.showPicker()
                          } catch (e) {
                            dateInputRef.current?.focus()
                          }
                        }}
                      >
                        <input
                          ref={dateInputRef}
                          type="date"
                          value={date}
                          min={today}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          className={`${inputCls} cursor-pointer text-sm sm:text-base`}
                        />
                        <Calendar className="absolute left-3.5 top-3.5 text-[#0D261C]/50 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Guests selector (Serif Circles / High contrast) */}
                    <div>
                      <label className="block text-xs sm:text-sm font-serif font-bold text-[#0D261C] mb-2 flex items-center gap-1.5">
                        <Users size={13} className="text-[#0D261C]/70" /> 2. Número de comensales *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {partyOptions.map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handlePartySelect(num)}
                            className={`py-2 rounded-xl border text-sm font-serif transition-all duration-200 ${
                              (num === "8" && showCustomPartyInput) || (partySize === num && !showCustomPartyInput)
                                ? "bg-[#0D261C] text-white border-[#0D261C] shadow-md shadow-[#0D261C]/15 font-bold scale-[1.03]"
                                : "bg-white text-[#0D261C] border-[#E9E4DC] hover:border-stone-400 hover:bg-stone-50"
                            }`}
                          >
                            {num === "8" ? "8+" : num}
                          </button>
                        ))}
                      </div>

                      {/* Custom Party Size Input for 8+ guests */}
                      <AnimatePresence>
                        {showCustomPartyInput && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden bg-white border border-[#E9E4DC] p-3 rounded-xl shadow-sm"
                          >
                            <label className="block text-xs font-semibold text-[#0D261C] mb-1.5">
                              Especifica el número exacto de personas (8 o más) *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="8"
                                value={customPartySize}
                                onChange={(e) => {
                                  setCustomPartySize(e.target.value)
                                  setPartySize(e.target.value)
                                }}
                                required
                                placeholder="Ej. 12"
                                className={inputCls}
                              />
                              <Users className="absolute left-3.5 top-3 text-[#0D261C]/50 w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-stone-500 italic mt-1 block leading-normal">
                              Nota: Para grupos mayores a 8 personas se requiere confirmación especial del staff.
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Time slot picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs sm:text-sm font-serif font-bold text-[#0D261C] flex items-center gap-1.5">
                          <Clock size={13} className="text-[#0D261C]/70" /> 3. Elige la hora *
                        </label>
                        
                        {/* Time category tabs */}
                        {date && !isCheckingAvailability && (
                          <div className="bg-stone-100 p-0.5 rounded-lg flex border border-[#E9E4DC]">
                            <button
                              type="button"
                              onClick={() => setTimeType("comida")}
                              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                                timeType === "comida"
                                  ? "bg-[#0D261C] text-white shadow-sm"
                                  : "text-stone-500 hover:text-[#0D261C]"
                              }`}
                            >
                              Comida
                            </button>
                            <button
                              type="button"
                              onClick={() => setTimeType("cena")}
                              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                                timeType === "cena"
                                  ? "bg-[#0D261C] text-white shadow-sm"
                                  : "text-stone-500 hover:text-[#0D261C]"
                              }`}
                            >
                              Cena
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Time grid / Availability Checker State */}
                      <div className="bg-white border border-[#E9E4DC] p-3 rounded-2xl min-h-[130px] flex items-center justify-center">
                        {!date ? (
                          <div className="w-full flex flex-col items-center justify-center text-stone-500 text-center py-4">
                            <Calendar className="text-[#0D261C]/40 w-8 h-8 mb-2" />
                            <p className="text-xs font-serif font-semibold leading-relaxed max-w-[200px] text-[#0D261C]/80">
                              📅 Selecciona una fecha arriba para ver los horarios.
                            </p>
                          </div>
                        ) : isCheckingAvailability ? (
                          <div className="w-full flex flex-col items-center justify-center gap-2 text-stone-500 py-4">
                            <Loader2 size={20} className="animate-spin text-[#0D261C]/60" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#0D261C]/80">Buscando mesas...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full">
                            {activeSlots.map((slot) => {
                              const status = getSlotStatus(slot)
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={status === "full"}
                                  onClick={() => selectTime(slot)}
                                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${
                                    status === "full"
                                      ? "bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed line-through"
                                      : time === slot
                                        ? "bg-[#0D261C] border-[#0D261C] text-white font-bold scale-[1.02] shadow-md shadow-[#0D261C]/15"
                                        : "bg-white border-[#E9E4DC] text-[#0D261C] hover:border-[#0D261C] hover:bg-stone-50/50"
                                  }`}
                                >
                                  <span className="font-serif text-sm font-semibold">
                                    {formatFriendlyTime(slot).replace(" AM", "").replace(" PM", "")}
                                  </span>
                                  
                                  {/* Availability indicator micro-dots */}
                                  {status === "available" && (
                                    <span className="text-[9px] text-emerald-800 font-bold mt-0.5 flex items-center gap-0.5">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" /> Disponible
                                    </span>
                                  )}
                                  {status === "few" && (
                                    <span className="text-[9px] text-amber-800 font-bold mt-0.5 flex items-center gap-0.5">
                                      <span className="w-1 h-1 rounded-full bg-amber-500" /> Pocas
                                    </span>
                                  )}
                                  {status === "full" && (
                                    <span className="text-[9px] text-stone-400 font-medium mt-0.5">
                                      Lleno
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {date && !isCheckingAvailability && (
                        <div className="flex justify-between items-center mt-2.5 px-1 text-xs">
                          <span className="text-stone-500 font-semibold">
                            * Máx. 3 mesas por horario
                          </span>
                          <span className="text-xs text-[#0D261C] font-bold font-serif">
                            Selección: {time ? formatFriendlyTime(time) : "Ninguno"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step 1 Navigation Button */}
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (isStep1Valid) setStep(2)
                        }}
                        disabled={!isStep1Valid}
                        className="w-full py-3 rounded-xl bg-[#0D261C] hover:bg-[#153a2b] text-white font-sans text-sm font-bold tracking-wider transition-all duration-300 disabled:bg-stone-100 disabled:text-stone-500 disabled:border disabled:border-stone-200 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-[#0D261C]/10 active:scale-[0.99]"
                      >
                        Siguiente paso <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0D261C] mb-1">
                        Tu nombre completo *
                      </label>
                      <div className="relative">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Ej. Sofía Rodríguez"
                          className={inputCls}
                        />
                        <User className="absolute left-3 top-3 text-[#0D261C]/50 w-4 h-4" />
                      </div>
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#0D261C] mb-1">
                          Teléfono celular *
                        </label>
                        <div className="relative">
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            inputMode="tel"
                            placeholder="55 1234 5678"
                            className={inputCls}
                          />
                          <Phone className="absolute left-3 top-3 text-[#0D261C]/50 w-4 h-4" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#0D261C] mb-1">
                          Correo electrónico (opcional)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className={inputCls}
                          />
                          <Mail className="absolute left-3 top-3 text-[#0D261C]/50 w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0D261C] mb-1">
                        Notas especiales (opcional)
                      </label>
                      <div className="relative">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ej. Mesa en terraza, aniversario de bodas, alergias alimentarias..."
                          className={inputCls + " resize-none h-20 pl-10 pt-3"}
                        />
                        <MessageSquare className="absolute left-3 top-3 text-[#0D261C]/50 w-4 h-4" />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-3 rounded-xl border border-[#E9E4DC] bg-white text-[#0D261C] hover:bg-stone-50 hover:text-[#0D261C] transition-all font-sans font-bold text-xs tracking-wider"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !name.trim() || !phone.trim()}
                        className="col-span-2 py-3 rounded-xl bg-[#0D261C] hover:bg-[#153a2b] text-white font-sans text-sm font-bold tracking-wider transition-all duration-300 disabled:bg-stone-100 disabled:text-stone-500 disabled:border disabled:border-stone-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#0D261C]/10 active:scale-[0.99]"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Confirmando...</span>
                          </>
                        ) : (
                          <>
                            <CalendarCheck size={16} />
                            <span>Solicitar Reserva</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Footer message */}
          <div className="text-xs text-stone-500 text-center border-t border-[#E9E4DC] pt-3.5 mt-5 uppercase tracking-wider font-bold">
            Sujeto a confirmación por el personal. Recibirás un mensaje de WhatsApp.
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-[#0D261C] placeholder-stone-400 focus:border-[#0D261C] focus:ring-1 focus:ring-[#0D261C] outline-none transition-all duration-300 text-sm shadow-sm"
