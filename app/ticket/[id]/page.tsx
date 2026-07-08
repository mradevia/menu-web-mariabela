import TicketView from "./TicketView"

export const metadata = { title: "Comprobante — Maria Bela" }

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TicketView orderId={id} />
}
