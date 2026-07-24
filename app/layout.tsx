import React from "react"
import type { Metadata } from 'next'
import { Geist, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import JsonLd from '@/components/seo/JsonLd'
import { ROOT_METADATA } from '@/lib/seo/metadata'
import { BUSINESS, LOCAL_KEYWORDS } from '@/lib/seo/business'
import { buildGraph, restaurantSchema, organizationAndWebsiteSchema } from '@/lib/seo/schema'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const _montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-montserrat" });

// Datos estructurados globales del negocio (LocalBusiness + Restaurant +
// Organization + WebSite). Aplican a todo el sitio para el SEO local.
const GLOBAL_JSONLD = buildGraph([
  restaurantSchema(),
  ...organizationAndWebsiteSchema(),
])

export const metadata: Metadata = {
  ...ROOT_METADATA,
  title: {
    default: 'Maria Bela | Restaurante en Coacalco — Comida Mexicana e Italiana',
    template: '%s | Maria Bela — Restaurante en Coacalco',
  },
  description:
    'Restaurante en Coacalco donde México se encuentra con Italia. Desayunos, comida mexicana, pastas, pizzas al horno, cortes selectos y cafetería. Ambiente familiar en el centro de Coacalco de Berriozábal. Abierto todos los días desde las 8:00 AM.',
  keywords: LOCAL_KEYWORDS,
  generator: 'Next.js',
  manifest: '/site.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: '/',
    siteName: `${BUSINESS.name} · Restaurante en Coacalco`,
    title: 'Maria Bela | Restaurante en Coacalco — Comida Mexicana e Italiana',
    description:
      'Desayunos, comida italiana y mexicana, pizzas y pastas en el centro de Coacalco. Restaurante familiar, abierto todos los días desde las 8:00 AM.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Maria Bela — Restaurante en Coacalco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maria Bela | Restaurante en Coacalco',
    description: 'Comida mexicana e italiana, desayunos, pizzas y pastas en el centro de Coacalco.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
      <head>
        {/* Preconnect a orígenes críticos para mejorar LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Datos estructurados globales del negocio (SEO local) */}
        <JsonLd data={GLOBAL_JSONLD} />
      </head>
      <body className={`${_geist.variable} ${_montserrat.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
