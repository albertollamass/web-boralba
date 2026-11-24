import { readFile, writeFile } from 'node:fs/promises'

async function loadLocalEnv() {
  try {
    const contents = await readFile('.env', 'utf8')
    for (const line of contents.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // CI provides the variables directly; a missing local .env is valid.
  }
}

await loadLocalEnv()

const siteUrl = (process.env.SITE_URL || 'https://boralba.es').replace(/\/$/, '')
const projectId = process.env.VITE_FIREBASE_PROJECT_ID
const apiKey = process.env.VITE_FIREBASE_API_KEY

const staticRoutes = [
  '/',
  '/productos',
  '/proyectos',
  '/servicios',
  '/empresa',
  '/disena-tu-luminaria',
  '/contacto',
  '/outlet',
  '/proyectos/soluciones-especiales/obra-panel-led-flexible',
  '/proyectos/viviendas/chalet-en-pozuelo-de-alarcon',
  '/proyectos/exterior-y-fachadas/torreon-consuegra-fachadas',
  '/proyectos/comercios-y-hosteleria/hotel-rural-torre-de-consuegra',
  '/proyectos/espacios-publicos-y-educativos/tunel-calle-damas',
  '/proyectos/salud-y-bienestar/hospital-gregorio-maranon',
  '/proyectos/salud-y-bienestar/gimnasio-madrid',
  '/proyectos/espacios-publicos-y-educativos/centro-cultural-antonio-lopez',
  '/proyectos/comercios-y-hosteleria/centro-comercial-madrid-sur',
  '/proyectos/comercios-y-hosteleria/hotel-jc-santo-domingo',
  '/proyectos/exterior-y-fachadas/hotel-jc-santo-domingo-exteriores',
]

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character]))

const firestoreValue = (value) => value?.stringValue ?? value?.booleanValue ?? value?.integerValue ?? value?.doubleValue
const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

async function publicProductIds() {
  if (!projectId || !apiKey) {
    console.warn('Sitemap: faltan VITE_FIREBASE_PROJECT_ID o VITE_FIREBASE_API_KEY; se omiten productos.')
    return []
  }

  const ids = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({
      key: apiKey,
      pageSize: '1000',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?${params}`)
    if (!response.ok) throw new Error(`Firestore respondió HTTP ${response.status}`)
    const payload = await response.json()
    for (const document of payload.documents || []) {
      const id = document.name?.split('/').pop()
      const fields = document.fields || {}
      // Los productos marcados como no publicados o no indexables no deben
      // aparecer en el índice público.
      if (id && firestoreValue(fields.published) !== false && firestoreValue(fields.noindex) !== true) {
        const name = firestoreValue(fields.name)
        ids.push({ id, slug: slugify(name) })
      }
    }
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return ids
}

let productIds = []
try {
  productIds = await publicProductIds()
} catch (error) {
  console.warn(`Sitemap: no se pudo consultar Firestore (${error.message}); se omiten productos.`)
}

const routes = [...staticRoutes, ...productIds.map(({ id, slug }) => `/producto/${encodeURIComponent(id)}${slug ? `/${encodeURIComponent(slug)}` : ''}`)]
const urls = routes.map((route) => `  <url><loc>${escapeXml(`${siteUrl}${route}`)}</loc></url>`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

await writeFile('public/sitemap.xml', sitemap)
console.log(`Sitemap generado: ${routes.length} URLs (${productIds.length} productos).`)
