// ============================================================================
//  <SmartImage> — Imagen optimizada con placeholder difuminado instantáneo.
//  --------------------------------------------------------------------------
//  Envuelve next/image y añade automáticamente el blur (LQIP) buscándolo por
//  ruta en el manifiesto generado (lib/seo/image-blur.ts). Resultado:
//   - El usuario ve un difuminado al INSTANTE (aunque tenga internet lento).
//   - next/image sirve la imagen real en AVIF/WebP, responsive (srcset) y en
//     alta calidad, sólo con el tamaño que necesita el dispositivo.
//   - Sin salto de layout (CLS) porque se usa `fill` dentro de un contenedor
//     con tamaño definido por el padre.
//
//  Uso típico (contenedor relativo con altura fija, como las tarjetas):
//    <div className="relative h-48">
//      <SmartImage src={item.image} alt={item.name} fill sizes="(max-width:768px) 100vw, 350px" />
//    </div>
// ============================================================================
"use client"

import React from "react"
import Image, { type ImageProps } from "next/image"
import { IMAGE_BLUR } from "@/lib/seo/image-blur"

type SmartImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  /** Calidad de la imagen servida (por defecto 80: equilibrio nítido). */
  quality?: number
}

export default function SmartImage({
  src,
  alt,
  quality = 80,
  sizes,
  ...rest
}: SmartImageProps) {
  // Buscar el blur por ruta. Las rutas del manifiesto tienen espacios sin
  // codificar (ej: "/IMAGENES COMIDA/waffles.webp"), igual que en la DB.
  const key = typeof src === "string" ? src : ""
  const blur = IMAGE_BLUR[key]

  return (
    <Image
      src={src}
      alt={alt}
      quality={quality}
      // Si no hay sizes explícito y es `fill`, un valor razonable por defecto.
      sizes={sizes ?? (rest.fill ? "(max-width: 768px) 100vw, 400px" : undefined)}
      {...(blur
        ? { placeholder: "blur" as const, blurDataURL: blur }
        : {})}
      {...rest}
    />
  )
}
