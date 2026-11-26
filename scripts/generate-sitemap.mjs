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
const previousSitemap = await readFile('public/sitemap.xml', 'utf8').catch(() => '')

const staticRoutes = [
  '/',
  '/productos',
  '/proyectos',
  '/servicios',
  '/empresa',
  '/disena-tu-luminaria',
  '/contacto',
  '/proyectos/soluciones-especiales/obra-panel-led-flexible',
  '/proyectos/viviendas/chalet-en-pozuelo-de-alarcon',
  '/proyectos/exterior-y-fachadas/torreon-consuegra-fachadas',
  '/proyectos/comercios-y-hosteleria/hotel-rural-torre-de-consuegra',
  '/proyectos/espacios-publicos-y-educativos/tunel-calle-damas',
  '/proyectos/salud-y-bienestar/hospital-gregorio-maranon',
  '/proyectos/salud-y-bienestar/centro-de-pilates',
  '/proyectos/salud-y-bienestar/gimnasio-madrid',
  '/proyectos/espacios-publicos-y-educativos/centro-cultural-antonio-lopez',
  '/proyectos/comercios-y-hosteleria/centro-comercial-madrid-sur',
  '/proyectos/comercios-y-hosteleria/hotel-jc-santo-domingo',
  '/proyectos/exterior-y-fachadas/hotel-jc-santo-domingo-exteriores',
  '/proyectos/exterior-y-fachadas/centro-cultural-antonio-lopez-exteriores',
]

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character]))

const firestoreValue = (value) => value?.stringValue ?? value?.booleanValue ?? value?.integerValue ?? value?.doubleValue
const firestoreDate = (value) => value?.timestampValue || null
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fetchFirestorePage(collection, params) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?${params}`
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url)
    if (response.ok) return response.json()
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt === 3) throw new Error(`Firestore respondió HTTP ${response.status}`)
    await wait(500 * 2 ** attempt)
  }
  throw new Error('No se pudo consultar Firestore')
}

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
    const payload = await fetchFirestorePage('products', params)
    for (const document of payload.documents || []) {
      const id = document.name?.split('/').pop()
      const fields = document.fields || {}
      // Los productos marcados como no publicados o no indexables no deben
      // aparecer en el índice público.
       if (id && firestoreValue(fields.published) !== false && firestoreValue(fields.noindex) !== true) {
        const name = firestoreValue(fields.name)
        ids.push({ id, slug: slugify(name), lastmod: document.updateTime || firestoreDate(fields.updatedAt) })
      }
    }
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return ids
}

async function publicCategories() {
  if (!projectId || !apiKey) return []
  const categories = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: '1000' })
    if (pageToken) params.set('pageToken', pageToken)
    const payload = await fetchFirestorePage('categories', params)
    for (const document of payload.documents || []) {
      const fields = document.fields || {}
      const slug = firestoreValue(fields.slug) || document.name?.split('/').pop()
      if (slug && firestoreValue(fields.published) !== false && firestoreValue(fields.noindex) !== true) {
        categories.push({ slug, lastmod: document.updateTime || firestoreDate(fields.updatedAt) })
      }
    }
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return categories
}

let productRoutes = []
let categoryRoutes = []
let productRecords = []
let categoryRecords = []
try {
  productRecords = await publicProductIds()
  categoryRecords = await publicCategories()
  const previousProductRoutes = [...previousSitemap.matchAll(/<loc>([^<]*\/producto\/[^<]+)<\/loc>/g)]
  if (productRecords.length === 0 && previousProductRoutes.length > 0) {
    throw new Error('Firestore devolvió un catálogo de productos vacío')
  }
  productRoutes = productRecords.map(({ id, slug }) => `/producto/${encodeURIComponent(id)}${slug ? `/${encodeURIComponent(slug)}` : ''}`)
  categoryRoutes = categoryRecords.map(({ slug }) => `/categoria/${encodeURIComponent(slug)}`)
  const previousSet = new Set(previousProductRoutes.map((match) => new URL(match[1]).pathname.replace(/\/+$/, '')))
  const currentSet = new Set(productRoutes)
  const added = productRoutes.filter((route) => !previousSet.has(route)).length
  const retired = [...previousSet].filter((route) => !currentSet.has(route)).length
  console.log(`Sitemap catálogo: ${added} productos nuevos, ${retired} retirados.`)
} catch (error) {
  // No publicar una copia posiblemente obsoleta: un 429 no debe convertir el
  // sitemap en un catálogo incompleto sin que el build lo deje claro.
  console.error(`Sitemap: no se pudo consultar Firestore (${error.message}). Se cancela la generación.`)
  process.exitCode = 1
  throw error
}

const routes = [...staticRoutes.map((route) => ({ route })), ...categoryRoutes.map((route) => ({ route })), ...productRoutes.map((route) => ({ route }))]
const lastmodByRoute = new Map([
  ...productRoutes.map((route, index) => [route, productRecords[index]?.lastmod]),
  ...categoryRoutes.map((route, index) => [route, categoryRecords[index]?.lastmod]),
])
const publicUrl = (route) => route === '/' ? `${siteUrl}/` : `${siteUrl}${route}/`
const urls = routes.map(({ route }) => {
  const lastmod = lastmodByRoute.get(route)
  return `  <url><loc>${escapeXml(publicUrl(route))}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}</url>`
}).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

await writeFile('public/sitemap.xml', sitemap)
console.log(`Sitemap generado: ${routes.length} URLs (${productRoutes.length} productos, ${categoryRoutes.length} categorías).`)
