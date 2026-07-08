"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Users,
  Clock,
  MessageCircle,
  RefreshCw,
  Utensils,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  listReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  buildReservationWhatsappUrl,
  RESERVATION_STATUS_LABELS,
  type ReservationView,
  type ReservationStatus,
} from "@/lib/services/reservations"

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "bg-stone-100 text-stone-600",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-500",
  attended: "bg-blue-50 text-blue-700",
  no_show: "bg-amber-50 text-amber-700",
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ReservacionesPanel() {
  const supabase = useMemo(() => createClient(), [])
  const [cursor, setCursor] = useState(() => new Date())
  const [reservations, setReservations] = useState<ReservationView[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(() => dayKey(new Date()))
  const [showEditor, setShowEditor] = useState(false)

  // Rango del mes visible.
  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  )
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59),
    [cursor],
  )

  const load = useCallback(async () => {
    try {
      const data = await listReservations(supabase, {
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
      })
      setReservations(data)
    } catch (e) {
      console.error("Error al cargar reservaciones:", e)
    } finally {
      setLoading(false)
    }
  }, [supabase, monthStart, monthEnd])

  useEffect(() => {
    setLoading(true)
    load()
    const channel = supabase
      .channel("reservaciones")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, supabase])

  // Agrupar reservaciones por día.
  const byDay = useMemo(() => {
    const map = new Map<string, ReservationView[]>()
    for (const r of reservations) {
      const key = dayKey(new Date(r.reserved_for))
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return map
  }, [reservations])

  // Celdas del calendario (incluye días vacíos al inicio para alinear).
  const cells = useMemo(() => {
    const firstWeekday = monthStart.getDay()
    const daysInMonth = monthEnd.getDate()
    const result: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    }
    return result
  }, [monthStart, monthEnd, cursor])

  const todayKey = dayKey(new Date())
  const dayReservations = selectedDay ? byDay.get(selectedDay) ?? [] : []

  const changeStatus = async (r: ReservationView, status: ReservationStatus) => {
    setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)))
    try {
      await updateReservationStatus(supabase, r.id, status)
    } catch (e) {
      console.error(e)
      load()
    }
  }

  const remove = async (r: ReservationView) => {
    if (!confirm(`¿Eliminar la reservación de ${r.customer_name}?`)) return
    try {
      await deleteReservation(supabase, r.id)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-20 bg-[#0D261C] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold leading-none">Reservaciones</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">Maria Bela</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <LayoutDashboard size={15} /> <span className="hidden sm:inline">Panel</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <Utensils size={15} /> <span className="hidden sm:inline">Menú</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-4">
        <button
          onClick={() => setShowEditor(true)}
          className="w-full py-3.5 rounded-2xl bg-[#0D261C] text-white font-bold hover:bg-[#153a2b] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Nueva reservación
        </button>

        {/* Calendario */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-2 hover:bg-stone-100 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-serif font-bold text-[#0D261C]">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-2 hover:bg-stone-100 rounded-lg">
              <ChevronRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin text-stone-400" size={22} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[10px] font-bold text-stone-400 uppercase py-1">
                  {w}
                </div>
              ))}
              {cells.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />
                const key = dayKey(date)
                const count = byDay.get(key)?.length ?? 0
                const isToday = key === todayKey
                const isSelected = key === selectedDay
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(key)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors relative ${
                      isSelected
                        ? "bg-[#0D261C] text-white"
                        : isToday
                          ? "bg-[#D4AF37]/15 text-[#0D261C] font-bold"
                          : "hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    {date.getDate()}
                    {count > 0 && (
                      <span
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-[#D4AF37]" : "bg-[#991B1B]"
                        }`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Reservaciones del día seleccionado */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
          <h3 className="font-bold text-[#0D261C] mb-3 flex items-center gap-2">
            <CalendarDays size={16} className="text-[#D4AF37]" />
            {selectedDay
              ? new Date(selectedDay + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Selecciona un día"}
          </h3>

          {dayReservations.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">No hay reservaciones este día.</p>
          ) : (
            <div className="space-y-2">
              {dayReservations
                .sort((a, b) => a.reserved_for.localeCompare(b.reserved_for))
                .map((r) => {
                  const time = new Date(r.reserved_for).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  const waConfirm = buildReservationWhatsappUrl(r, "confirm")
                  return (
                    <div key={r.id} className="border border-stone-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-[#0D261C]">{r.customer_name}</p>
                          <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={11} /> {r.party_size}
                            </span>
                            {r.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={11} /> {r.phone}
                              </span>
                            )}
                          </div>
                          {r.notes && <p className="text-xs text-stone-500 mt-1">📝 {r.notes}</p>}
                          {r.deposit_amount > 0 && (
                            <p className="text-xs text-emerald-600 mt-1">Anticipo: ${r.deposit_amount}</p>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[r.status]}`}>
                          {RESERVATION_STATUS_LABELS[r.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(["confirmed", "attended", "no_show", "cancelled"] as ReservationStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => changeStatus(r, s)}
                            disabled={r.status === s}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                              r.status === s
                                ? "bg-[#0D261C] text-white cursor-default"
                                : "bg-stone-50 border border-stone-200 text-stone-500 hover:border-[#D4AF37]"
                            }`}
                          >
                            {RESERVATION_STATUS_LABELS[s]}
                          </button>
                        ))}
                        {waConfirm && (
                          <a
                            href={waConfirm}
                            target="_blank"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => remove(r)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors ml-auto"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </main>

      {showEditor && (
        <ReservationEditor
          defaultDay={selectedDay}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function ReservationEditor({
  defaultDay,
  onClose,
  onSaved,
}: {
  defaultDay: string | null
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [partySize, setPartySize] = useState("2")
  const [date, setDate] = useState(defaultDay ?? dayKey(new Date()))
  const [time, setTime] = useState("14:00")
  const [deposit, setDeposit] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Escribe el nombre del cliente.")
      return
    }
    const reservedFor = new Date(`${date}T${time}:00`).toISOString()
    setSaving(true)
    try {
      await createReservation(supabase, {
        customerName: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        partySize: Number(partySize) || 1,
        reservedFor,
        depositAmount: Number(deposit) || 0,
        notes: notes.trim() || undefined,
      })
      onSaved()
    } catch (e) {
      console.error(e)
      alert("No se pudo guardar la reservación.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D261C] text-white px-6 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <h2 className="font-serif text-xl font-bold">Nueva reservación</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Nombre del cliente</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ana López"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Teléfono</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="55 1234 5678"
                inputMode="tel"
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Personas</label>
              <input
                value={partySize}
                onChange={(e) => setPartySize(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Correo <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              inputMode="email"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Anticipo <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-bold text-[#0D261C] mb-1.5">
              Notas <span className="font-normal text-stone-400 normal-case">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: mesa cerca de la ventana, cumpleaños..."
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-[#D4AF37] outline-none resize-none h-20"
            />
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-5 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-3 rounded-xl bg-[#0D261C] text-white font-bold text-sm hover:bg-[#153a2b] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar reservación"}
          </button>
        </div>
      </div>
    </div>
  )
}
