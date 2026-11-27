import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { productPath } from '../src/domain/catalog/slug.js'

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
const normalizePublicRoute = (route) => route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`
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
].map(normalizePublicRoute))

const firestoreValue = (value) => value?.stringValue ?? value?.booleanValue ?? value?.integerValue ?? value?.doubleValue
const firestoreDecode = (value) => {
  if (!value) return undefined
  if (value.mapValue) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, firestoreDecode(item)]))
  if (value.arrayValue) return (value.arrayValue.values || []).map(firestoreDecode)
  return firestoreValue(value)
}
const productPath = (product) => `/producto/${encodeURIComponent(product.id)}/${encodeURIComponent(String(product.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}/`
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
    })).filter((item) => item.published !== false && item.noindex !== true))
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
      const fields = document.fields || {}
      if (slug && firestoreValue(fields.published) !== false && firestoreValue(fields.noindex) !== true) routes.push(`/categoria/${encodeURIComponent(slug)}`)
    }
    pageToken = payload.nextPageToken || ''
  } while (pageToken)
  return routes
}

const sitemap = await readFile('public/sitemap.xml', 'utf8')
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const route = new URL(match[1]).pathname
  if (route !== '/') publicRoutes.add(normalizePublicRoute(route))
}

try {
  for (const route of await publicCategoryRoutes()) publicRoutes.add(normalizePublicRoute(route))
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
  const projectMatch = route.match(/^\/proyectos\/[^/]+\/([^/]+)/)
  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1])
    return {
      title: `${humanize(slug)} — Proyecto de iluminación`,
      description: projectDescriptions[slug] || 'Proyecto de iluminación profesional desarrollado por Boralba Lighting.',
      noindex: false,
    }
  }
  const metadataRoute = route === '/' ? '/' : route.replace(/\/+$/, '')
  const pages = {
    '/': ['Boralba Lighting | Iluminación LED profesional', 'Soluciones profesionales de iluminación LED para arquitectura, interiorismo, retail y espacios públicos.'],
    '/productos': ['Productos de iluminación LED profesional', 'Catálogo de soluciones LED profesionales de Boralba Lighting.'],
    '/proyectos': ['Proyectos de iluminación LED', 'Proyectos de iluminación arquitectónica y técnica realizados por Boralba Lighting.'],
    '/servicios': ['Servicios de iluminación LED', 'Diseño, suministro y puesta en marcha de soluciones profesionales de iluminación.'],
    '/empresa': ['Empresa de iluminación Boralba Lighting', 'Conoce Boralba Lighting y nuestro enfoque profesional para proyectos de iluminación.'],
    '/contacto': ['Contacto | Boralba Lighting', 'Contacta con Boralba Lighting para recibir asesoramiento sobre tu proyecto de iluminación.'],
    '/disena-tu-luminaria': ['Diseña tu luminaria', 'Cuéntanos tu proyecto y diseñaremos una solución de iluminación a medida.'],
  }
  const [title, description] = pages[metadataRoute] || []
  return title ? { title, description, noindex: false } : null
}

function renderStaticHead(html, route) {
  const metadata = routeMetadata(route)
  if (!metadata) return html
  const canonical = `${process.env.SITE_URL || 'https://boralba.es'}${route === '/' ? '/' : route.endsWith('/') ? route : `${route}/`}`
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

const humanize = (value) => String(value || '')
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const projectDescriptions = {
  'obra-panel-led-flexible': 'Aplicación de paneles LED flexibles integrados en la arquitectura para crear superficies luminosas continuas y homogéneas.',
  'chalet-en-pozuelo-de-alarcon': 'Proyecto de iluminación para una vivienda unifamiliar, con ambientes cálidos y funcionales integrados en la arquitectura interior.',
  'torreon-consuegra-fachadas': 'Iluminación exterior de la Torre de Consuegra para realzar su arquitectura y presencia durante la noche.',
  'hotel-rural-torre-de-consuegra': 'Iluminación interior de un hotel rural situado junto a la Torre de Consuegra, con una luz cálida y acogedora.',
  'tunel-calle-damas': 'Intervención de iluminación en un paso urbano para convertir el recorrido en un espacio reconocible y atractivo.',
  'hospital-gregorio-maranon': 'Solución de iluminación para un espacio asistencial, diseñada para ofrecer confort visual y una atmósfera serena.',
  'centro-de-pilates': 'Iluminación de un espacio de bienestar con luz confortable y una integración limpia en la arquitectura.',
  'gimnasio-madrid': 'Proyecto de iluminación para un gimnasio, con soluciones eficientes adaptadas al uso deportivo del espacio.',
  'centro-cultural-antonio-lopez': 'Iluminación de un equipamiento cultural donde la identidad luminosa forma parte de la imagen pública del espacio.',
  'centro-comercial-madrid-sur': 'Iluminación de un gran espacio comercial para acompañar el recorrido y reforzar la presencia de las marcas.',
  'hotel-jc-santo-domingo': 'Iluminación de las zonas comunes de un hotel para aportar calidez y carácter a la recepción y los espacios de paso.',
  'hotel-jc-santo-domingo-exteriores': 'Iluminación exterior de un hotel para destacar la volumetría de la fachada y señalizar el acceso.',
  'centro-cultural-antonio-lopez-exteriores': 'Iluminación exterior de un centro cultural para destacar su fachada y presencia urbana durante la noche.',
}

function renderStaticContent(route) {
  const normalizedRoute = route.replace(/\/+$/, '') || '/'
  const productMatch = normalizedRoute.match(/^\/producto\/([^/]+)/)
  if (productMatch) {
    const product = products.find((item) => item.id === decodeURIComponent(productMatch[1]))
    if (!product) return ''
    const description = product.description || product.seo?.description || `Ficha técnica de ${product.name || 'producto'} con especificaciones y soluciones profesionales de iluminación LED.`
    return `<main><h1>${escapeHtml(product.name || 'Producto LED')}</h1><p>${escapeHtml(description)}</p>${product.ref ? `<p>Referencia: ${escapeHtml(product.ref)}</p>` : ''}<p>Consulta las especificaciones, aplicaciones y documentación técnica de este producto Boralba Lighting.</p><p><a href="/productos/">Volver al catálogo de productos LED</a></p></main>`
  }

  const categoryMatch = normalizedRoute.match(/^\/categoria\/([^/]+)/)
  if (categoryMatch) {
    const category = categories.find((item) => item.slug === decodeURIComponent(categoryMatch[1]))
    if (!category) return ''
    const categoryProducts = products.filter((product) => [product.category, ...(product.categories || [])].includes(category.slug)).slice(0, 30)
    const productLinks = categoryProducts.map((product) => `<li><a href="${productPath(product)}">${escapeHtml(product.name || product.id)}</a></li>`).join('')
    return `<main><h1>${escapeHtml(category.name || 'Categoría de iluminación LED')}</h1>${category.tagline ? `<p>${escapeHtml(category.tagline)}</p>` : ''}${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}<h2>Productos de ${escapeHtml(category.name || 'esta categoría')}</h2>${productLinks ? `<ul>${productLinks}</ul>` : '<p>Consulta las soluciones LED disponibles en esta categoría.</p>'}<p><a href="/productos/">Ver todo el catálogo LED</a></p></main>`
  }

  const projectMatch = normalizedRoute.match(/^\/proyectos\/[^/]+\/([^/]+)$/)
  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1])
    return `<main><h1>${escapeHtml(humanize(slug))}</h1><p>${escapeHtml(projectDescriptions[slug] || 'Proyecto de iluminación profesional desarrollado por Boralba Lighting.')}</p><p>Boralba Lighting diseña y suministra soluciones LED para proyectos de arquitectura, interiorismo y espacios públicos.</p><p><a href="/proyectos/">Ver proyectos de iluminación</a></p></main>`
  }

  const pages = {
    '/': ['Boralba Lighting | Iluminación LED profesional', 'Soluciones profesionales de iluminación LED para arquitectura, interiorismo, retail y espacios públicos.'],
    '/productos': ['Productos de iluminación LED profesional', 'Catálogo de tiras LED, perfiles, paneles y otras soluciones de iluminación profesional para proyectos.'],
    '/proyectos': ['Proyectos de iluminación LED', 'Proyectos de iluminación arquitectónica, comercial, residencial y técnica realizados por Boralba Lighting.'],
    '/servicios': ['Servicios de iluminación LED', 'Asesoramiento, diseño, suministro y puesta en marcha de soluciones profesionales de iluminación para cada proyecto.'],
    '/empresa': ['Empresa de iluminación Boralba Lighting', 'Boralba Lighting desarrolla soluciones de iluminación LED profesional para arquitectura, interiorismo, retail y espacios públicos.'],
    '/contacto': ['Contacto | Boralba Lighting', 'Contacta con Boralba Lighting para recibir asesoramiento sobre tu proyecto de iluminación LED.'],
    '/disena-tu-luminaria': ['Diseña tu luminaria', 'Cuéntanos tu proyecto y diseñaremos una solución de iluminación a medida.'],
  }
  const page = pages[normalizedRoute]
  if (!page) return ''
  return `<main><h1>${escapeHtml(page[0])}</h1><p>${escapeHtml(page[1])}</p><nav aria-label="Contenido principal"><a href="/productos/">Productos LED</a><a href="/servicios/">Servicios de iluminación</a><a href="/proyectos/">Proyectos de iluminación</a><a href="/contacto/">Contacto</a></nav></main>`
}

function renderStaticHtml(html, route) {
  const content = renderStaticContent(route)
  if (!content) return html
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/i, `<noscript>${content}</noscript>`)
}

// Las fichas antiguas se enlazaban como /producto/{id} y ya están rastreadas.
// Generamos una página puente que canonicaliza y redirige a la URL con slug,
// para no dejar 404s en los resultados de Google ni en enlaces externos.
const siteUrl = (process.env.SITE_URL || 'https://boralba.es').replace(/\/$/, '')
for (const product of products) {
  if (!product?.id) continue
  const target = productPath(product)
  const bridgeDir = join('dist', 'producto', product.id)
  await mkdir(bridgeDir, { recursive: true })
  await writeFile(join(bridgeDir, 'index.html'), `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(product.name || 'Producto LED')}</title><link rel="canonical" href="${escapeHtml(`${siteUrl}${target}`)}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${escapeHtml(target)}"></head><body><a href="${escapeHtml(target)}">Ver ${escapeHtml(product.name || 'producto')}</a></body></html>\n`)
}

for (const route of publicRoutes) {
  const segments = route.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment))
  await mkdir(join('dist', ...segments), { recursive: true })
  await writeFile(join('dist', ...segments, 'index.html'), renderStaticHtml(renderStaticHead(shell, route), route))
}

console.log(`Rutas estáticas generadas: ${publicRoutes.size}`)
