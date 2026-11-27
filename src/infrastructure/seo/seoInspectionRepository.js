import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase/client.js'

const documentId = (url) => encodeURIComponent(url).slice(0, 1500)
const waitForUser = () => {
  if (!auth) return Promise.resolve(null)
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return new Promise((resolve) => {
    let settled = false
    const finish = (user) => {
      if (settled) return
      settled = true
      unsubscribe?.()
      resolve(user || null)
    }
    const unsubscribe = auth.onIdTokenChanged ? auth.onIdTokenChanged(finish) : null
    window.setTimeout(() => finish(auth.currentUser), 10000)
  })
}

export const seoInspectionRepository = {
  async list() {
    const user = await waitForUser()
    if (!db || !user) return []
    const snapshot = await getDocs(collection(db, COLLECTIONS.SEO_INSPECTIONS))
    return snapshot.docs.map((item) => item.data())
  },

  async listHistory() {
    const user = await waitForUser()
    if (!db || !user) return []
    const snapshot = await getDocs(query(collection(db, COLLECTIONS.SEO_INSPECTION_HISTORY), orderBy('checkedAt', 'desc'), limit(5000)))
    return snapshot.docs.map((item) => item.data()).sort((a, b) => String(a.checkedAt || '').localeCompare(String(b.checkedAt || '')))
  },

  async save(result) {
    const user = await waitForUser()
    if (!db || !user || !result?.url) return null
    const current = {
      ...result,
      savedAt: new Date().toISOString(),
      savedBy: { uid: user.uid, email: user.email || '' },
      ...(result.checkedAt && !result.updateError && !result.error ? { updateError: null, error: null, retryable: null } : {}),
    }
    await setDoc(doc(db, COLLECTIONS.SEO_INSPECTIONS, documentId(result.url)), current, { merge: true })
    if (!result.updateError && !result.error && result.checkedAt) {
      const history = { ...result, stateVersion: 1, savedAt: current.savedAt, savedBy: current.savedBy }
      await setDoc(doc(db, COLLECTIONS.SEO_INSPECTION_HISTORY, `${documentId(result.url)}_${Date.now()}`), history)
      return { result: current, history }
    }
    return { result: current, history: null }
  },
}
