import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_SEARCH_SYNONYMS } from '../../domain/search/search.js'

const defaults = { phone: '(34) 91 870 71 13', email: 'boralba@boralba.es', hours: 'Lunes a Viernes · 8:00 – 18:00', searchSynonyms: DEFAULT_SEARCH_SYNONYMS }
const SettingsContext = createContext(null)

/**
 * Ajustes del sitio (documento único). Trabaja contra el puerto `repository`
 * (ver `../ports/catalog.js`) inyectado por el composition root.
 */
export function SiteSettingsProvider({ children, repository }) {
  if (!repository) throw new Error('SiteSettingsProvider necesita un repository (puerto SettingsRepository)')
  const [settings, setSettings] = useState(() => repository.getCachedSync(defaults))
  useEffect(() => {
    repository.loadSettings().then((remote) => {
      if (remote) setSettings((current) => ({ ...current, ...remote }))
    })
  }, [repository])
  const updateSettings = (updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    repository.saveSettings(next).catch(() => {})
  }
  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSiteSettings debe usarse dentro de SiteSettingsProvider')
  return context
}
