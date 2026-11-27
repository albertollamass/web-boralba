const { onSchedule } = require('firebase-functions/v2/scheduler')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { initializeApp } = require('firebase-admin/app')
const { GoogleAuth } = require('google-auth-library')

initializeApp()
const db = getFirestore()
const INSPECTIONS = 'seo_inspections'
const PRODUCTS = 'products'
const LOCK = 'seo_scheduler/catalog'
const PROPERTY = 'https://boralba.es/'
const DAILY_LIMIT = 1900
const CONCURRENCY = 4
const CACHE_TTL = 24 * 60 * 60 * 1000

const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const productUrl = (product) => `https://boralba.es/producto/${encodeURIComponent(product.id)}/${encodeURIComponent(slug(product.name))}/`
const documentId = (url) => encodeURIComponent(url).slice(0, 1500)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function inspect(auth, url, attempt = 0) {
  const token = await auth.getAccessToken()
  const response = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
  })
  if (!response.ok) {
    const error = new Error(`Search Console respondió HTTP ${response.status}`)
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await wait(750 * (2 ** attempt))
      return inspect(auth, url, attempt + 1)
    }
    throw error
  }
  const payload = await response.json()
  const indexStatus = payload.inspectionResult?.indexStatusResult || {}
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

async function withLock(run) {
  const lockRef = db.doc(LOCK)
  const now = Date.now()
  const acquired = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(lockRef)
    if (snapshot.exists && Number(snapshot.data().expiresAt || 0) > now) return false
    transaction.set(lockRef, { expiresAt: now + 9 * 60 * 1000, startedAt: new Date().toISOString() })
    return true
  })
  if (!acquired) return { skipped: true }
  try { return await run() } finally { await lockRef.set({ expiresAt: 0, finishedAt: new Date().toISOString() }, { merge: true }) }
}

exports.scheduledSeoCatalogInspection = onSchedule({ schedule: 'every 24 hours', timeZone: 'Europe/Madrid', timeoutSeconds: 540, memory: '512MiB' }, () => withLock(async () => {
  const [productsSnapshot, inspectionsSnapshot] = await Promise.all([
    db.collection(PRODUCTS).get(),
    db.collection(INSPECTIONS).get(),
  ])
  const inspections = new Map(inspectionsSnapshot.docs.map((item) => [item.data().url, item.data()]))
  const now = Date.now()
  const products = productsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((product) => product.published !== false && !product.noindex && !product.seo?.noindex)
  const urls = products.map((product) => {
    const url = productUrl(product)
    const inspection = inspections.get(url)
    const age = inspection?.checkedAt ? now - new Date(inspection.checkedAt).getTime() : Infinity
    const state = inspection?.verdict === 'PASS' ? 'indexed' : inspection?.error || !inspection ? 'priority' : 'pending'
    const changed = product.updatedAt || product.modifiedAt || product.createdAt
    const modified = changed && now - new Date(changed).getTime() < 7 * 24 * 60 * 60 * 1000
    return { url, weight: !inspection || state === 'priority' ? 100 : modified ? 90 : state === 'pending' ? 80 : age > CACHE_TTL ? 50 : 0, age, modified, followUp: Boolean(inspection?.followUp) }
  }).filter(({ age, modified, followUp }) => age >= CACHE_TTL || modified || followUp).sort((a, b) => b.weight - a.weight).slice(0, DAILY_LIMIT)
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] })
  let cursor = 0
  const worker = async () => {
    while (cursor < urls.length) {
      const item = urls[cursor]
      cursor += 1
      let result
      try { result = await inspect(auth, item.url) } catch (error) {
        const previous = inspections.get(item.url)
        result = previous?.checkedAt
          ? { ...previous, url: item.url, lastAttemptAt: new Date().toISOString(), updateError: error.message }
          : { url: item.url, checkedAt: new Date().toISOString(), error: error.message, lastAttemptAt: new Date().toISOString() }
      }
      await db.collection(INSPECTIONS).doc(documentId(item.url)).set({ ...result, ...(result.updateError || result.error ? {} : { updateError: null, error: null }), savedAt: FieldValue.serverTimestamp(), source: 'scheduled-function' }, { merge: true })
      if (!result.updateError && !result.error) await db.collection('seo_inspection_history').doc(`${documentId(item.url)}_${Date.now()}`).set({ ...result, source: 'scheduled-function', savedAt: FieldValue.serverTimestamp() })
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker))
  return { checked: urls.length }
}))
