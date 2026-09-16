import { createClient } from '@supabase/supabase-js'

// Desactivado temporalmente para evitar cualquier petición a Supabase.
const SUPABASE_ENABLED = false
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = SUPABASE_ENABLED && url && publishableKey ? createClient(url, publishableKey) : null
export const isSupabaseConfigured = Boolean(supabase)
