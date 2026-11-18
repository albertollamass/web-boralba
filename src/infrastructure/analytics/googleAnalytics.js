import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { getApps } from 'firebase/app'

const CONSENT_KEY = 'boralba_cookies_accepted'
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
let analytics = null
let initialized = false

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
    await initialize()
    if (!analytics) return false
    logEvent(analytics, name, { ...params, send_to: MEASUREMENT_ID })
    return true
  }
  const start = () => initialize().catch(() => {})
  window.addEventListener('boralba-consent-changed', start)
  return { isConfigured: Boolean(MEASUREMENT_ID), track, dispose: () => window.removeEventListener('boralba-consent-changed', start) }
}
