import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase/client.js'

// Destino persistente del log de errores (puerto implícito de logging).
// Solo escribe en producción con backend configurado; nunca lanza.
export async function firestoreLogger(context, error, extra) {
  if (!import.meta.env.PROD || !db) return

  const message =
    error?.message || error?.code || (error instanceof Error ? error.message : String(error || 'Error desconocido'))
  const details = { ...(extra || {}) }
  if (error && typeof error === 'object' && error.stack) {
    details.stack = error.stack.split('\n').slice(0, 5)
  }

  await addDoc(collection(db, COLLECTIONS.LOGS), {
    context,
    message,
    user_id: auth?.currentUser?.uid ?? null,
    details,
    created_at: serverTimestamp(),
  })
}
