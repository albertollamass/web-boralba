const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
const PROPERTY = 'https://boralba.es/'
const DOMAIN_PROPERTY = 'sc-domain:boralba.es'
const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const GIS_URL = 'https://accounts.google.com/gsi/client'
const API_ROOT = 'https://searchconsole.googleapis.com/webmasters/v3'
const INSPECTION_API_ROOT = 'https://searchconsole.googleapis.com/v1'
const cache = new Map()
const CATALOG_INSPECTION_CACHE_KEY = 'boralba.search-console.catalog-inspections.v1'
const CATALOG_INSPECTION_REQUESTS_KEY = 'boralba.search-console.catalog-inspection-requests.v1'
const MANUAL_INSPECTION_REQUESTS_KEY = 'boralba.search-console.manual-inspection-requests.v1'
const INSPECTION_CACHE_TTL = 24 * 60 * 60 * 1000
const INSPECTION_CONCURRENCY = 8
const INSPECTION_MINUTE_LIMIT = 550
const INSPECTION_DAILY_LIMIT = 1900
const INSPECTION_CACHE_ERROR_TTL = 15 * 60 * 1000
const isCanonicalProductUrl = (url) => /^https:\/\/boralba\.es\/producto\/[^/]+\/[^/]+\/$/.test(url)

let gisPromise
let accessToken = null
let tokenExpiresAt = 0
let resumeBlocked = false
let activeProperty = PROPERTY

export const searchConsoleConfig = {
  clientId: CLIENT_ID,
  isConfigured: Boolean(CLIENT_ID),
  property: PROPERTY,
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google)
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_URL}"]`)
    const script = existing || document.createElement('script')
    script.onload = () => window.google?.accounts?.oauth2 ? resolve(window.google) : reject(new Error('Google Identity Services no está disponible'))
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'))
    if (!existing) {
      script.src = GIS_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  return gisPromise
}

export async function connectSearchConsole({ loginHint, forceConsent = false } = {}) {
  if (!CLIENT_ID) throw new Error('Falta configurar VITE_GOOGLE_OAUTH_CLIENT_ID')
  const google = await loadGoogleIdentityServices()
  resumeBlocked = false
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: READONLY_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          const error = new Error(response.error_description || 'Google no concedió acceso a Search Console')
          error.code = response.error
          reject(error)
          return
        }
        accessToken = response.access_token
        tokenExpiresAt = Date.now() + Math.max(1, Number(response.expires_in || 3600) - 30) * 1000
        resolve({ expiresAt: tokenExpiresAt })
      },
      error_callback: (error) => reject(new Error(error?.message || 'Se canceló la autorización de Google')),
    })
    tokenClient.requestAccessToken({ prompt: forceConsent ? 'consent' : '', login_hint: loginHint })
  })
}

export function isSearchConsoleConnected() {
  return Boolean(accessToken && Date.now() < tokenExpiresAt)
}

export function disconnectSearchConsole() {
  if (accessToken && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(accessToken, () => {})
  accessToken = null
  tokenExpiresAt = 0
  cache.clear()
  activeProperty = PROPERTY
  resumeBlocked = true
}

export function canResumeSearchConsole() {
  return !resumeBlocked
}

function requireToken() {
  if (!isSearchConsoleConnected()) throw new Error('La autorización de Google ha caducado. Vuelve a conectar la cuenta.')
  return accessToken
}

async function request(path, options = {}, base = API_ROOT) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${requireToken()}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (response.status === 401) {
    accessToken = null
    tokenExpiresAt = 0
    throw new Error('La autorización de Google ha caducado. Vuelve a conectar la cuenta.')
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    const error = new Error(`Search Console respondió HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`)
    error.status = response.status
    throw error
  }
  return response.json()
}

const sitePathFor = (site) => encodeURIComponent(site)
const daysBetween = (period) => period === '7d' ? 7 : period === '90d' ? 90 : period === '6m' ? 183 : period === '12m' ? 365 : 28
const isoDate = (date) => date.toISOString().slice(0, 10)
function rangeFor(period, startDate, endDate, previous = false) {
  if (period === 'custom' && startDate && endDate) {
    const start = new Date(`${startDate}T00:00:00Z`)
    const end = new Date(`${endDate}T00:00:00Z`)
    const length = Math.max(1, Math.round((end - start) / 86400000) + 1)
    if (previous) {
      const previousEnd = new Date(start.getTime() - 86400000)
      return { startDate: isoDate(new Date(previousEnd.getTime() - (length - 1) * 86400000)), endDate: isoDate(previousEnd) }
    }
    return { startDate, endDate }
  }
  const end = new Date()
  end.setUTCDate(end.getUTCDate() - 2)
  const length = daysBetween(period)
  if (previous) end.setUTCDate(end.getUTCDate() - length)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - length + 1)
  return { startDate: isoDate(start), endDate: isoDate(end) }
}

