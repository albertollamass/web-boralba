// Aplicación · Fachada de logging.
//
// El registro de errores es transversal (lo usan todas las capas), así que en vez
// de inyectarlo en cada módulo hay una fachada con destino configurable: por
// defecto solo consola (seguro en cualquier entorno); el composition root
// (`main.jsx`) conecta la implementación persistente. Nunca lanza.

let handler = async () => {}

export function configureLogger(nextHandler) {
  if (typeof nextHandler === 'function') handler = nextHandler
}

export async function logError(context, error, extra) {
  console.error(`[Boralba:${context}]`, error || 'Error desconocido')
  try {
    await handler(context, error, extra)
  } catch {
    // El logging nunca debe romper la app ni bloquear al usuario.
  }
}
