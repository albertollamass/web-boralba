const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
const PROPERTY_ID = import.meta.env.VITE_GA_PROPERTY_ID || '565830142'
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const GIS_URL = 'https://accounts.google.com/gsi/client'
const API_ROOT = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`

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

async function request(body) {
  if (!isAnalyticsConnected()) throw new Error('La autorización de Analytics ha caducado. Vuelve a conectar la cuenta.')
  const response = await fetch(API_ROOT, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (response.status === 401) { accessToken = null; tokenExpiresAt = 0; throw new Error('La autorización de Analytics ha caducado. Vuelve a conectar la cuenta.') }
  if (!response.ok) { const detail = await response.text().catch(() => ''); throw new Error(`Analytics respondió HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`) }
  return response.json()
}

const metric = (name) => ({ name })
const dimension = (name) => ({ name })
const value = (row, index) => row?.metricValues?.[index]?.value == null ? 0 : Number(row.metricValues[index].value)
const text = (row, index) => row?.dimensionValues?.[index]?.value || '(sin datos)'

async function report({ startDate, endDate, dimensions, metrics, limit = 100 }) {
  const data = await request({ dateRanges: [{ startDate, endDate }], dimensions: dimensions.map(dimension), metrics: metrics.map(metric), limit: String(limit), keepEmptyRows: true })
  return (data.rows || []).map((row) => ({ dimensions: dimensions.map((_, index) => text(row, index)), metrics: metrics.map((_, index) => value(row, index)) }))
}

export async function fetchAnalyticsReport({ startDate, endDate }) {
  const [totals, timeline, products, categories, searches, sources, geography, devices, landing, events] = await Promise.all([
    report({ startDate, endDate, metrics: ['activeUsers', 'newUsers', 'sessions', 'averageSessionDuration', 'screenPageViews', 'eventCount'], dimensions: ['date'], limit: 1000 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['date'], limit: 1000 }),
    report({ startDate, endDate, metrics: ['itemViews', 'eventCount'], dimensions: ['itemName'], limit: 25 }),
    report({ startDate, endDate, metrics: ['itemViews'], dimensions: ['itemCategory'], limit: 25 }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['searchTerm'], limit: 25 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['sessionDefaultChannelGroup'], limit: 15 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['country', 'city'], limit: 25 }),
    report({ startDate, endDate, metrics: ['activeUsers', 'sessions'], dimensions: ['deviceCategory'], limit: 10 }),
    report({ startDate, endDate, metrics: ['sessions', 'activeUsers'], dimensions: ['landingPagePlusQueryString'], limit: 25 }),
    report({ startDate, endDate, metrics: ['eventCount'], dimensions: ['eventName'], limit: 100 }),
  ])
  const total = totals.reduce((result, row) => { result.activeUsers += row.metrics[0]; result.newUsers += row.metrics[1]; result.sessions += row.metrics[2]; result.engagement += row.metrics[3] * row.metrics[2]; result.views += row.metrics[4]; result.events += row.metrics[5]; return result }, { activeUsers: 0, newUsers: 0, sessions: 0, engagement: 0, views: 0, events: 0 })
  const eventMap = Object.fromEntries(events.map((row) => [row.dimensions[0], row.metrics[0]]))
  return {
     status: 'ready', data: { total: { ...total, recurringUsers: Math.max(0, total.activeUsers - total.newUsers), averageSessionDuration: total.sessions ? total.engagement / total.sessions : 0 }, timeline: timeline.map((r) => ({ date: r.dimensions[0], activeUsers: r.metrics[0], sessions: r.metrics[1] })), products: products.map((r) => ({ name: r.dimensions[0], views: r.metrics[0], events: r.metrics[1] })), categories: categories.map((r) => ({ name: r.dimensions[0], views: r.metrics[0] })), searches: searches.map((r) => ({ term: r.dimensions[0], searches: r.metrics[0] })), sources: sources.map((r) => ({ name: r.dimensions[0], users: r.metrics[0], sessions: r.metrics[1] })), geography: geography.map((r) => ({ country: r.dimensions[0], city: r.dimensions[1], users: r.metrics[0], sessions: r.metrics[1] })), devices: devices.map((r) => ({ name: r.dimensions[0], users: r.metrics[0], sessions: r.metrics[1] })), landing: landing.map((r) => ({ page: r.dimensions[0], sessions: r.metrics[0], users: r.metrics[1] })), funnel: { addToQuote: eventMap.add_to_quote || 0, started: eventMap.quote_request_start || 0, sent: eventMap.quote_request_success || 0, contactSent: eventMap.contact_form_success || 0, removed: eventMap.remove_from_quote || 0 }, events: eventMap } }
}
