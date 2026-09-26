// Caché local en IndexedDB para no releer Firestore en cada visita.
// Firestore cobra por documento leído; el catálogo cambia poco, así que se sirve
// la copia local si es fresca (TTL) y solo se descarga cuando caduca o no existe.
// Las escrituras del panel admin actualizan la caché al momento (write-through).

const DB_NAME = 'boralba-cache'
const STORE = 'kv'

function openDb() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } catch (e) {
      reject(e)
    }
  })
}

export async function readCache(key, ttlMs) {
  try {
    const db = await openDb()
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    db.close()
    if (!value || typeof value.ts !== 'number' || Date.now() - value.ts > ttlMs) return null
    return value.items ?? null
  } catch {
    return null
  }
}

export async function writeCache(key, items) {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({ ts: Date.now(), items }, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // Sin caché no se rompe nada: simplemente se leerá de la nube.
  }
}

export async function clearCache(key) {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // Ignorar: la caché es opcional.
  }
}
