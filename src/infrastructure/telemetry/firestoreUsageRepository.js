import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase/client.js'

// Adaptador Firestore del puerto UsageRepository (contador diario `usage/YYYY-MM-DD`).
export const firestoreUsageRepository = {
  async getDay(day) {
    if (!db) return null
    const snap = await getDoc(doc(db, COLLECTIONS.USAGE, day))
    return snap.exists() ? snap.data() : null
  },

  async saveDay(day, data) {
    if (!db) return
    await setDoc(doc(db, COLLECTIONS.USAGE, day), { ...data, updatedAt: serverTimestamp() }, { merge: true })
  },
}
