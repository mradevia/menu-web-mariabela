// ============================================================================
//  Imagen Open Graph / Twitter dinámica — Maria Bela (1200×630)
//  Se genera en el edge con ImageResponse. Es lo que se ve al compartir el
//  sitio en WhatsApp, Facebook, X, etc. y también un rich result de Google.
// ============================================================================
import { ImageResponse } from "next/og"
import { BUSINESS } from "@/lib/seo/business"

export const alt = "Maria Bela — Restaurante de comida mexicana e italiana en Coacalco"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f2a1d 0%, #14532d 45%, #7c2d12 100%)",
          color: "#fdf6e3",
          fontFamily: "serif",
          textAlign: "center",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 8, color: "#e9c46a", textTransform: "uppercase" }}>
          Restaurante en Coacalco
        </div>
        <div style={{ fontSize: 130, fontWeight: 800, marginTop: 10, marginBottom: 6, color: "#fdf6e3" }}>
          {BUSINESS.name}
        </div>
        <div style={{ fontSize: 40, color: "#e9c46a", marginBottom: 28 }}>
          México & Italia
        </div>
        <div style={{ fontSize: 30, color: "#f0e6d2", maxWidth: 900 }}>
          Desayunos · Comida Mexicana · Pastas · Pizzas · Cortes · Cafetería
        </div>
        <div style={{ fontSize: 24, color: "#cdbfa0", marginTop: 34 }}>
          {`${BUSINESS.address.locality}, ${BUSINESS.address.region} · Abierto desde las 8:00 AM`}
        </div>
      </div>
    ),
    { ...size },
  )
}
