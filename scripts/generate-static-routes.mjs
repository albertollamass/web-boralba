import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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

const projectId = process.env.VITE_FIREBASE_PROJECT_ID
const apiKey = process.env.VITE_FIREBASE_API_KEY
const shell = await readFile('dist/index.html', 'utf8')
const publicRoutes = new Set([
  '/productos',
  '/buscar',
  '/proyectos',
  '/servicios',
  '/empresa',
  '/contacto',
  '/presupuesto',
  '/presupuesto/solicitar',
  '/disena-tu-luminaria',
  '/legal/aviso-legal',
  '/legal/politica-privacidad',
  '/legal/politica-cookies',
  '/admin/login',
  '/admin',
])

const firestoreValue = (value) => value?.stringValue ?? value?.booleanValue ?? value?.integerValue ?? value?.doubleValue
const firestoreDecode = (value) => {
  if (!value) return undefined
  if (value.mapValue) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, firestoreDecode(item)]))
  if (value.arrayValue) return (value.arrayValue.values || []).map(firestoreDecode)
  return firestoreValue(value)
}
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

async function publicEntities(collection) {
  if (!projectId || !apiKey) return []
  const documents = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: '1000' })
    if (pageToken) params.set('pageToken', pageToken)
    const payload = await fetchFirestorePage(collection, params)
    documents.push(...(payload.documents || []).map((document) => ({
      id: document.name?.split('/').pop(),
      ...(Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, firestoreDecode(value)]))),
    })))
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return documents
}

async function publicCategoryRoutes() {
  if (!projectId || !apiKey) return []

  const routes = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: '1000' })
    if (pageToken) params.set('pageToken', pageToken)
    const payload = await fetchFirestorePage('categories', params)
    for (const document of payload.documents || []) {
      const id = document.name?.split('/').pop()
      const slug = firestoreValue(document.fields?.slug) || id
      if (slug) routes.push(`/categoria/${encodeURIComponent(slug)}`)
    }
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return routes
}

const sitemap = await readFile('public/sitemap.xml', 'utf8')
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const route = new URL(match[1]).pathname
  if (route !== '/') publicRoutes.add(route)
}

try {
  for (const route of await publicCategoryRoutes()) publicRoutes.add(route)
} catch (error) {
  console.warn(`Rutas estáticas: no se pudieron consultar categorías (${error.message}).`)
}

let products = []
let categories = []
try {
  ;[products, categories] = await Promise.all([publicEntities('products'), publicEntities('categories')])
} catch (error) {
  console.warn(`Metadatos estáticos: no se pudieron consultar entidades (${error.message}).`)
}

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const routeMetadata = (route) => {
  const productMatch = route.match(/^\/producto\/([^/]+)/)
  if (productMatch) {
    const product = products.find((item) => item.id === decodeURIComponent(productMatch[1]))
    if (!product) return null
    const seo = product.seo || {}
    return {
      title: seo.title || `${product.name || 'Producto'}${product.ref ? ` ${product.ref}` : ''} — Producto LED`,
      description: seo.description || product.description || `Ficha técnica de ${product.name || 'producto'}: especificaciones, aplicaciones y soluciones compatibles Boralba Lighting.`,
      noindex: Boolean(seo.noindex || product.noindex || product.published === false),
    }
  }
  const categoryMatch = route.match(/^\/categoria\/([^/]+)/)
  if (categoryMatch) {
    const category = categories.find((item) => item.slug === decodeURIComponent(categoryMatch[1]))
    if (!category) return null
    const seo = category.seo || {}
    return {
      title: seo.title || `${category.name || 'Categoría'} — Iluminación LED`,
      description: seo.description || category.tagline || category.description || `Productos LED de ${category.name || 'esta categoría'}: soluciones profesionales Boralba para tu proyecto de iluminación.`,
      noindex: Boolean(seo.noindex || category.noindex),
    }
  }
  const pages = {
    '/': ['Boralba Lighting | Iluminación LED profesional', 'Soluciones profesionales de iluminación LED para arquitectura, interiorismo, retail y espacios públicos.'],
    '/productos': ['Productos de iluminación LED profesional', 'Catálogo de soluciones LED profesionales de Boralba Lighting.'],
    '/proyectos': ['Proyectos de iluminación LED', 'Proyectos de iluminación arquitectónica y técnica realizados por Boralba Lighting.'],
    '/servicios': ['Servicios de iluminación LED', 'Diseño, suministro y puesta en marcha de soluciones profesionales de iluminación.'],
    '/empresa': ['Empresa de iluminación Boralba Lighting', 'Conoce Boralba Lighting y nuestro enfoque profesional para proyectos de iluminación.'],
    '/contacto': ['Contacto | Boralba Lighting', 'Contacta con Boralba Lighting para recibir asesoramiento sobre tu proyecto de iluminación.'],
    '/disena-tu-luminaria': ['Diseña tu luminaria', 'Cuéntanos tu proyecto y diseñaremos una solución de iluminación a medida.'],
  }
  const [title, description] = pages[route] || []
  return title ? { title, description, noindex: false } : null
}

function renderStaticHead(html, route) {
  const metadata = routeMetadata(route)
  if (!metadata) return html
  const canonical = `${process.env.SITE_URL || 'https://boralba.es'}${route === '/' ? '/' : route}`
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="robots" content="${metadata.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}">`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`,
  ]
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+name="robots"[^>]*>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/<meta\s+property="og:title"[^>]*>/i, '')
    .replace(/<meta\s+property="og:description"[^>]*>/i, '')
    .replace(/<meta\s+property="og:url"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:title"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:description"[^>]*>/i, '')
    .replace('</head>', `${tags.join('\n    ')}\n  </head>`)
}

for (const route of publicRoutes) {
  const segments = route.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment))
  await mkdir(join('dist', ...segments), { recursive: true })
  await writeFile(join('dist', ...segments, 'index.html'), renderStaticHead(shell, route))
}

console.log(`Rutas estáticas generadas: ${publicRoutes.size}`)