async function performance(range, site = activeProperty) {
  return request(`/sites/${sitePathFor(site)}/searchAnalytics/query`, {
    method: 'POST',
    body: JSON.stringify({ ...range, dimensions: ['date', 'query', 'page'], rowLimit: 25000, dataState: 'final' }),
  })
}

function aggregate(rows = []) {
  if (!rows.length) return { summary: { clicks: null, impressions: null, ctr: null, position: null }, queries: [], pages: [], timeline: [] }
  const summary = rows.reduce((result, row) => ({
    clicks: result.clicks + Number(row.clicks || 0),
    impressions: result.impressions + Number(row.impressions || 0),
    position: result.position + Number(row.position || 0) * Number(row.impressions || 0),
  }), { clicks: 0, impressions: 0, position: 0 })
  summary.ctr = summary.impressions ? summary.clicks / summary.impressions : null
  summary.position = summary.impressions ? summary.position / summary.impressions : null
  const byQuery = new Map()
  const byPage = new Map()
  const byDate = new Map()
  rows.forEach((row) => {
    const [date, query, page] = row.keys || []
    addAggregate(byQuery, query, row, page)
    addAggregate(byPage, page, row)
    addAggregate(byDate, date, row)
  })
  return { summary, queries: [...byQuery.values()].map((item) => toRow(item, 'query')), pages: [...byPage.values()].map((item) => toRow(item, 'page')), timeline: [...byDate.values()].sort((a, b) => a.key.localeCompare(b.key)).map((item) => toRow(item, 'date')) }
}

function addAggregate(map, key, row, page) {
  if (!key) return
  const current = map.get(key) || { key, clicks: 0, impressions: 0, positionTotal: 0, url: page }
  current.clicks += Number(row.clicks || 0)
  current.impressions += Number(row.impressions || 0)
  current.positionTotal += Number(row.position || 0) * Number(row.impressions || 0)
  map.set(key, current)
}

function toRow(item, type) {
  return { ...(type === 'date' ? { date: item.key } : type === 'query' ? { query: item.key, url: item.url } : { url: item.key }), clicks: item.clicks, impressions: item.impressions, ctr: item.impressions ? item.clicks / item.impressions : null, position: item.impressions ? item.positionTotal / item.impressions : null }
}

async function sitemap(site = activeProperty) {
  const data = await request(`/sites/${sitePathFor(site)}/sitemaps`)
  const item = (data.sitemap || []).find((entry) => entry.path === `${PROPERTY}sitemap.xml`) || data.sitemap?.[0]
  if (!item) return null
  const errors = item.errors == null ? null : Number(item.errors)
  const warnings = item.warnings == null ? null : Number(item.warnings)
  const submitted = item.contents == null ? null : item.contents.reduce((total, content) => total + Number(content.submitted || 0), 0)
  const status = item.isPending
    ? 'Pendiente de procesamiento'
    : errors == null
      ? 'Sin estado disponible'
      : errors > 0
        ? 'Con errores'
        : 'Correcto'
  return { status, submitted, errors, warnings, submittedAt: item.submitted, lastRead: item.lastDownloaded }
}

const isRetryableInspectionError = (error) => !error.status || error.status === 408 || error.status === 429 || error.status >= 500

async function inspectSearchConsoleUrlWithRetry(url, retries = 1) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await inspectSearchConsoleUrl(url)
    } catch (error) {
      lastError = error
      if (!isRetryableInspectionError(error) || attempt === retries) break
      await wait(Math.min(5000, 500 * (2 ** attempt) + Math.round(Math.random() * 150)))
    }
  }
  throw lastError
}

async function withWorkingProperty(run) {
  try {
    return await run(activeProperty)
  } catch (error) {
    if (error.status !== 403) throw error
    const fallback = activeProperty === PROPERTY ? DOMAIN_PROPERTY : PROPERTY
    const result = await run(fallback)
    activeProperty = fallback
    return result
  }
}

