import QRCode from "qrcode"

// Colores de marca para el QR (verde oscuro Maria Bela sobre blanco).
const QR_DARK = "#0D261C"
const QR_LIGHT = "#FFFFFF"

/**
 * Genera el código QR de una URL como imagen PNG (Data URL), lista para
 * mostrar en <img> o descargar directamente.
 */
export async function generateQrDataUrl(url: string, size = 600): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: QR_DARK, light: QR_LIGHT },
  })
}

/**
 * Descarga el QR (ya generado como Data URL) como archivo PNG.
 */
export function downloadQr(dataUrl: string, filename = "menu-mariabela-qr.png") {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  a.click()
}
