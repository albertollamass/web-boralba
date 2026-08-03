import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildCategoryIndex, ROOT } from '../data/categories'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const TABLE = 'categories'
const CategoriesContext = createContext(null)

async function fetchRemoteCategories() {
  const { data, error } = await supabase.from(TABLE).select('id, data').order('created_at')
  if (error) throw error
  return (data || []).map((row) => row.data)
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!isSupabaseConfigured) {
        setCategories([])
        setSyncStatus('error')
        setHydrated(true)
        return
      }
      try {
        const remote = await fetchRemoteCategories()
        if (cancelled) return
        setCategories(remote)
        setSyncStatus('cloud')
      } catch {
        if (cancelled) return
        setCategories([])
        setSyncStatus('error')
      }
      setHydrated(true)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const index = useMemo(() => buildCategoryIndex(categories), [categories])

  const addCategory = (cat) => {
    const newCat = { ...cat }
    setCategories((prev) => [...prev, newCat])
    if (supabase) {
      supabase
        .from(TABLE)
        .upsert({ id: newCat.slug, data: newCat, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
    return newCat
  }

  const updateCategory = (slug, updates) => {
    const merged = { ...updates, slug }
    setCategories((prev) => {
      const exists = prev.some((c) => c.slug === slug)
      return exists ? prev.map((c) => (c.slug === slug ? merged : c)) : [...prev, merged]
    })
    if (supabase) {
      supabase
        .from(TABLE)
        .upsert({ id: slug, data: merged, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
  }

  const deleteCategory = (slug) => {
    setCategories((prev) => prev.filter((c) => c.slug !== slug))
    if (supabase) {
      supabase
        .from(TABLE)
        .delete()
        .eq('id', slug)
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
  }

  const value = {
    categories,
    ...index,
    ROOT,
    addCategory,
    updateCategory,
    deleteCategory,
    hydrated,
    syncStatus,
    cloudEnabled: isSupabaseConfigured,
  }

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories debe usarse dentro de CategoriesProvider')
  return ctx
}