export async function inspectSearchConsoleUrl(url) {
  if (!isCanonicalProductUrl(url)) throw new Error('La inspección del catálogo solo admite la URL canónica de producto con slug.')
  const payload = await withWorkingProperty((site) => request('/urlInspection/index:inspect', {
    method: 'POST',
    body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
  }, INSPECTION_API_ROOT))
  const result = payload.inspectionResult || {}
  const indexStatus = result.indexStatusResult || {}
  return {
    url,
    checkedAt: new Date().toISOString(),
    verdict: indexStatus.verdict || null,
    coverageState: indexStatus.coverageState || null,
    indexingState: indexStatus.indexingState || null,
    pageFetchState: indexStatus.pageFetchState || null,
    lastCrawlTime: indexStatus.lastCrawlTime || null,
    robotsTxtState: indexStatus.robotsTxtState || null,
    googleCanonical: indexStatus.googleCanonical || null,
    userCanonical: indexStatus.userCanonical || null,
  }
}

const translatedCoverage = (value = '') => {
  const text = String(value).toLowerCase()
  if (text.includes('submitted and indexed')) return 'La URL está enviada e indexada.'
  if (text.includes('discovered') && text.includes('not indexed')) return 'Google ha descubierto la URL, pero todavía no la ha rastreado.'
  if (text.includes('crawled') && text.includes('not indexed')) return 'Google ha rastreado la URL, pero aún no la ha incluido en el índice.'
  if (text.includes('not found')) return 'Google no encuentra esta página.'
  if (text.includes('redirect')) return 'Google detecta una redirección en esta URL.'
  if (text.includes('robots')) return 'El archivo robots.txt impide el acceso de Google.'
  if (text.includes('duplicate')) return 'Google considera que esta página es duplicada.'
  if (text.includes('alternate')) return 'Google ha elegido otra URL como canónica.'
  if (text.includes('server error')) return 'El servidor devolvió un error al rastrear la página.'
  return value || 'Google todavía no ha indicado un estado detallado.'
}

const translatedIndexing = (value = '') => {
  const text = String(value).toLowerCase()
  if (text.includes('indexable')) return 'La página puede indexarse.'
  if (text.includes('blocked')) return 'La página está bloqueada para Google.'
  if (text.includes('not indexable')) return 'La página no puede indexarse.'
  return value || 'No hay información suficiente sobre la indexación.'
}

export const translateSearchConsoleError = (value = '') => {
  const text = String(value)
  if (/quota|rate limit|resource exhausted/i.test(text)) return 'Google ha alcanzado el límite temporal de comprobaciones. Se reintentará en el siguiente ciclo.'
  if (/401|unauthoriz|caducad/i.test(text)) return 'La autorización de Google ha caducado. Vuelve a conectar Search Console.'
  if (/403|forbidden|permission/i.test(text)) return 'La cuenta no tiene permiso para inspeccionar esta propiedad de Search Console.'
  if (/404|not found/i.test(text)) return 'Google no encuentra la URL o la propiedad configurada.'
  if (/429/i.test(text)) return 'Google ha limitado temporalmente las peticiones. Se reintentará más adelante.'
  return 'Google no pudo completar la comprobación. Revisa la conexión y vuelve a intentarlo más adelante.'
}

export function classifyInspection(inspection) {
  if (!inspection) return 'unchecked'
  if (inspection.updateError && !inspection.verdict && !inspection.coverageState) return 'error'
  if (inspection.followUp && inspection.verdict !== 'PASS') return 'follow-up'
  if (inspection.error) return 'error'
  if (inspection.googleCanonical && inspection.userCanonical && inspection.googleCanonical !== inspection.userCanonical) return 'error'
  if (inspection.verdict === 'PASS') return 'indexed'
  const coverage = String(inspection.coverageState || '').toLowerCase()
  const indexing = String(inspection.indexingState || '').toLowerCase()
  const realError = coverage.includes('robots') || coverage.includes('server error') || coverage.includes('not found') || coverage.includes('redirect') || coverage.includes('duplicate') || coverage.includes('alternate') || indexing.includes('blocked') || indexing.includes('not indexable')
  return realError ? 'error' : 'pending'
}

export function inspectionExplanation(inspection) {
  if (!inspection) return 'Todavía no se ha comprobado esta URL.'
  if (inspection.updateError) return `Último resultado válido conservado. No se pudo actualizar: ${translateSearchConsoleError(inspection.updateError)}`
  if (inspection.error) return translateSearchConsoleError(inspection.error)
  if (inspection.followUp && inspection.verdict !== 'PASS') return 'La corrección se ha publicado y estamos esperando una nueva comprobación de Google.'
  if (inspection.googleCanonical && inspection.userCanonical && inspection.googleCanonical !== inspection.userCanonical) return 'Google ha elegido otra URL como canónica. La ficha necesita revisión.'
  const state = classifyInspection(inspection)
  if (state === 'indexed') return 'Google ha confirmado que la URL canónica está indexada.'
  if (state === 'error') return `${translatedCoverage(inspection.coverageState)} ${translatedIndexing(inspection.indexingState)}`
  return `${translatedCoverage(inspection.coverageState)} ${translatedIndexing(inspection.indexingState)} Que todavía no esté indexada no es un error si el producto está publicado y puede indexarse.`
}

