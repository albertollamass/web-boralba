import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured, COLLECTIONS } from '../firebase/client.js'
import { readCache, writeCache } from '../cache/indexedDbCache.js'

// Adaptador Firestore del puerto ProductRepository.
// Incluye la caché local (TTL): las visitas repetidas cuestan 0 lecturas.
// Sin configuración actúa en modo local (las escrituras no hacen nada).

const CACHE_KEY = 'products'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min

function sortByRecent(products) {
  // Orden: los más recientes primero (por updatedAt/createdAt si existen).
  products.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? a.updated_at?.toMillis?.() ?? 0
    const tb = b.updatedAt?.toMillis?.() ?? b.updated_at?.toMillis?.() ?? 0
    if (ta !== tb) return tb - ta
    const ca = a.createdAt?.toMillis?.() ?? 0
    const cb = b.createdAt?.toMillis?.() ?? 0
    return cb - ca
  })
}

async function writeThrough(id, present) {
  const cached = await readCache(CACHE_KEY, Infinity)
  if (!cached) return
  writeCache(
    CACHE_KEY,
    present
      ? cached.some((p) => p.id === id)
        ? cached.map((p) => (p.id === id ? present : p))
        : [present, ...cached]
      : cached.filter((p) => p.id !== id),
  )
}

export const firestoreProductRepository = {
  isConfigured: () => isFirebaseConfigured && Boolean(db),

  async listProducts() {
    const cached = await readCache(CACHE_KEY, CACHE_TTL_MS)
    if (cached) return { items: cached, source: 'cache' }
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS))
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    sortByRecent(items)
    writeCache(CACHE_KEY, items)
    return { items, source: 'cloud' }
  },

  async saveProduct(product) {
    if (!db) return
    const { id, ...fields } = product
    // createdAt solo en creación; updatedAt siempre.
    await setDoc(
      doc(db, COLLECTIONS.PRODUCTS, id),
      { ...fields, updatedAt: serverTimestamp() },
      { merge: true },
    )
    writeThrough(id, product)
  },

  async deleteProduct(id) {
    if (!db) return
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id))
    writeThrough(id, null)
  },

  async clearProducts() {
    if (!db) return
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
    writeCache(CACHE_KEY, [])
  },
}
