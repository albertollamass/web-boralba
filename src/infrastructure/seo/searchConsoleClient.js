const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
const PROPERTY = 'https://boralba.es/'
const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const GIS_URL = 'https://accounts.google.com/gsi/client'
const API_ROOT = 'https://searchconsole.googleapis.com/webmasters/v3'
const cache = new Map()

let gisPromise
let accessToken = null
let tokenExpiresAt = 0

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

export async function connectSearchConsole() {
  if (!CLIENT_ID) throw new Error('Falta configurar VITE_GOOGLE_OAUTH_CLIENT_ID')
  const google = await loadGoogleIdentityServices()
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: READONLY_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || 'Google no concedió acceso a Search Console'))
          return
        }
        accessToken = response.access_token
        tokenExpiresAt = Date.now() + Math.max(1, Number(response.expires_in || 3600) - 30) * 1000
        resolve({ expiresAt: tokenExpiresAt })
      },
      error_callback: (error) => reject(new Error(error?.message || 'Se canceló la autorización de Google')),
    })
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' })
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
}

function requireToken() {
  if (!isSearchConsoleConnected()) throw new Error('La autorización de Google ha caducado. Vuelve a conectar la cuenta.')
  return accessToken
}

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
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
    throw new Error(`Search Console respondió HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`)
  }
  return response.json()
}

const sitePath = encodeURIComponent(PROPERTY)
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

async function performance(range) {
  return request(`/sites/${sitePath}/searchAnalytics/query`, {
    method: 'POST',
    body: JSON.stringify({ ...range, dimensions: ['date', 'query', 'page'], rowLimit: 25000, dataState: 'final' }),
  })
}

function aggregate(rows = []) {
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

async function sitemap() {
  const data = await request(`/sites/${sitePath}/sitemaps`)
  const item = (data.sitemap || []).find((entry) => entry.path === `${PROPERTY}sitemap.xml`) || data.sitemap?.[0]
  if (!item) return null
  return { status: item.isPending ? 'Pendiente' : item.errors ? 'Con errores' : 'Correcto', submitted: item.contents?.reduce((total, content) => total + Number(content.submitted || 0), 0) || null, errors: item.errors ?? null, submittedAt: item.submitted, lastRead: item.lastDownloaded }
}

export async function fetchSearchConsoleReport({ period, startDate, endDate }) {
  if (!CLIENT_ID) return { status: 'not-configured', data: null }
  requireToken()
  const key = `${period}:${startDate || ''}:${endDate || ''}`
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return { status: 'connected', data: cached.data }
  const currentRange = rangeFor(period, startDate, endDate)
  const previousRange = rangeFor(period, startDate, endDate, true)
  const [current, previous, sitemapData] = await Promise.all([performance(currentRange), performance(previousRange), sitemap()])
  const currentData = aggregate(current.rows)
  const previousData = aggregate(previous.rows)
  const previousQueries = new Map(previousData.queries.map((row) => [row.query, row]))
  currentData.queries = currentData.queries.map((row) => ({ ...row, variation: row.position == null || previousQueries.get(row.query)?.position == null ? null : row.position - previousQueries.get(row.query).position }))
  const data = { ...currentData, previous: previousData.summary, lastSync: new Date().toISOString(), sitemap: sitemapData, inspection: null, recommendations: [] }
  cache.set(key, { data, expiresAt: Date.now() + 5 * 60 * 1000 })
  return { status: 'connected', data }
}
