import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { getApps } from 'firebase/app'

const CONSENT_KEY = 'boralba_cookies_accepted'
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
let analytics = null
let initialized = false
const lastEvents = new Map()

const consentGranted = () => {
  try { return window.localStorage.getItem(CONSENT_KEY) === 'all' } catch { return false }
}

async function initialize() {
  if (initialized || !MEASUREMENT_ID || !getApps().length || !consentGranted()) return
  if (!(await isSupported())) return
  analytics = getAnalytics(getApps()[0])
  initialized = true
}

export function createGoogleAnalytics() {
  const track = async (name, params = {}) => {
    if (!consentGranted()) return false
    const eventKey = `${name}:${JSON.stringify(params)}`
    if (lastEvents.get(eventKey) && Date.now() - lastEvents.get(eventKey) < 1000) return false
    lastEvents.set(eventKey, Date.now())
    await initialize()
    if (!analytics || !consentGranted()) return false
    const safeParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 100) : value]))
    if (import.meta.env.DEV || window.localStorage.getItem('boralba_analytics_debug') === '1') safeParams.debug_mode = 1
    logEvent(analytics, name, { ...safeParams, send_to: MEASUREMENT_ID })
    return true
  }
  const onConsentChanged = () => {
    if (consentGranted()) initialize().catch(() => {})
    else {
      const current = analytics
      analytics = null
      initialized = false
      if (current) setAnalyticsCollectionEnabled(current, false).catch(() => {})
    }
  }
  window.addEventListener('boralba-consent-changed', onConsentChanged)
  return { isConfigured: Boolean(MEASUREMENT_ID), track, dispose: () => window.removeEventListener('boralba-consent-changed', onConsentChanged) }
}
