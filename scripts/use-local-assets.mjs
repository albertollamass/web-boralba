// Plan B sin Firebase Storage (plan Spark): sirve los binarios extraídos del
// dump como ficheros estáticos de la propia web.
//
// Lo que hace:
//   1. Copia storage-export/* -> public/assets/* (se commitea y despliega).
//   2. Sustituye en firestore.seed.json cada `__STORAGE_UPLOAD__:<ruta>`
//      por `assets/<ruta>` (la app lo resuelve con publicUrl(), que antepone
//      la base `/web-boralba/` en producción).
//
// Uso:
//   node scripts/import-db-sql-to-seed.mjs   (ya ejecutado)
//   node scripts/use-local-assets.mjs
import { cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

if (!existsSync('storage-manifest.json') || !existsSync('firestore.seed.json')) {
  console.error('Faltan storage-manifest.json o firestore.seed.json. Ejecuta antes: node scripts/import-db-sql-to-seed.mjs')
  process.exit(1)
}

mkdirSync('public/assets', { recursive: true })
cpSync('storage-export', 'public/assets', { recursive: true })

const raw = readFileSync('firestore.seed.json', 'utf8')
const count = raw.split('__STORAGE_UPLOAD__:').length - 1
writeFileSync('firestore.seed.json', raw.replaceAll('__STORAGE_UPLOAD__:', 'assets/'))

console.log(`OK: storage-export/ copiado a public/assets/ y ${count} URLs parcheadas en firestore.seed.json.`)
console.log('Comprueba: abre public/assets/products/<id>/datasheet.pdf en tu editor para verificar un PDF.')
