// Importa firestore.seed.json a Firestore usando el Admin SDK (bypassa las rules).
//
// Uso:
//   1. Firebase Console > Project settings > Service accounts > Generate new private key
//      y guárdalo como `serviceAccount.json` en la raíz (NO lo subas a git).
//   2. npm i -D firebase-admin  (solo para la migración)
//   3. node scripts/import-seed-to-firestore.mjs [serviceAccount.json]
//
// Escribe con batch de 400 docs: products, categories, site_settings y admins.
import { readFileSync, existsSync } from 'node:fs'

const keyPath = process.argv[2] || 'serviceAccount.json'
if (!existsSync('firestore.seed.json')) {
  console.error('No existe firestore.seed.json. Ejecuta antes: node scripts/export-supabase-to-seed.mjs')
  process.exit(1)
}
if (!existsSync(keyPath)) {
  console.error(`No existe ${keyPath}. Descárgalo de Firebase Console > Project settings > Service accounts.`)
  process.exit(1)
}

const { initializeApp, cert } = await import('firebase-admin/app')
const { getFirestore, FieldValue } = await import('firebase-admin/firestore')
const seed = JSON.parse(readFileSync('firestore.seed.json', 'utf8'))

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
const db = getFirestore()

let batch = db.batch()
let ops = 0
let total = 0
async function flush() {
  if (ops === 0) return
  await batch.commit()
  batch = db.batch()
  ops = 0
}
async function put(collection, id, data) {
  // Firestore no acepta `undefined`; lo saneamos.
  const clean = JSON.parse(JSON.stringify(data ?? {}, (_, v) => (v === undefined ? null : v)))
  batch.set(db.collection(collection).doc(String(id)), { ...clean, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  ops += 1
  total += 1
  if (ops >= 400) await flush()
}

for (const [id, data] of Object.entries(seed.products || {})) await put('products', id, data)
for (const [id, data] of Object.entries(seed.categories || {})) await put('categories', id, data)
for (const [id, data] of Object.entries(seed.site_settings || {})) await put('site_settings', id, data)
for (const [id, data] of Object.entries(seed.admins || {})) await put('admins', id, data)
await flush()

console.log(`OK: ${total} documentos importados a Firestore.`)
console.log('Recuerda: crea el usuario admin en Authentication con el MISMO email,');
console.log('y apunta su UID en admins/{uid} con { role: "admin" } (o asigna el custom claim admin:true).')
