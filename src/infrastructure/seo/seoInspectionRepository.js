import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase/client.js'

const documentId = (url) => encodeURIComponent(url).slice(0, 1500)
const waitForUser = () => {
  if (!auth) return Promise.resolve(null)
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return new Promise((resolve) => {
    let settled = false
    let unsubscribe = () => {}
    let timeoutId
    const finish = (user) => {
      if (settled) return
      settled = true
      unsubscribe()
      window.clearTimeout(timeoutId)
      resolve(user || null)
    }
    unsubscribe = onAuthStateChanged(auth, finish)
    if (settled) unsubscribe()
    if (!settled) timeoutId = window.setTimeout(() => finish(auth.currentUser), 10000)
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
    const writes = [setDoc(doc(db, COLLECTIONS.SEO_INSPECTIONS, documentId(result.url)), current, { merge: true })]
    if (!result.updateError && !result.error && result.checkedAt) {
      const history = { ...result, stateVersion: 1, savedAt: current.savedAt, savedBy: current.savedBy }
      writes.push(setDoc(doc(db, COLLECTIONS.SEO_INSPECTION_HISTORY, `${documentId(result.url)}_${Date.now()}`), history))
      const [currentWrite, historyWrite] = await Promise.allSettled(writes)
      if (currentWrite.status === 'rejected') throw currentWrite.reason
      return { result: current, history: historyWrite.status === 'fulfilled' ? history : null, historyError: historyWrite.status === 'rejected' ? historyWrite.reason : null }
    }
    await writes[0]
    return { result: current, history: null }
  },
}
