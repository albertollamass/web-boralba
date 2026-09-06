import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { logError } from '../lib/logger'

const TABLE = 'products'
const CACHE_KEY = 'boralba-products-cache-v1'

const ProductsContext = createContext(null)

function readCachedProducts() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    return Array.isArray(cached?.products) ? cached.products : []
  } catch {
    return []
  }
}

function cacheProducts(products) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ products, savedAt: Date.now() }))
  } catch {
    // La caché es opcional: puede fallar si el navegador la bloquea o está llena.
  }
}

async function fetchRemoteProducts() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, data')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({ id: row.id, ...row.data }))
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(readCachedProducts)
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!isSupabaseConfigured) {
        setProducts([])
        setSyncStatus('error')
        setHydrated(true)
        return
      }
      try {
        const remote = await fetchRemoteProducts()
        if (cancelled) return
        setProducts(remote)
        cacheProducts(remote)
        setSyncStatus('cloud')
      } catch (error) {
        if (cancelled) return
        logError('products/fetch', error)
        setSyncStatus('error')
      }
      setHydrated(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    setProducts((prev) => {
      const next = [newProduct, ...prev]
      cacheProducts(next)
      return next
    })
    if (supabase) {
      supabase
        .from(TABLE)
        .upsert({ id: newProduct.id, data: newProduct, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch((error) => {
          logError('products/insert', error, { id: newProduct.id })
          setSyncStatus('error')
        })
    }
    return newProduct
  }

  const updateProduct = (id, updates) => {
    const merged = { ...updates, id }
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? merged : p))
      cacheProducts(next)
      return next
    })
    if (supabase) {
      supabase
        .from(TABLE)
        .upsert({ id, data: merged, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch((error) => {
          logError('products/update', error, { id })
          setSyncStatus('error')
        })
    }
  }

  const deleteProduct = (id) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      cacheProducts(next)
      return next
    })
    if (supabase) {
      supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .then(() => setSyncStatus('cloud'))
        .catch((error) => {
          logError('products/delete', error, { id })
          setSyncStatus('error')
        })
    }
  }

  const resetProducts = async () => {
    if (!supabase) return
    setSyncStatus('loading')
    const { error } = await supabase.from(TABLE).delete().neq('id', '')
    if (error) {
      logError('products/reset', error)
      setSyncStatus('error')
      return
    }
    setProducts([])
    cacheProducts([])
    setSyncStatus('cloud')
  }

  const getProduct = (id) => products.find((p) => p.id === id)

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    getProduct,
    hydrated,
    syncStatus,
    cloudEnabled: isSupabaseConfigured,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider')
  return ctx
}
