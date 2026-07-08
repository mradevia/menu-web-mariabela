// ============================================================================
//  Servicio de STORAGE — subida de imágenes de platillos al bucket público
//  'dish-images'. Requiere sesión admin/gerente (lo exige la política RLS del
//  bucket). Devuelve la URL pública para guardar en products.image_url.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type Client = SupabaseClient<Database>

const BUCKET = "dish-images"

/**
 * Sube un Blob (imagen ya comprimida) al bucket y devuelve su URL pública.
 * El nombre del archivo se genera único para evitar colisiones y cachés viejos.
 */
export async function uploadDishImage(
  supabase: Client,
  blob: Blob,
  ext = "jpg",
): Promise<string> {
  const fileName = `products/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, blob, {
    contentType: blob.type || "image/jpeg",
    cacheControl: "31536000", // 1 año: las imágenes son inmutables (nombre único)
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

/**
 * Borra una imagen del bucket a partir de su URL pública. Best-effort: si la
 * URL no pertenece a este bucket (p. ej. una de Unsplash), no hace nada.
 */
export async function deleteDishImage(supabase: Client, publicUrl: string): Promise<void> {
  const marker = `/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return // no es una imagen de nuestro bucket
  const path = publicUrl.slice(idx + marker.length)
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}
