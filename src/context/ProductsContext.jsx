import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { logError } from '../lib/logger'

const TABLE = 'products'
// Algunas filas contienen imágenes base64 muy grandes; los lotes pequeños evitan un 500 de Supabase.
const PAGE_SIZE = 10

const ProductsContext = createContext(null)
let remoteProductsRequest

async function fetchRemoteProducts() {
  if (!remoteProductsRequest) {
    remoteProductsRequest = (async () => {
      const products = []

      for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabase
          .from(TABLE)
          .select('id, data')
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1)
        if (error) throw error

        products.push(...(data || []).map((row) => ({ id: row.id, ...row.data })))
        if (!data || data.length < PAGE_SIZE) return products
      }
    })().finally(() => {
      remoteProductsRequest = undefined
    })
  }
  return remoteProductsRequest
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
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
