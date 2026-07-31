import { createContext, useContext, useEffect, useState } from 'react'
import { seedProducts } from '../data/products'

const STORAGE_KEY = 'boralba_products_v1'
const AUTH_KEY = 'boralba_admin_authed'
const ADMIN_PASSWORD = 'boralba2024'

const ProductsContext = createContext(null)

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return seedProducts
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(loadProducts)
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(AUTH_KEY) === '1')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    setProducts((prev) => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, id } : p)))
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const resetProducts = () => {
    setProducts(seedProducts)
  }

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem(AUTH_KEY, '1')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem(AUTH_KEY)
  }

  const getProduct = (id) => products.find((p) => p.id === id)

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    getProduct,
    isAdmin,
    login,
    logout,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider')
  return ctx
}
