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
  if (!response.ok) { const detail = await response.text().catch(() => ''); const error = new Error(`Analytics respondió HTTP ${response.status}`); error.technical = detail ? detail.slice(0, 500) : `HTTP ${response.status}`; throw error }
  return response.json()
}

const metric = (name) => ({ name })
const dimension = (name) => ({ name })
const value = (row, index) => row?.metricValues?.[index]?.value == null ? 0 : Number(row.metricValues[index].value)
const text = (row, index) => row?.dimensionValues?.[index]?.value || '(sin datos)'

async function checkCompatibility({ dimensions, metrics }) {
  const requestedDimensions = new Set(dimensions)
  const requestedMetrics = new Set(metrics)
  const data = await request('checkCompatibility', { dimensions: dimensions.map(dimension), metrics: metrics.map(metric) })
  // La respuesta puede contener metadatos adicionales. Solo los campos enviados
  // en esta consulta pueden hacerla incompatible.
  const incompatibleDimensions = (data.dimensionCompatibilities || [])
    .filter((item) => requestedDimensions.has(item.dimensionMetadata?.apiName) && item.compatibility !== 'COMPATIBLE')
    .map((item) => item.dimensionMetadata.apiName)
  const incompatibleMetrics = (data.metricCompatibilities || [])
    .filter((item) => requestedMetrics.has(item.metricMetadata?.apiName) && item.compatibility !== 'COMPATIBLE')
    .map((item) => item.metricMetadata.apiName)
  if (incompatibleDimensions.length || incompatibleMetrics.length) {
    const fields = [...incompatibleDimensions.map((item) => `dimensión ${item}`), ...incompatibleMetrics.map((item) => `métrica ${item}`)]
    const error = new Error(`Combinación incompatible: ${fields.join(', ')}`)
    error.technical = JSON.stringify({ dimensions: incompatibleDimensions, metrics: incompatibleMetrics })
    throw error
  }
}

async function report({ startDate, endDate, dimensions, metrics, limit = 100, dimensionFilter }) {
  try {
    await checkCompatibility({ dimensions, metrics })
    const data = await request('runReport', { dateRanges: [{ startDate, endDate }], dimensions: dimensions.map(dimension), metrics: metrics.map(metric), limit: String(limit), keepEmptyRows: true, ...(dimensionFilter ? { dimensionFilter } : {}) })
    const rows = (data.rows || []).map((row) => ({ dimensions: dimensions.map((_, index) => text(row, index)), metrics: metrics.map((_, index) => value(row, index)) }))
    return { rows, state: rows.length ? 'ready' : 'empty', error: null }
  } catch (error) {
    return { rows: [], state: 'error', error: { message: error instanceof Error ? error.message : 'No se pudo consultar este apartado.', technical: error?.technical || error?.stack || String(error) } }
  }
}

const viewItemFilter = { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'view_item' } } }
const reports = [
  ['totals', { metrics: ['activeUsers', 'newUsers', 'sessions', 'averageSessionDuration', 'screenPageViews', 'eventCount'], dimensions: ['date'], limit: 1000 }],
  ['timeline', { metrics: ['activeUsers', 'sessions'], dimensions: ['date'], limit: 1000 }],
  ['products', { metrics: ['eventCount'], dimensions: ['itemId', 'itemName'], limit: 25, dimensionFilter: viewItemFilter }],
  ['categories', { metrics: ['eventCount'], dimensions: ['itemCategory'], limit: 25, dimensionFilter: viewItemFilter }],
  ['searches', { metrics: ['eventCount'], dimensions: ['searchTerm'], limit: 25 }],
  ['sources', { metrics: ['activeUsers', 'sessions'], dimensions: ['sessionDefaultChannelGroup'], limit: 15 }],
  ['geography', { metrics: ['activeUsers', 'sessions'], dimensions: ['country', 'city'], limit: 25 }],
  ['devices', { metrics: ['activeUsers', 'sessions'], dimensions: ['deviceCategory'], limit: 10 }],
  ['landing', { metrics: ['sessions', 'activeUsers'], dimensions: ['landingPagePlusQueryString'], limit: 25 }],
  ['events', { metrics: ['eventCount'], dimensions: ['eventName'], limit: 100 }],
]

