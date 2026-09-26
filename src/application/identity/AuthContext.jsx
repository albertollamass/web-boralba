import { createContext, useContext, useEffect, useState } from 'react'
import { logError } from '../logging/logger.js'

const AuthContext = createContext(null)

/**
 * Sesión y rol del panel de administración. No conoce Firebase Auth: trabaja
 * contra el puerto `authService` (ver `../ports/identity.js`) inyectado por
 * el composition root.
 */
export function AuthProvider({ children, authService }) {
  if (!authService) throw new Error('AuthProvider necesita un authService (puerto AuthService)')
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authService.isConfigured()) {
      setLoading(false)
      return
    }
    let cancelled = false

    const loadRole = async (u) => {
      if (!u) {
        if (!cancelled) setRole(null)
        return
      }
      try {
        const nextRole = await authService.getRole(u)
        if (!cancelled) setRole(nextRole)
      } catch (error) {
        logError('auth/profile', error, { uid: u.uid })
      }
    }

    const unsubscribe = authService.observeAuth(async (u) => {
      if (cancelled) return
      setUser(u)
      await loadRole(u)
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [authService])

  // Resuelve con el rol ya cargado para que el login pueda navegar
  // a /admin sin que el guard lo rebote a home por rol aún null.
  const signIn = async (email, password) => {
    try {
      const u = await authService.signIn(email, password)
      setUser(u)
      const nextRole = await authService.getRole(u).catch((error) => {
        logError('auth/profile', error, { uid: u?.uid })
        return null
      })
      setRole(nextRole)
      return nextRole
    } catch (error) {
      logError('auth/login', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setRole(null)
    } catch (error) {
      logError('auth/logout', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, isAdmin: role === 'admin', loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
