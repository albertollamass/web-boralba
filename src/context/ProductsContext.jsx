import { createContext, useContext, useEffect, useState } from 'react'
import { seedProducts } from '../data/products'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'boralba_products_v1'
const TABLE = 'products'

const ProductsContext = createContext(null)

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return seedProducts
}

function saveLocal(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch {
    // ignore
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

async function pushAll(products) {
  const rows = products.map((p, i) => ({
    id: p.id,
    data: p,
    created_at: new Date(Date.now() - i * 1000).toISOString(),
  }))
  const { error } = await supabase.from(TABLE).upsert(rows)
  if (error) throw error
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(seedProducts)
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!isSupabaseConfigured) {
        setProducts(loadLocal())
        setSyncStatus('local')
        setHydrated(true)
        return
      }
      try {
        const remote = await fetchRemoteProducts()
        if (cancelled) return
        if (remote.length > 0) {
          setProducts(remote)
          saveLocal(remote)
          setSyncStatus('cloud')
        } else {
          setProducts(seedProducts)
          setSyncStatus('cloud-empty')
        }
      } catch {
        if (cancelled) return
        setProducts(loadLocal())
        setSyncStatus('local-error')
      }
      setHydrated(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (hydrated) saveLocal(products)
  }, [products, hydrated])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    setProducts((prev) => [newProduct, ...prev])
    if (supabase) {
      setSyncStatus((s) => (s === 'cloud-empty' || s === 'cloud' ? 'cloud' : s))
      supabase
        .from(TABLE)
        .upsert({ id: newProduct.id, data: newProduct, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
    return newProduct
  }

  const updateProduct = (id, updates) => {
    const merged = { ...updates, id }
    setProducts((prev) => prev.map((p) => (p.id === id ? merged : p)))
    if (supabase) {
      supabase
        .from(TABLE)
        .upsert({ id, data: merged, created_at: new Date().toISOString() })
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    if (supabase) {
      supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .then(() => setSyncStatus('cloud'))
        .catch(() => setSyncStatus('error'))
    }
  }

  const resetProducts = async () => {
    setProducts(seedProducts)
    if (supabase) {
      const { error } = await supabase.from(TABLE).delete().neq('id', '')
      if (error) {
        setSyncStatus('error')
        return
      }
      try {
        await pushAll(seedProducts)
        setSyncStatus('cloud')
      } catch {
        setSyncStatus('error')
      }
    }
  }

  const pushToCloud = async () => {
    if (!supabase) return false
    try {
      await pushAll(products)
      setSyncStatus('cloud')
      return true
    } catch {
      setSyncStatus('error')
      return false
    }
  }

  const getProduct = (id) => products.find((p) => p.id === id)

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    pushToCloud,
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
