import { doc, getDoc, collection, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase/client.js'

const draftId = (type, id) => encodeURIComponent(`${type}:${id}`)

export const seoDraftRepository = {
  async get(type, id) {
    if (!db) return null
    const snapshot = await getDoc(doc(db, COLLECTIONS.SEO_DRAFTS, draftId(type, id)))
    return snapshot.exists() ? snapshot.data() : null
  },

  async list() {
    if (!db) return []
    const snapshot = await getDocs(collection(db, COLLECTIONS.SEO_DRAFTS))
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  },

  async save(type, id, fields, status = 'draft-saved', metadata = {}) {
    if (!db || !auth?.currentUser) throw new Error('La sesión de administración no está disponible.')
    const user = auth.currentUser
    const reference = doc(db, COLLECTIONS.SEO_DRAFTS, draftId(type, id))
    await runTransaction(db, async (transaction) => {
      const previous = await transaction.get(reference)
      const history = previous.exists() && Array.isArray(previous.data().history) ? previous.data().history : []
      const nextFields = { ...(previous.exists() ? previous.data().fields || {} : {}), ...fields }
      const entry = {
        fields: nextFields,
        status,
        savedAt: new Date().toISOString(),
        savedBy: { uid: user.uid, email: user.email || '' },
      }
      transaction.set(reference, {
        entityType: type,
        entityId: id,
        fields: nextFields,
        status,
        ...metadata,
        history: [...history, entry],
        updatedAt: serverTimestamp(),
        updatedBy: { uid: user.uid, email: user.email || '' },
      }, { merge: true })
    })
  },

  async saveAnalysis(type, id, fields, status = 'proposal-pending', metadata = {}) {
    return this.save(type, id, fields, status, metadata)
  },

  async setStatus(type, id, status, metadata = {}) {
    if (!db || !auth?.currentUser) throw new Error('La sesión de administración no está disponible.')
    const reference = doc(db, COLLECTIONS.SEO_DRAFTS, draftId(type, id))
    await runTransaction(db, async (transaction) => {
      const previous = await transaction.get(reference)
      if (!previous.exists()) throw new Error('No existe un borrador para esta entidad.')
      const data = previous.data()
      const history = Array.isArray(data.history) ? data.history : []
      transaction.set(reference, {
        status,
        ...metadata,
        history: [...history, { fields: data.fields || {}, status, savedAt: new Date().toISOString(), savedBy: { uid: auth.currentUser.uid, email: auth.currentUser.email || '' } }],
        updatedAt: serverTimestamp(),
        updatedBy: { uid: auth.currentUser.uid, email: auth.currentUser.email || '' },
      }, { merge: true })
    })
  },

  async recordProposalDecision(type, id, proposalKey, decision, recommended) {
    if (!db || !auth?.currentUser) throw new Error('La sesión de administración no está disponible.')
    const reference = doc(db, COLLECTIONS.SEO_DRAFTS, draftId(type, id))
    await runTransaction(db, async (transaction) => {
      const previous = await transaction.get(reference)
      if (!previous.exists()) throw new Error('No existe un análisis guardado para esta entidad.')
      const data = previous.data()
      const decisions = { ...(data.proposalDecisions || {}), [proposalKey]: { decision, recommended, decidedAt: new Date().toISOString() } }
      const history = Array.isArray(data.history) ? data.history : []
      transaction.set(reference, {
        proposalDecisions: decisions,
        history: [...history, { fields: data.fields || {}, status: data.status || 'proposal-pending', proposalKey, decision, savedAt: new Date().toISOString(), savedBy: { uid: auth.currentUser.uid, email: auth.currentUser.email || '' } }],
        updatedAt: serverTimestamp(),
        updatedBy: { uid: auth.currentUser.uid, email: auth.currentUser.email || '' },
      }, { merge: true })
    })
  },
}
