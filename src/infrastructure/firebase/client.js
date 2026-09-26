import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Punto de entrada al backend Firebase (adaptador de infraestructura).
// Configuración vía variables VITE_FIREBASE_* (Firebase Console > Project settings > Your apps > Web).
// Ninguna de estas claves es secreta: están pensadas para ir en el cliente.
// La seguridad real la ponen las Firestore Rules + Firebase Auth.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let app = null
if (isFirebaseConfigured && getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else if (getApps().length > 0) {
  app = getApps()[0]
}

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Nombres de colecciones en Firestore.
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SITE_SETTINGS: 'site_settings',
  ADMINS: 'admins', // id = uid de Firebase Auth, { role }
  LOGS: 'logs',
  USAGE: 'usage', // un documento por día: `usage/YYYY-MM-DD`
}