export function inspectionAdvice(inspection) {
  if (!inspection || inspection.error || classifyInspection(inspection) !== 'error') return ''
  if (inspection.googleCanonical && inspection.userCanonical && inspection.googleCanonical !== inspection.userCanonical) return 'Comprueba que la etiqueta canonical y los enlaces internos usan esta URL con slug.'
  const coverage = String(inspection.coverageState || '').toLowerCase()
  if (coverage.includes('robots')) return 'Revisa robots.txt y permite el rastreo de la URL canónica.'
  if (coverage.includes('redirect')) return 'Comprueba que la URL canónica no redirige y que las rutas antiguas apuntan a ella.'
  if (coverage.includes('not found')) return 'Comprueba que el producto está publicado y que la URL devuelve una ficha válida.'
  if (coverage.includes('duplicate') || coverage.includes('alternate')) return 'Revisa la etiqueta canonical y confirma que coincide con la URL canónica del producto.'
  if (coverage.includes('server error')) return 'Revisa el servidor y vuelve a solicitar la indexación cuando responda correctamente.'
  return 'Revisa publicación, noindex, robots y la etiqueta canonical del producto.'
}

export function markInspectionForFollowUp(url) {
  const stored = readCatalogInspectionCache()
  if (!stored[url]) return
  stored[url] = { ...stored[url], followUp: true, followUpAt: new Date().toISOString() }
  writeCatalogInspectionCache(stored)
}

export function getCachedCatalogInspections() {
  return readCatalogInspectionCache()
}

export function getInspectionRequestLog() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(MANUAL_INSPECTION_REQUESTS_KEY) || '{}')
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  } catch {
    return {}
  }
}

export function registerInspectionRequest(url) {
  const current = getInspectionRequestLog()
  const next = { ...current, [url]: new Date().toISOString() }
  try { window.localStorage.setItem(MANUAL_INSPECTION_REQUESTS_KEY, JSON.stringify(next)) } catch { /* Registro opcional. */ }
  return next[url]
}

function readCatalogInspectionCache() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CATALOG_INSPECTION_CACHE_KEY) || '{}')
    return stored && typeof stored === 'object' ? stored : {}
  } catch {
    return {}
  }
}

function writeCatalogInspectionCache(entries) {
  try {
    window.localStorage.setItem(CATALOG_INSPECTION_CACHE_KEY, JSON.stringify(entries))
  } catch {
    // La caché es opcional; la inspección no debe fallar si el navegador la bloquea.
  }
}

function readInspectionRequestLog() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(CATALOG_INSPECTION_REQUESTS_KEY) || '[]')
    const stored = Array.isArray(raw) ? raw : Object.values(raw).map((value) => new Date(value).getTime())
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return Array.isArray(stored) ? stored.filter((timestamp) => Number(timestamp) > cutoff) : []
  } catch {
    return []
  }
}

function writeInspectionRequestLog(entries) {
  try { window.localStorage.setItem(CATALOG_INSPECTION_REQUESTS_KEY, JSON.stringify(entries.slice(-INSPECTION_DAILY_LIMIT))) } catch { /* Caché opcional. */ }
}

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function inspectSearchConsoleCatalog(urls, { onProgress, onResult, priorities = {}, storedResults = {} } = {}) {
  if (catalogInspectionPromise) return catalogInspectionPromise
  catalogInspectionPromise = inspectSearchConsoleCatalogInternal(urls, { onProgress, onResult, priorities, storedResults })
  try { return await catalogInspectionPromise } finally { catalogInspectionPromise = null }
}

let catalogInspectionPromise = null

