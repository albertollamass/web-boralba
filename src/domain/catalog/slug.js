// Dominio · Catálogo — generación de slugs para las URLs públicas.
// Puro: minúsculas, sin tildes, separados por guiones.

export const generateSlug = (name) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const productSlug = (product) => generateSlug(product?.name)

// La ruta se deriva del producto en un único punto para que ningún consumidor
// tenga que conocer o guardar manualmente su URL pública.
export const productPath = (product) => `/producto/${encodeURIComponent(product.id)}/${encodeURIComponent(productSlug(product))}/`