function rangeBefore({ startDate, endDate }) {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  const duration = Math.max(0, end - start)
  const previousEnd = new Date(start.getTime() - 86400000)
  const previousStart = new Date(previousEnd.getTime() - duration)
  return { startDate: previousStart.toISOString().slice(0, 10), endDate: previousEnd.toISOString().slice(0, 10) }
}

function totalFrom(result) {
  if (result.error) return null
  return result.rows.reduce((total, row) => {
    total.activeUsers += row.metrics[0]; total.newUsers += row.metrics[1]; total.sessions += row.metrics[2]
    total.engagement += row.metrics[3] * row.metrics[2]; total.views += row.metrics[4]; total.events += row.metrics[5]
    return total
  }, { activeUsers: 0, newUsers: 0, sessions: 0, engagement: 0, views: 0, events: 0 })
}

async function loadReports(range) {
  const results = await Promise.all(reports.map(([, config]) => report({ ...config, ...range })))
  return Object.fromEntries(results.map((result, index) => [reports[index][0], result]))
}

export async function fetchAnalyticsReport(range) {
  const previousRange = rangeBefore(range)
  const [current, previousTotals] = await Promise.all([
    loadReports(range),
    report({ ...reports[0][1], ...previousRange }),
  ])
  const eventRows = current.events.rows
  const eventMap = Object.fromEntries(eventRows.map((row) => [row.dimensions[0], row.metrics[0]]))
  const errors = Object.fromEntries(Object.entries(current).filter(([, result]) => result.error).map(([name, result]) => [name, result.error]))
  const total = totalFrom(current.totals)
  const previous = totalFrom(previousTotals)
  return { status: 'ready', data: {
    total: total ? { ...total, recurringUsers: Math.max(0, total.activeUsers - total.newUsers), averageSessionDuration: total.sessions ? total.engagement / total.sessions : 0 } : null,
    previous: previous ? { ...previous, recurringUsers: Math.max(0, previous.activeUsers - previous.newUsers), averageSessionDuration: previous.sessions ? previous.engagement / previous.sessions : 0 } : null,
    errors,
    states: Object.fromEntries(Object.entries(current).map(([name, result]) => [name, result.state])),
    timeline: current.timeline.rows.map((row) => ({ date: row.dimensions[0], activeUsers: row.metrics[0], sessions: row.metrics[1] })),
    products: current.products.rows.map((row) => ({ id: row.dimensions[0], name: row.dimensions[1], views: row.metrics[0] })),
    categories: current.categories.rows.map((row) => ({ name: row.dimensions[0], views: row.metrics[0] })),
    searches: current.searches.rows.map((row) => ({ term: row.dimensions[0], searches: row.metrics[0] })),
    sources: current.sources.rows.map((row) => ({ name: row.dimensions[0], users: row.metrics[0], sessions: row.metrics[1] })),
    geography: current.geography.rows.map((row) => ({ country: row.dimensions[0], city: row.dimensions[1], users: row.metrics[0], sessions: row.metrics[1] })),
    devices: current.devices.rows.map((row) => ({ name: row.dimensions[0], users: row.metrics[0], sessions: row.metrics[1] })),
    landing: current.landing.rows.map((row) => ({ page: row.dimensions[0], sessions: row.metrics[0], users: row.metrics[1] })),
    funnel: { addToQuote: eventMap.add_to_quote, started: eventMap.quote_request_start, sent: eventMap.quote_request_success, contactSent: eventMap.contact_form_success, removed: eventMap.remove_from_quote },
    events: eventMap,
  } }
}
