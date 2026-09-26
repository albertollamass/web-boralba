// Resuelve rutas de ficheros servidos desde `public/` (p. ej. `assets/...`)
// anteponiendo la base de Vite: `/` en dev, `/web-boralba/` en producción.
// Las data-URLs y URLs absolutas se devuelven tal cual.
export function publicUrl(path) {
  if (typeof path !== 'string' || path === '') return path
  if (/^(data:|https?:|blob:)/i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\/+/, '')}`
}
