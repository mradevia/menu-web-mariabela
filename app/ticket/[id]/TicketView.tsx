"use client"

import { useEffect, useMemo, useState } from "react"
import { Printer, ArrowLeft, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getOrderById, type OrderView } from "@/lib/services/orders"
import { fetchSettings } from "@/lib/services/menu"
import type { SiteSettings } from "@/lib/site-data"

const TYPE_LABELS: Record<string, string> = {
  dine_in: "En mesa",
  takeaway: "Para llevar",
  pickup: "Recoger",
  delivery: "Delivery",
}
const PAY_LABELS: Record<string, string> = {
  unpaid: "Pendiente",
  partial: "Pago parcial",
  paid: "Pagado",
  refunded: "Reembolsado",
}

export default function TicketView({ orderId }: { orderId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [order, setOrder] = useState<OrderView | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOrderById(supabase, orderId), fetchSettings(supabase)])
      .then(([o, s]) => {
        setOrder(o)
        setSettings(s)
      })
      .catch((e) => console.error("Error al cargar el ticket:", e))
      .finally(() => setLoading(false))
  }, [supabase, orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <RefreshCw className="animate-spin text-stone-400" size={26} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-stone-500">No se encontró el pedido.</p>
        <a href="/pedidos" className="text-[#0D261C] font-bold underline">Volver a pedidos</a>
      </div>
    )
  }

  const date = new Date(order.created_at)
  const label =
    order.table?.number != null ? `Mesa ${order.table.number}` : order.customer?.full_name ?? "Mostrador"

  return (
    <div className="min-h-screen bg-stone-200 py-6 px-4">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print max-w-sm mx-auto mb-4 flex items-center justify-between">
        <a href="/pedidos" className="flex items-center gap-1.5 text-stone-600 hover:text-[#0D261C] text-sm font-bold">
          <ArrowLeft size={16} /> Volver
        </a>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#0D261C] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#153a2b] transition-colors"
        >
          <Printer size={16} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Ticket (formato térmico ~80mm) */}
      <div id="ticket" className="ticket bg-white mx-auto p-5 shadow-lg" style={{ width: "80mm", maxWidth: "100%" }}>
        <div className="text-center border-b border-dashed border-stone-300 pb-3 mb-3">
          <h1 className="font-serif text-xl font-bold text-[#0D261C]">Maria Bela</h1>
          <p className="text-[10px] text-stone-500 leading-tight">México &amp; Italia · Restaurante</p>
          {settings?.addressLine1 && <p className="text-[10px] text-stone-500 leading-tight mt-1">{settings.addressLine1}</p>}
          {settings?.addressLine2 && <p className="text-[10px] text-stone-500 leading-tight">{settings.addressLine2}</p>}
          {settings?.phoneDisplay && <p className="text-[10px] text-stone-500 leading-tight">Tel: {settings.phoneDisplay}</p>}
        </div>

        <div className="text-[11px] text-stone-700 space-y-0.5 mb-3">
          <div className="flex justify-between"><span className="font-bold">Pedido</span><span>#{order.order_number}</span></div>
          <div className="flex justify-between"><span className="font-bold">Fecha</span><span>{date.toLocaleDateString("es-MX")} {date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div className="flex justify-between"><span className="font-bold">Tipo</span><span>{TYPE_LABELS[order.type] ?? order.type}</span></div>
          <div className="flex justify-between"><span className="font-bold">Cliente</span><span>{label}</span></div>
        </div>

        <table className="w-full text-[11px] mb-3">
          <thead>
            <tr className="border-b border-stone-300 text-stone-500">
              <th className="text-left py-1 font-bold">Cant</th>
              <th className="text-left py-1 font-bold">Producto</th>
              <th className="text-right py-1 font-bold">Importe</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="py-1">{item.quantity}</td>
                <td className="py-1">
                  {item.product_name}
                  {item.notes && <span className="block text-[9px] text-stone-400">“{item.notes}”</span>}
                </td>
                <td className="py-1 text-right">${item.line_total.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-stone-300 pt-2 text-[11px] space-y-0.5">
          <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>${order.subtotal.toFixed(0)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-stone-600"><span>Descuento</span><span>-${order.discount.toFixed(0)}</span></div>
          )}
          <div className="flex justify-between font-bold text-[#0D261C] text-base pt-1">
            <span>TOTAL</span><span>${order.total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-stone-600 pt-1"><span>Estado de pago</span><span>{PAY_LABELS[order.payment_status] ?? order.payment_status}</span></div>
        </div>

        {order.notes && (
          <div className="border-t border-dashed border-stone-300 mt-2 pt-2 text-[10px] text-stone-500">
            <p className="font-bold">Notas:</p>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="text-center border-t border-dashed border-stone-300 mt-3 pt-3">
          <p className="text-[11px] font-bold text-[#0D261C]">¡Gracias por su preferencia!</p>
          <p className="text-[9px] text-stone-400 mt-1">Este comprobante no es una factura fiscal.</p>
        </div>
      </div>

      {/* CSS de impresión: al imprimir, solo el ticket, ancho térmico */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #ticket { box-shadow: none !important; margin: 0 !important; padding: 4mm !important; width: 80mm !important; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
    </div>
  )
}
