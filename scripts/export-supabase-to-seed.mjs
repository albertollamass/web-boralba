// Exporta los datos de Supabase (tablas public.*) a firestore.seed.json
// con el formato plano que usa Firestore en esta app.
//
// Uso:
//   node scripts/export-supabase-to-seed.mjs
//
// Lee la conexión Supabase de `.env` (VITE_SUPABASE_URL + KEY).
// No necesita dependencias: usa fetch nativo de Node 20+.
//
// Mapeo aplicado (desenvuelve la columna `data` jsonb):
//   products(id, data)      -> products/{id}            = { ...data, id }
//   categories(id, data)    -> categories/{id}          = { ...data, slug: id }
//   site_settings(id, data) -> site_settings/{id}       = { ...data }
//   profiles(id, role)      -> admins/{id}              = { role }  (luego crearás el usuario en Firebase Auth con el mismo email)
//   logs                    -> NO se migran (histórico de errores; se regeneran solos)
import { writeFileSync, readFileSync, existsSync } from 'node:fs'

function loadEnv(path = '.env') {
  const env = {}
  if (!existsSync(path)) return env
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv()
const URL = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY

if (!URL || !KEY) {
  console.error('Falta VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY en .env')
  process.exit(1)
}

async function fetchAll(table, order = null) {
  const rows = []
  const PAGE = 1000
  for (let offset = 0; ; offset += PAGE) {
    const params = new URLSearchParams({ select: '*', offset: String(offset), limit: String(PAGE) })
    if (order) params.set('order', order)
    const res = await fetch(`${URL}/rest/v1/${table}?${params}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    })
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < PAGE) return rows
  }
}

const seed = { products: {}, categories: {}, site_settings: {}, admins: {} }
const warnings = []

for (const row of await fetchAll('products', 'created_at.desc')) {
  const doc = { ...(row.data || {}), id: row.id }
  const size = JSON.stringify(doc).length
  if (size > 800_000) warnings.push(`products/${row.id}: ~${(size / 1024).toFixed(0)} KB (límite Firestore 1 MiB; mueve imágenes a Storage)`)
  seed.products[row.id] = doc
}
for (const row of await fetchAll('categories', 'created_at.asc')) {
  seed.categories[row.id] = { ...(row.data || {}), slug: row.id }
}
for (const row of await fetchAll('site_settings')) {
  seed.site_settings[row.id] = row.data || {}
}
try {
  for (const row of await fetchAll('profiles')) {
    seed.admins[row.id] = { role: row.role, migratedFromSupabaseUuid: row.id }
  }
} catch (e) {
  console.warn('No se pudieron leer profiles (normal sin service_role):', e.message)
}

writeFileSync('firestore.seed.json', JSON.stringify(seed, null, 2))
console.log(
  `OK -> firestore.seed.json (${Object.keys(seed.products).length} productos, ` +
  `${Object.keys(seed.categories).length} categorías, ` +
  `${Object.keys(seed.site_settings).length} settings, ` +
  `${Object.keys(seed.admins).length} admins)`,
)
for (const w of warnings) console.warn('AVISO:', w)
if (warnings.length) {
  console.warn('\nHay documentos cerca del límite de 1 MiB (normalmente imágenes base64).')
  console.warn('Sube esas imágenes a Firebase Storage y deja en Firestore solo la URL.')
}
