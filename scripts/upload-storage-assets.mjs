// Sube a Firebase Storage los ficheros de `storage-export/` y parchea en
// Firestore cada campo con su download URL (sustituye el placeholder
// `__STORAGE_UPLOAD__:...` que dejó import-db-sql-to-seed.mjs).
//
// Requisitos previos:
//   1. `firestore.seed.json` ya importado (import-seed-to-firestore.mjs).
//   2. `serviceAccount.json` en la raíz (NO commitear).
//   3. npm i -D firebase-admin
//
// Uso:
//   node scripts/upload-storage-assets.mjs [serviceAccount.json] [bucket]
//   node scripts/upload-storage-assets.mjs serviceAccount.json boralba-lighting.appspot.com
import { readFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const keyPath = process.argv[2] || 'serviceAccount.json'
const bucketName = process.argv[3] || process.env.FIREBASE_STORAGE_BUCKET

if (!existsSync('storage-manifest.json')) {
  console.error('No existe storage-manifest.json. Ejecuta antes: node scripts/import-db-sql-to-seed.mjs')
  process.exit(1)
}
if (!existsSync(keyPath)) {
  console.error(`No existe ${keyPath}. Descárgalo de Firebase Console > Project settings > Service accounts.`)
  process.exit(1)
}
if (!bucketName) {
  console.error('Indica el bucket: node scripts/upload-storage-assets.mjs serviceAccount.json TU-PROYECTO.appspot.com')
  process.exit(1)
}

const { initializeApp, cert } = await import('firebase-admin/app')
const { getFirestore } = await import('firebase-admin/firestore')
const { getStorage } = await import('firebase-admin/storage')
initializeApp({
  credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))),
  storageBucket: bucketName,
})
const bucket = getStorage().bucket()
const db = getFirestore()
const manifest = JSON.parse(readFileSync('storage-manifest.json', 'utf8'))

function setTopLevel(data, field, value) {
  const parts = field.replace(/\[(\d+)\]/g, '.$1').split('.')
  let o = data
  for (let i = 0; i < parts.length - 1; i++) {
    if (o[parts[i]] === undefined) o[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {}
    o = o[parts[i]]
  }
  o[parts[parts.length - 1]] = value
  return { [parts[0]]: data[parts[0]] }
}

let done = 0
for (const e of manifest) {
  const local = `storage-export/${e.file}`
  if (!existsSync(local)) {
    console.warn(`Falta ${local}, se omite`)
    continue
  }
  const dest = `boralba/${e.file}`
  const token = randomUUID()
  await bucket.upload(local, {
    destination: dest,
    metadata: { contentType: e.mime, metadata: { firebaseStorageDownloadTokens: token } },
  })
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`

  const ref = db.collection(e.collection).doc(e.id)
  const snap = await ref.get()
  const data = snap.exists ? snap.data() : {}
  await ref.set(setTopLevel(data, e.field, url), { merge: true })
  done++
  if (done % 10 === 0) console.log(`... ${done}/${manifest.length}`)
}

console.log(`OK: ${done}/${manifest.length} ficheros subidos y documentos parcheados.`)
