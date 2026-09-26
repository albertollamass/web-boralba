import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase/client.js'

// Adaptador Firestore del puerto SettingsRepository (documento único:
// site_settings/general). Mantiene la copia local inmediata en localStorage.

const STORAGE_KEY = 'boralba-settings'
const DOC_ID = 'general'

export const firestoreSettingsRepository = {
  getCachedSync(defaults) {
    try {
      return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) }
    } catch {
      return { ...defaults }
    }
  },

  async loadSettings() {
    if (!db) return null
    const snap = await getDoc(doc(db, COLLECTIONS.SITE_SETTINGS, DOC_ID))
    return snap.exists() ? snap.data() : null
  },

  async saveSettings(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Sin almacenamiento local se sigue guardando en la nube.
    }
    if (!db) return
    const { ...fields } = next
    await setDoc(doc(db, COLLECTIONS.SITE_SETTINGS, DOC_ID), { ...fields, updatedAt: serverTimestamp() }, { merge: true })
  },
}
