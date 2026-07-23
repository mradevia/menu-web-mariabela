// ============================================================================
//  DATOS SEO / NAP DEL NEGOCIO — Maria Bela (Coacalco)
//  --------------------------------------------------------------------------
//  FUENTE ÚNICA DE VERDAD para SEO local. Todo el Schema.org, la metadata,
//  el sitemap y el pie de página deben leer de aquí para que el NAP (Name,
//  Address, Phone) sea IDÉNTICO en todo el sitio — Google exige consistencia
//  exacta entre la web y el Perfil de Empresa (Google Business Profile).
//
//  ⚠️  DATOS QUE DEBES VERIFICAR/AJUSTAR MANUALMENTE:
//   - GEO.latitude / GEO.longitude → cópialas EXACTAS desde tu ficha de Google
//     Maps (clic derecho sobre el pin → primer número = lat, segundo = lng).
//     Las actuales son aproximadas al centro de Coacalco (Palacio Municipal).
//   - GOOGLE_MAPS_URL / GOOGLE_MAPS_PLACE_URL → pega el enlace real de tu ficha.
//   - SAME_AS → añade tus redes reales (Instagram, Facebook, TikTok, etc.).
//   - RATING → NO se usa hasta que tengas reseñas reales verificables (Google
//     penaliza AggregateRating inventado). Déjalo en null hasta entonces.
// ============================================================================

/** URL canónica del sitio (sin barra final). Configurable por env en Vercel. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.mariabela.com.mx"
).replace(/\/$/, "")

export const BUSINESS = {
  /** Nombre exacto tal como aparece en Google Business Profile. */
  name: "Maria Bela",
  legalName: "Maria Bela Restaurante",
  /** Descripción corta orientada a búsqueda local. */
  slogan: "México & Italia · Restaurante en Coacalco",
  description:
    "Restaurante en Coacalco donde el corazón de México se encuentra con el alma de Italia. Desayunos, comida mexicana, pastas artesanales, pizzas al horno, cortes selectos y cafetería. Ambiente familiar en el centro de Coacalco de Berriozábal.",

  // --- Teléfono (NAP) ---
  phoneDisplay: "55 2883 8362",
  /** Formato internacional E.164 para tel: y Schema. */
  phoneE164: "+525528838362",
  /** WhatsApp: solo dígitos, con código país. */
  whatsapp: "525528838362",

  // --- Dirección (NAP) ---
  address: {
    streetAddress: "And. Severiano Reyes 27A",
    /** Referencia útil para el usuario (dentro del Palacio Municipal). */
    landmark: "Palacio Municipal de Coacalco",
    locality: "Coacalco de Berriozábal",
    region: "Estado de México",
    /** Código de región ISO para Schema. */
    regionCode: "MX-MEX",
    postalCode: "55700",
    country: "México",
    countryCode: "MX",
  },

  // --- Coordenadas (VERIFICAR con tu ficha real de Google Maps) ---
  geo: {
    latitude: 19.631600,
    longitude: -99.108500,
  },

  // --- Horario real ---
  //  Dom–Jue: 08:00–17:00 · Vie–Sáb: 08:00–22:00
  hours: [
    { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "08:00", closes: "17:00" },
    { days: ["Friday", "Saturday"], opens: "08:00", closes: "22:00" },
  ] as const,
  /** Textos legibles para la UI. */
  hoursHuman: {
    weekdays: "Domingo a Jueves · 8:00 AM – 5:00 PM",
    weekend: "Viernes y Sábado · 8:00 AM – 10:00 PM",
    short: "DOM-JUE 8:00–17:00 · VIE-SÁB 8:00–22:00",
  },

  // --- Enlaces ---
  //  ⚠️ Reemplaza por el enlace directo a tu ficha de Google Maps cuando lo tengas.
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Maria+Bela+Coacalco+Severiano+Reyes",
  /** URL de "Cómo llegar". */
  googleMapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=And.+Severiano+Reyes+27A,+Coacalco+de+Berriozábal,+55700",

  // --- Redes sociales (para sameAs de Schema). Ajusta a las reales. ---
  sameAs: [
    "https://www.instagram.com/mariabelacoacalco",
    "https://www.facebook.com/mariabelacoacalco",
  ],

  // --- Reseñas: null hasta tener datos reales verificables. NO inventar. ---
  rating: null as null | { value: number; count: number },

  // --- Rango de precios (Schema priceRange) ---
  priceRange: "$$",
  currency: "MXN",

  // --- Tipos de cocina servida (para keywords y Schema servesCuisine) ---
  cuisines: ["Mexicana", "Italiana", "Desayunos", "Cafetería"],
} as const

/** Dirección en una línea legible. */
export const ADDRESS_ONE_LINE = `${BUSINESS.address.streetAddress}, ${BUSINESS.address.locality}, ${BUSINESS.address.postalCode}, ${BUSINESS.address.region}`

/**
 * Palabras clave locales objetivo. Se usan con moderación en metadata; el peso
 * real del SEO recae en el contenido y el Schema, no en la meta keywords.
 */
export const LOCAL_KEYWORDS = [
  "restaurante en Coacalco",
  "restaurantes en Coacalco",
  "comida Coacalco",
  "comida italiana Coacalco",
  "restaurante italiano Coacalco",
  "comida mexicana Coacalco",
  "desayunos Coacalco",
  "desayuno en Coacalco",
  "brunch Coacalco",
  "comida corrida Coacalco",
  "cafetería Coacalco",
  "pasta Coacalco",
  "pizza Coacalco",
  "restaurante familiar Coacalco",
  "dónde comer en Coacalco",
  "mejor restaurante en Coacalco",
  "Mariabela",
  "Maria Bela",
  "María Bela",
  "Mariabela Restaurante",
]
