// ============================================================================
//  SCHEMA.ORG (JSON-LD) — Maria Bela
//  Genera los datos estructurados que Google usa para el Local Pack, los rich
//  results (horarios, menú, ubicación, FAQ) y la comprensión del negocio.
//  Todo sale de lib/seo/business.ts para mantener el NAP consistente.
// ============================================================================
import { SITE_URL, BUSINESS, ADDRESS_ONE_LINE } from "./business"
import type { MenuData } from "@/lib/site-data"

/** @id estable del negocio, referenciable desde otros nodos del grafo. */
const RESTAURANT_ID = `${SITE_URL}/#restaurant`
const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

/** Dirección postal reutilizable. */
function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.address.streetAddress,
    addressLocality: BUSINESS.address.locality,
    addressRegion: BUSINESS.address.region,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.countryCode,
  }
}

/** Coordenadas geográficas. */
function geoCoordinates() {
  return {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
  }
}

/** Horario de apertura en formato Schema (OpeningHoursSpecification). */
function openingHours() {
  return BUSINESS.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes,
  }))
}

/**
 * Nodo principal Restaurant + LocalBusiness. Es el corazón del SEO local.
 * Se coloca UNA vez, en el layout global, para que aplique a todo el sitio.
 */
export function restaurantSchema() {
  const node: Record<string, unknown> = {
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": RESTAURANT_ID,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.phoneE164,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: BUSINESS.currency,
    paymentAccepted: "Efectivo, Tarjeta de crédito, Tarjeta de débito",
    servesCuisine: BUSINESS.cuisines,
    image: [
      `${SITE_URL}/brand/mariabela-logo-gold.png`,
      `${SITE_URL}/opengraph-image`,
    ],
    logo: `${SITE_URL}/brand/mariabela-logo-gold.png`,
    address: postalAddress(),
    geo: geoCoordinates(),
    hasMap: BUSINESS.googleMapsUrl,
    openingHoursSpecification: openingHours(),
    sameAs: BUSINESS.sameAs,
    areaServed: [
      { "@type": "City", name: "Coacalco de Berriozábal" },
      { "@type": "City", name: "San Francisco Coacalco" },
      { "@type": "City", name: "Villa de las Flores" },
      { "@type": "City", name: "Tultitlán" },
      { "@type": "City", name: "Ecatepec" },
    ],
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: `${SITE_URL}/reservar`,
    keywords:
      "restaurante en Coacalco, comida italiana Coacalco, comida mexicana Coacalco, desayunos Coacalco, pizza Coacalco, pasta Coacalco, cafetería Coacalco, restaurante familiar Coacalco",
  }

  // Solo añade AggregateRating si hay reseñas reales verificables.
  if (BUSINESS.rating && BUSINESS.rating.count > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating.value,
      reviewCount: BUSINESS.rating.count,
    }
  }

  return node
}

/** Organización + WebSite (habilita sitelinks searchbox y marca). */
export function organizationAndWebsiteSchema() {
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: BUSINESS.legalName,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/mariabela-logo-gold.png`,
      },
      sameAs: BUSINESS.sameAs,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS.phoneE164,
        contactType: "reservations",
        areaServed: "MX",
        availableLanguage: ["Spanish"],
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: `${BUSINESS.name} · Restaurante en Coacalco`,
      inLanguage: "es-MX",
      publisher: { "@id": ORG_ID },
    },
  ]
}

/** Breadcrumb para una página. items: [{name, path}]. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === "/" ? "" : it.path}`,
    })),
  }
}

/** FAQPage a partir de una lista de preguntas/respuestas. */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

/**
 * Menú completo del restaurante como Schema Menu → hasMenuSection → hasMenuItem.
 * Recibe el MenuData (mismo que renderiza la web) para no duplicar información.
 */
export function menuSchema(menu: MenuData) {
  return {
    "@type": "Menu",
    "@id": `${SITE_URL}/menu#menu`,
    name: "Menú Maria Bela",
    inLanguage: "es-MX",
    url: `${SITE_URL}/menu`,
    hasMenuSection: Object.values(menu).map((cat) => ({
      "@type": "MenuSection",
      name: cat.title,
      description: cat.subtitle,
      hasMenuItem: cat.items.map((dish) => ({
        "@type": "MenuItem",
        name: dish.name,
        description: dish.ingredients,
        offers: {
          "@type": "Offer",
          price: dish.price,
          priceCurrency: BUSINESS.currency,
        },
      })),
    })),
  }
}

/**
 * Envuelve una lista de nodos en un @graph con @context.
 * Este es el objeto que finalmente se serializa a JSON-LD.
 */
export function buildGraph(nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  }
}

/** Preguntas frecuentes globales sobre el restaurante (para el home/menu). */
export const HOME_FAQS = [
  {
    q: "¿Dónde está ubicado Maria Bela en Coacalco?",
    a: `Maria Bela está en ${ADDRESS_ONE_LINE}, dentro del Palacio Municipal de Coacalco de Berriozábal, Estado de México. Es un restaurante familiar en el centro de Coacalco, fácil de encontrar y con buena ubicación.`,
  },
  {
    q: "¿Cuál es el horario del restaurante Maria Bela?",
    a: `Abrimos de domingo a jueves de 8:00 AM a 5:00 PM, y viernes y sábado de 8:00 AM a 10:00 PM. Servimos desayunos, comida y cena.`,
  },
  {
    q: "¿Qué tipo de comida sirven en Maria Bela?",
    a: "Servimos comida mexicana e italiana: desayunos, chilaquiles, enchiladas, pastas artesanales, pizzas al horno, ensaladas, cortes selectos, cafetería y postres. Un restaurante donde México se encuentra con Italia.",
  },
  {
    q: "¿Maria Bela tiene desayunos en Coacalco?",
    a: "Sí. Somos uno de los mejores lugares para desayunar en Coacalco: huevos al gusto, chilaquiles, molletes, omelettes, waffles, hotcakes, enchiladas y más, desde las 8:00 AM.",
  },
  {
    q: "¿Puedo reservar o pedir a domicilio en Maria Bela?",
    a: "Puedes reservar mesa desde nuestra página de reservaciones y hacer tu pedido por WhatsApp al 55 2883 8362. También puedes visitarnos directamente en el centro de Coacalco.",
  },
  {
    q: "¿Maria Bela es un restaurante familiar?",
    a: "Sí, Maria Bela es un restaurante familiar en Coacalco con ambiente cálido, ideal para desayunar, comer en familia, reuniones y celebraciones. Contamos con menú infantil.",
  },
]
