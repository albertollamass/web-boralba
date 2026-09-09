import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_SEARCH_SYNONYMS } from '../lib/search'

const defaults = { phone: '(34) 91 870 71 13', email: 'boralba@boralba.es', hours: 'Lunes a Viernes · 8:00 – 18:00', searchSynonyms: DEFAULT_SEARCH_SYNONYMS }
const SettingsContext = createContext(null)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try { return { ...defaults, ...(JSON.parse(localStorage.getItem('boralba-settings') || '{}')) } } catch { return defaults }
  })
  useEffect(() => {
    if (!supabase) return
    supabase.from('site_settings').select('data').eq('id', 'general').maybeSingle().then(({ data }) => { if (data?.data) setSettings((current) => ({ ...current, ...data.data })) }).catch(() => {})
  }, [])
  const updateSettings = (updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    localStorage.setItem('boralba-settings', JSON.stringify(next))
    if (supabase) supabase.from('site_settings').upsert({ id: 'general', data: next }).then(() => {}).catch(() => {})
  }
  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSiteSettings debe usarse dentro de SiteSettingsProvider')
  return context
}
