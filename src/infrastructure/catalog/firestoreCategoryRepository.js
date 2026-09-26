import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured, COLLECTIONS } from '../firebase/client.js'
import { readCache, writeCache } from '../cache/indexedDbCache.js'

// Adaptador Firestore del puerto CategoryRepository (id del documento = slug).
// Incluye la caché local (TTL) y reintentos de lectura. Sin configuración
// actúa en modo local (las escrituras no hacen nada).

const CACHE_KEY = 'categories'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min

async function fetchRemoteCategories() {
  let lastError

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES))
      return snap.docs.map((d) => ({ slug: d.id, ...d.data() }))
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
    }
  }

  throw lastError
}

async function writeThrough(slug, present) {
  const cached = await readCache(CACHE_KEY, Infinity)
  if (!cached) return
  writeCache(
    CACHE_KEY,
    present
      ? cached.some((c) => c.slug === slug)
        ? cached.map((c) => (c.slug === slug ? present : c))
        : [...cached, present]
      : cached.filter((c) => c.slug !== slug),
  )
}

export const firestoreCategoryRepository = {
  isConfigured: () => isFirebaseConfigured && Boolean(db),

  async listCategories() {
    const cached = await readCache(CACHE_KEY, CACHE_TTL_MS)
    if (cached) return { items: cached, source: 'cache' }
    const items = await fetchRemoteCategories()
    writeCache(CACHE_KEY, items)
    return { items, source: 'cloud' }
  },

  async saveCategory(category) {
    if (!db) return
    const { slug, ...fields } = category
    await setDoc(
      doc(db, COLLECTIONS.CATEGORIES, slug),
      { ...fields, slug, updatedAt: serverTimestamp() },
      { merge: true },
    )
    writeThrough(slug, category)
  },

  async deleteCategory(slug) {
    if (!db) return
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, slug))
    writeThrough(slug, null)
  },
}
