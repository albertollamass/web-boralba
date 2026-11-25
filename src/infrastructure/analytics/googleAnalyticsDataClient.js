const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
const PROPERTY_ID = import.meta.env.VITE_GA_PROPERTY_ID || '565830142'
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const GIS_URL = 'https://accounts.google.com/gsi/client'
const API_ROOT = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}`

let gisPromise
let accessToken = null
let tokenExpiresAt = 0
let resumeBlocked = false

export const analyticsDataConfig = { clientId: CLIENT_ID, propertyId: PROPERTY_ID, isConfigured: Boolean(CLIENT_ID && PROPERTY_ID) }

function loadGIS() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google)
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_URL}"]`)
    const script = existing || document.createElement('script')
    script.onload = () => window.google?.accounts?.oauth2 ? resolve(window.google) : reject(new Error('Google Identity Services no está disponible'))
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'))
    if (!existing) { script.src = GIS_URL; script.async = true; script.defer = true; document.head.appendChild(script) }
  })
  return gisPromise
}

export function isAnalyticsConnected() { return Boolean(accessToken && Date.now() < tokenExpiresAt) }
export function canResumeAnalytics() { return !resumeBlocked }

export async function connectAnalytics({ loginHint, forceConsent = false } = {}) {
  if (!CLIENT_ID) throw new Error('Falta configurar VITE_GOOGLE_OAUTH_CLIENT_ID')
  const google = await loadGIS()
  resumeBlocked = false
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) { const error = new Error(response.error_description || 'Google no concedió acceso a Analytics'); error.code = response.error; reject(error); return }
        accessToken = response.access_token
        tokenExpiresAt = Date.now() + Math.max(1, Number(response.expires_in || 3600) - 30) * 1000
        resolve({ expiresAt: tokenExpiresAt })
      },
      error_callback: (error) => reject(new Error(error?.message || 'Se canceló la autorización de Google')),
    })
    client.requestAccessToken({ prompt: forceConsent ? 'consent' : '', login_hint: loginHint })
  })
}

