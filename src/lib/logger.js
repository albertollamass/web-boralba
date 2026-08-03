import { supabase } from './supabase'

export async function logError(context, error, extra) {
  const message =
    error?.message || error?.code || (error instanceof Error ? error.message : String(error || 'Error desconocido'))
  const details = { ...(extra || {}) }
  if (error && typeof error === 'object' && error.stack) {
    details.stack = error.stack.split('\n').slice(0, 5)
  }

  console.error(`[Boralba:${context}]`, error || message)

  if (!import.meta.env.PROD || !supabase) return

  try {
    const { data } = await supabase.auth.getUser()
    await supabase.from('logs').insert({
      context,
      message,
      user_id: data?.user?.id ?? null,
      details,
    })
  } catch {
    // El logging nunca debe romper la app ni bloquear al usuario.
  }
}