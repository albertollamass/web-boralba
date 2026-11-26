// Dominio · Catálogo — generación de slugs (identidad pública de la categoría).
// Puro: minúsculas, sin tildes, separados por guiones.

export const generateSlug = (name) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Ruta pública canónica de una ficha. Debe coincidir con la que genera el
// sitemap y con el HTML estático; si no, Google ve dos URLs para el mismo
// producto y las enlaces internos acaban en una ruta que no existe.
export const productPath = (product) =>
  `/producto/${encodeURIComponent(product?.id || '')}/${generateSlug(product?.name)}/`