export function disconnectAnalytics() {
  if (accessToken && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(accessToken, () => {})
  accessToken = null; tokenExpiresAt = 0; resumeBlocked = true
}

async function request(method, body) {
  if (!isAnalyticsConnected()) throw new Error('La autorización de Analytics ha caducado. Vuelve a conectar la cuenta.')
  const response = await fetch(`${API_ROOT}:${method}`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (response.status === 401) { accessToken = null; tokenExpiresAt = 0; throw new Error('La autorización de Analytics ha caducado. Vuelve a conectar la cuenta.') }
  if (!response.ok) { const detail = await response.text().catch(() => ''); throw new Error(`Analytics respondió HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`) }
  return response.json()
}

const metric = (name) => ({ name })
const dimension = (name) => ({ name })
const value = (row, index) => row?.metricValues?.[index]?.value == null ? 0 : Number(row.metricValues[index].value)
const text = (row, index) => row?.dimensionValues?.[index]?.value || '(sin datos)'

async function checkCompatibility({ dimensions, metrics }) {
  const data = await request('checkCompatibility', { dimensions: dimensions.map(dimension), metrics: metrics.map(metric) })
  const incompatibleDimensions = (data.dimensionCompatibilities || []).filter((item) => item.compatibility !== 'COMPATIBLE').map((item) => item.dimensionMetadata?.apiName || 'dimensión')
  const incompatibleMetrics = (data.metricCompatibilities || []).filter((item) => item.compatibility !== 'COMPATIBLE').map((item) => item.metricMetadata?.apiName || 'métrica')
  if (incompatibleDimensions.length || incompatibleMetrics.length) {
    const fields = [...incompatibleDimensions.map((item) => `dimensión ${item}`), ...incompatibleMetrics.map((item) => `métrica ${item}`)]
    throw new Error(`Combinación no compatible según checkCompatibility: ${fields.join(', ')}`)
  }
}

async function report({ startDate, endDate, dimensions, metrics, limit = 100, dimensionFilter }) {
  try {
    await checkCompatibility({ dimensions, metrics })
    const data = await request('runReport', { dateRanges: [{ startDate, endDate }], dimensions: dimensions.map(dimension), metrics: metrics.map(metric), limit: String(limit), keepEmptyRows: true, ...(dimensionFilter ? { dimensionFilter } : {}) })
    return { rows: (data.rows || []).map((row) => ({ dimensions: dimensions.map((_, index) => text(row, index)), metrics: metrics.map((_, index) => value(row, index)) })), error: null }
  } catch (error) {
    return { rows: [], error: error instanceof Error ? error.message : 'No se pudo consultar este apartado.' }
  }
}

export async function fetchAnalyticsReport({ startDate, endDate }) {
  const viewItemFilter = { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'view_item' } } }
  const results = await Promise.all([
    report({ startDate, endDate, metrics: ['activeUsers', 'newUsers', 'sessions', 'averageSessionDuration', 'screenPageViews', 'eventCount'], dimensions: ['date'], limit: 1000 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['date'], limit: 1000 }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['itemName'], limit: 25, dimensionFilter: viewItemFilter }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['itemCategory'], limit: 25, dimensionFilter: viewItemFilter }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['searchTerm'], limit: 25 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['sessionDefaultChannelGroup'], limit: 15 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['country', 'city'], limit: 25 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['deviceCategory'], limit: 10 }),
    report({ startDate, endDate, metrics: ['sessions', 'activeUsers'], dimensions: ['landingPagePlusQueryString'], limit: 25 }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['eventName'], limit: 100 }),
  ])
  const names = ['totals', 'timeline', 'products', 'categories', 'searches', 'sources', 'geography', 'devices', 'landing', 'events']
  const rows = results.map((result) => result.rows)
  const errors = Object.fromEntries(names.map((name, index) => [name, results[index].error]).filter(([, error]) => error))
  const total = errors.totals ? null : rows[0].reduce((result, row) => { result.activeUsers += row.metrics[0]; result.newUsers += row.metrics[1]; result.sessions += row.metrics[2]; result.engagement += row.metrics[3] * row.metrics[2]; result.views += row.metrics[4]; result.events += row.metrics[5]; return result }, { activeUsers: 0, newUsers: 0, sessions: 0, engagement: 0, views: 0, events: 0 })
  const eventMap = Object.fromEntries(rows[9].map((row) => [row.dimensions[0], row.metrics[0]]))
  return { status: 'ready', data: {
    total: total ? { ...total, recurringUsers: Math.max(0, total.activeUsers - total.newUsers), averageSessionDuration: total.sessions ? total.engagement / total.sessions : 0 } : null,
    errors,
    timeline: rows[1].map((row) => ({ date: row.dimensions[0], activeUsers: row.metrics[0], sessions: row.metrics[1] })),
    products: rows[2].map((row) => ({ name: row.dimensions[0], views: row.metrics[0], events: row.metrics[0] })),
    categories: rows[3].map((row) => ({ name: row.dimensions[0], views: row.metrics[0] })),
    searches: rows[4].map((row) => ({ term: row.dimensions[0], searches: row.metrics[0] })),
    sources: rows[5].map((row) => ({ name: row.dimensions[0], users: row.metrics[0], sessions: row.metrics[1] })),
    geography: rows[6].map((row) => ({ country: row.dimensions[0], city: row.dimensions[1], users: row.metrics[0], sessions: row.metrics[1] })),
    devices: rows[7].map((row) => ({ name: row.dimensions[0], users: row.metrics[0], sessions: row.metrics[1] })),
    landing: rows[8].map((row) => ({ page: row.dimensions[0], sessions: row.metrics[0], users: row.metrics[1] })),
    funnel: { addToQuote: eventMap.add_to_quote || 0, started: eventMap.quote_request_start || 0, sent: eventMap.quote_request_success || 0, contactSent: eventMap.contact_form_success || 0, removed: eventMap.remove_from_quote || 0 },
    events: eventMap,
  } }
}