async function inspectSearchConsoleCatalogInternal(urls, { onProgress, onResult, priorities = {}, storedResults = {} } = {}) {
  const uniqueUrls = [...new Set(urls.filter((url) => isCanonicalProductUrl(url)))]
  const stored = { ...readCatalogInspectionCache(), ...storedResults }
  const results = {}
  const now = Date.now()

  uniqueUrls.forEach((url) => {
    const item = stored[url]
    const age = item?.checkedAt ? now - new Date(item.checkedAt).getTime() : Infinity
    const cacheTtl = item?.error || item?.updateError ? INSPECTION_CACHE_ERROR_TTL : INSPECTION_CACHE_TTL
    if (item && item.checkedAt && age < cacheTtl && !priorities[url]?.force && !item.updateError) results[url] = item
  })

  const pending = uniqueUrls.filter((url) => !results[url]).sort((a, b) => (priorities[b]?.weight || 0) - (priorities[a]?.weight || 0))
  const requests = readInspectionRequestLog()
  const minuteCutoff = now - 60 * 1000
  const minuteRequests = requests.filter((timestamp) => timestamp > minuteCutoff).length
  const available = Math.max(0, Math.min(INSPECTION_DAILY_LIMIT - requests.length, INSPECTION_MINUTE_LIMIT - minuteRequests))
  const limited = pending.slice(available)
  const requestLog = [...requests]
  const runId = new Date(now).toISOString()
  const pendingWrites = []
  let firstPersistenceAt = null
  let cursor = 0
  let completed = uniqueUrls.length - pending.length
  onProgress?.({ completed, total: uniqueUrls.length, cached: completed, limited: limited.length, startedAt: now, etaMs: 0 })
  const runWorker = async () => {
    while (cursor < available) {
      const index = cursor
      cursor += 1
      const url = pending[index]
      let inspection
      try {
        inspection = { ...(await inspectSearchConsoleUrlWithRetry(url)), runId }
      } catch (error) {
        const previous = stored[url]
        inspection = previous?.checkedAt
          ? { ...previous, url, runId, lastAttemptAt: new Date().toISOString(), updateError: error.message, retryable: isRetryableInspectionError(error) }
          : { url, runId, checkedAt: new Date().toISOString(), error: error.message, lastAttemptAt: new Date().toISOString(), retryable: isRetryableInspectionError(error) }
      }
      results[url] = inspection
      requestLog.push(Date.now())
      writeCatalogInspectionCache({ ...stored, ...results })
      writeInspectionRequestLog(requestLog)
      completed += 1
      if (onResult) {
        firstPersistenceAt ||= Date.now()
        pendingWrites.push(Promise.resolve(onResult(inspection)))
      }
      const elapsed = Math.max(1, Date.now() - now)
      const etaMs = completed > uniqueUrls.length - pending.length ? Math.round((elapsed / (completed - (uniqueUrls.length - pending.length))) * Math.max(0, uniqueUrls.length - completed)) : 0
      onProgress?.({ completed, total: uniqueUrls.length, cached: uniqueUrls.length - pending.length, limited: limited.length, startedAt: now, etaMs })
    }
  }
  await Promise.all(Array.from({ length: Math.min(INSPECTION_CONCURRENCY, available) }, runWorker))
  const searchConsoleMs = Date.now() - now
  onProgress?.({ completed, total: uniqueUrls.length, cached: uniqueUrls.length - pending.length, limited: limited.length, startedAt: now, etaMs: 0, searchConsoleMs })
  await Promise.allSettled(pendingWrites)
  const persistenceMs = firstPersistenceAt ? Date.now() - firstPersistenceAt : 0

  const checkedAt = Object.values(results).map((item) => item.checkedAt).filter(Boolean).sort().at(-1) || null
  return { results, checked: pending.length - limited.length, cached: uniqueUrls.length - pending.length, limited: limited.length, checkedAt, durationMs: Date.now() - now, timings: { searchConsoleMs, persistenceMs } }
}

export async function fetchSearchConsoleReport({ period, startDate, endDate }) {
  if (!CLIENT_ID) return { status: 'not-configured', data: null }
  requireToken()
  const key = `${activeProperty}:${period}:${startDate || ''}:${endDate || ''}`
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return { status: 'connected', data: cached.data }
  const currentRange = rangeFor(period, startDate, endDate)
  const previousRange = rangeFor(period, startDate, endDate, true)
  const [current, previous, sitemapData] = await withWorkingProperty((site) => Promise.all([performance(currentRange, site), performance(previousRange, site), sitemap(site)]))
  const currentData = aggregate(current.rows)
  const previousData = aggregate(previous.rows)
  const previousQueries = new Map(previousData.queries.map((row) => [row.query, row]))
  currentData.queries = currentData.queries.map((row) => ({ ...row, variation: row.position == null || previousQueries.get(row.query)?.position == null ? null : row.position - previousQueries.get(row.query).position }))
  const data = { ...currentData, previous: previousData.summary, lastSync: new Date().toISOString(), sitemap: sitemapData, inspection: null, recommendations: [] }
  cache.set(key, { data, expiresAt: Date.now() + 5 * 60 * 1000 })
  return { status: 'connected', data }
}
