import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'

const AuthContext = createContext(null)

async function fetchRole(uid) {
  if (!uid) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .maybeSingle()
  if (error) {
    logError('auth/profile', error, { uid })
    return null
  }
  return data?.role ?? null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false

    const loadProfile = async (uid) => {
      const nextRole = await fetchRole(uid)
      if (cancelled) return
      setRole(nextRole)
    }

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const u = data.session?.user ?? null
        if (cancelled) return
        setUser(u)
        await loadProfile(u?.id)
      })
      .catch((error) => {
        if (!cancelled) logError('auth/session', error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!cancelled) loadProfile(u?.id)
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  // Resuelve con el rol ya cargado para que el login pueda navegar
  // a /admin sin que el guard lo rebote a home por rol aún null.
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      logError('auth/login', error)
      throw error
    }
    const { data: { session } } = await supabase.auth.getSession()
    const u = session?.user ?? null
    setUser(u)
    const nextRole = await fetchRole(u?.id)
    setRole(nextRole)
    return nextRole
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) logError('auth/logout', error)
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