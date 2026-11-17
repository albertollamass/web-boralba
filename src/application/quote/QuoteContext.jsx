import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'boralba-quote-selection'
const QuoteContext = createContext(null)

function readStoredItems() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter((item) => item?.id && item?.reference && item.quantity > 0) : []
  } catch {
    return []
  }
}

export function QuoteProvider({ children }) {
  const [items, setItems] = useState(readStoredItems)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item) => {
    setItems((current) => {
      const existing = current.findIndex((candidate) => candidate.id === item.id)
      if (existing < 0) return [...current, { ...item, quantity: Math.max(1, Number(item.quantity) || 1) }]
      return current.map((candidate, index) => index === existing
        ? { ...candidate, quantity: candidate.quantity + Math.max(1, Number(item.quantity) || 1) }
        : candidate)
    })
  }

  const updateQuantity = (id, quantity) => setItems((current) => current.map((item) => item.id === id
    ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
    : item))
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const clear = () => setItems([])

  return <QuoteContext.Provider value={{ items, count: items.length, addItem, updateQuantity, removeItem, clear }}>{children}</QuoteContext.Provider>
}

export function useQuote() {
  const context = useContext(QuoteContext)
  if (!context) throw new Error('useQuote debe usarse dentro de QuoteProvider')
  return context
}
