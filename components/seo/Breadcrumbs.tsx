// ============================================================================
//  <Breadcrumbs> — Migas de pan visibles + accesibles.
//  El BreadcrumbList de Schema.org va aparte (lib/seo/schema.ts) para el
//  rich result; esto es la versión visual para el usuario y el interlinking.
// ============================================================================
import React from "react"
import Link from "next/link"

export interface Crumb {
  name: string
  path: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm text-[#7c8b7f]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-[#0D261C] font-medium">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-[#0D261C] transition-colors">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-[#c2cabb]">
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
