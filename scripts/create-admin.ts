/**
 * ============================================================================
 *  Bootstrap del PRIMER usuario administrador.
 *  Crea (o reutiliza) un usuario en Supabase Auth y le asigna el rol 'admin'.
 *
 *  Requiere en .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL
 *    SUPABASE_SERVICE_ROLE_KEY   (secreta, del dashboard)
 *
 *  Uso:
 *    ADMIN_EMAIL=correo@ejemplo.com ADMIN_PASSWORD=unaClaveSegura \
 *      npx tsx scripts/create-admin.ts
 *
 *  (o pásalos como argumentos:  npx tsx scripts/create-admin.ts correo@x.com claveSegura)
 * ============================================================================
 */
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Carga .env.local
config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const email = process.env.ADMIN_EMAIL ?? process.argv[2]
const password = process.env.ADMIN_PASSWORD ?? process.argv[3]
const fullName = process.env.ADMIN_NAME ?? "Administrador"

function fail(msg: string): never {
  console.error("\n❌ " + msg + "\n")
  process.exit(1)
}

if (!url) fail("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local")
if (!serviceKey || serviceKey === "PENDIENTE_PEGAR_DESDE_DASHBOARD")
  fail(
    "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.\n" +
      "   Pégala desde: Supabase Dashboard → Project Settings → API → service_role",
  )
if (!email || !password)
  fail(
    "Faltan credenciales del admin.\n" +
      "   Uso: ADMIN_EMAIL=correo@x.com ADMIN_PASSWORD=clave npx tsx scripts/create-admin.ts",
  )

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`\n🔧 Creando/actualizando admin: ${email}\n`)

  // 1) Crear el usuario (o localizarlo si ya existe).
  let userId: string | null = null

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError) {
    // Si ya existe, lo buscamos en la lista de usuarios.
    if (createError.message.toLowerCase().includes("already")) {
      console.log("ℹ️  El usuario ya existía; lo reutilizo.")
      const { data: list } = await supabase.auth.admin.listUsers()
      userId = list.users.find((u) => u.email === email)?.id ?? null
    } else {
      fail("Error al crear el usuario: " + createError.message)
    }
  } else {
    userId = created.user?.id ?? null
    console.log("✅ Usuario creado en Auth.")
  }

  if (!userId) fail("No se pudo obtener el id del usuario.")

  // 2) Asegurar el profile (el trigger handle_new_user ya debería haberlo creado).
  await supabase
    .from("profiles")
    .upsert({ id: userId, email, full_name: fullName }, { onConflict: "id" })

  // 3) Buscar el id del rol 'admin'.
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("key", "admin")
    .single()

  if (roleError || !role) fail("No se encontró el rol 'admin' (¿corriste la semilla?).")

  // 4) Asignar el rol admin (idempotente).
  const { error: urError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_id: role.id }, { onConflict: "user_id,role_id" })

  if (urError) fail("Error al asignar el rol admin: " + urError.message)

  console.log("✅ Rol 'admin' asignado.")
  console.log(`\n🎉 Listo. Ya puedes entrar en /login con:\n   ${email}\n`)
}

main().catch((e) => fail(String(e)))
