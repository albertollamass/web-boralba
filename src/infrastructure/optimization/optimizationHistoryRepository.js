const STORAGE_KEY = 'boralba-optimization-history'

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const optimizationHistoryRepository = {
  async list() {
    return read().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  },
  async save(entry) {
    const next = [{ ...entry, id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2)}` }, ...read()].slice(0, 100)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next[0]
  },
}
