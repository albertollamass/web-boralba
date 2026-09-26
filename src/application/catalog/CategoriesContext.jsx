import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildCategoryIndex, ROOT } from '../../domain/catalog/categoryTree.js'
import { logError } from '../logging/logger.js'

const CategoriesContext = createContext(null)

/**
 * Estado y casos de uso del árbol de categorías.
 * No conoce Firestore: trabaja contra el puerto `repository`
 * (ver `../ports/catalog.js`) inyectado por el composition root.
 */
export function CategoriesProvider({ children, repository, telemetry }) {
  if (!repository) throw new Error('CategoriesProvider necesita un repository (puerto CategoryRepository)')
  const [categories, setCategories] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!repository.isConfigured()) {
        // Firebase es la única fuente: sin configuración no hay catálogo local.
        setCategories([])
        setSyncStatus('error')
        setHydrated(true)
        return
      }
      try {
        const { items, source } = await repository.listCategories()
        if (cancelled) return
        setCategories(items)
        setSyncStatus(source === 'cache' ? 'cache' : 'cloud')
        if (source !== 'cache') telemetry?.trackReads('categories', items.length)
      } catch (error) {
        if (cancelled) return
        logError('categories/fetch', error)
        setSyncStatus('error')
      }
      setHydrated(true)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [repository, telemetry])

  const index = useMemo(() => buildCategoryIndex(categories), [categories])

  const addCategory = (cat) => {
    const newCat = { ...cat }
    setCategories((prev) => [...prev, newCat])
    return repository
      .saveCategory(newCat)
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
    return repository
      .saveCategory(merged)
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
    repository
      .deleteCategory(slug)
      .then(() => setSyncStatus('cloud'))
      .catch((error) => {
        logError('categories/delete', error, { slug })
        setSyncStatus('error')
      })
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
    cloudEnabled: repository.isConfigured(),
  }

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories debe usarse dentro de CategoriesProvider')
  return ctx
}
