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
  '/outlet',
  '/legal/aviso-legal',
  '/legal/politica-privacidad',
  '/legal/politica-cookies',
  '/admin/login',
  '/admin',
])

const firestoreValue = (value) => value?.stringValue ?? value?.booleanValue ?? value?.integerValue ?? value?.doubleValue

async function publicCategoryRoutes() {
  if (!projectId || !apiKey) return []

  const routes = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: '1000' })
    if (pageToken) params.set('pageToken', pageToken)
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/categories?${params}`)
    if (!response.ok) throw new Error(`Firestore respondió HTTP ${response.status}`)
    const payload = await response.json()
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

for (const route of publicRoutes) {
  const segments = route.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment))
  await mkdir(join('dist', ...segments), { recursive: true })
  await writeFile(join('dist', ...segments, 'index.html'), shell)
}

console.log(`Rutas estáticas generadas: ${publicRoutes.size}`)
