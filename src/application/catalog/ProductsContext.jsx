import { createContext, useContext, useEffect, useState } from 'react'
import { logError } from '../logging/logger.js'

const ProductsContext = createContext(null)

/**
 * Estado y casos de uso del catálogo de productos.
 * No conoce Firestore: trabaja contra el puerto `repository`
 * (ver `../ports/catalog.js`) inyectado por el composition root.
 */
export function ProductsProvider({ children, repository, telemetry }) {
  if (!repository) throw new Error('ProductsProvider necesita un repository (puerto ProductRepository)')
  const [products, setProducts] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!repository.isConfigured()) {
        setProducts([])
        setSyncStatus('error')
        setHydrated(true)
        return
      }
      try {
        const { items, source } = await repository.listProducts()
        if (cancelled) return
        setProducts(items)
        setSyncStatus(source === 'cache' ? 'cache' : 'cloud')
        if (source !== 'cache') telemetry?.trackReads('products', items.length)
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
  }, [repository, telemetry])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    setProducts((prev) => [newProduct, ...prev])
    repository
      .saveProduct(newProduct)
      .then(() => setSyncStatus('cloud'))
      .catch((error) => {
        logError('products/insert', error, { id: newProduct.id })
        setSyncStatus('error')
      })
    return newProduct
  }

  const updateProduct = (id, updates) => {
    const merged = { ...updates, id }
    setProducts((prev) => prev.map((p) => (p.id === id ? merged : p)))
    repository
      .saveProduct(merged)
      .then(() => setSyncStatus('cloud'))
      .catch((error) => {
        logError('products/update', error, { id })
        setSyncStatus('error')
      })
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    repository
      .deleteProduct(id)
      .then(() => setSyncStatus('cloud'))
      .catch((error) => {
        logError('products/delete', error, { id })
        setSyncStatus('error')
      })
  }

  const resetProducts = async () => {
    setSyncStatus('loading')
    try {
      await repository.clearProducts()
    } catch (error) {
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
    cloudEnabled: repository.isConfigured(),
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider')
  return ctx
}
