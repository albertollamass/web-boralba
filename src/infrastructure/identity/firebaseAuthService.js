import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase/client.js'
import { logError } from '../../application/logging/logger.js'

// Adaptador Firebase Auth del puerto AuthService.
export const firebaseAuthService = {
  isConfigured: () => Boolean(auth),

  observeAuth: (onChange) => onAuthStateChanged(auth, onChange),

  async signIn(email, password) {
    if (!auth) throw new Error('Firebase no está configurado')
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  async signOut() {
    if (!auth) return
    await firebaseSignOut(auth)
  },

  async getRole(user) {
    if (!user) return null
    // 1) Vía custom claim (recomendado en producción).
    try {
      const token = await user.getIdTokenResult()
      if (token.claims?.admin === true) return 'admin'
    } catch (error) {
      logError('auth/claims', error, { uid: user.uid })
    }
    // 2) Vía documento /admins/{uid} (arranque sin Cloud Function).
    if (!db) return null
    const snap = await getDoc(doc(db, COLLECTIONS.ADMINS, user.uid))
    return snap.exists() && snap.data()?.role === 'admin' ? 'admin' : null
  },
}
