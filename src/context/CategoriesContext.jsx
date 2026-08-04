import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildCategoryIndex, ROOT } from '../data/categories'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { logError } from '../lib/logger'

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
      } catch (error) {
        if (cancelled) return
        logError('categories/fetch', error)
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
    if (!supabase) return Promise.resolve(newCat)
    return supabase
      .from(TABLE)
      .upsert({ id: newCat.slug, data: newCat, created_at: new Date().toISOString() })
      .then(() => {
        setSyncStatus('cloud')
        return newCat
      })
      .catch((error) => {
        logError('categories/insert', error, { slug: newCat.slug })
        setSyncStatus('error')
        throw error
      })
  }

  const updateCategory = (slug, updates) => {
    const merged = { ...updates, slug }
    setCategories((prev) => {
      const exists = prev.some((c) => c.slug === slug)
      return exists ? prev.map((c) => (c.slug === slug ? merged : c)) : [...prev, merged]
    })
    if (!supabase) return Promise.resolve(merged)
    return supabase
      .from(TABLE)
      .upsert({ id: slug, data: merged, created_at: new Date().toISOString() })
      .then(() => {
        setSyncStatus('cloud')
        return merged
      })
      .catch((error) => {
        logError('categories/update', error, { slug })
        setSyncStatus('error')
        throw error
      })
  }

  const deleteCategory = (slug) => {
    setCategories((prev) => prev.filter((c) => c.slug !== slug))
    if (supabase) {
      supabase
        .from(TABLE)
        .delete()
        .eq('id', slug)
        .then(() => setSyncStatus('cloud'))
        .catch((error) => {
          logError('categories/delete', error, { slug })
          setSyncStatus('error')
        })
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