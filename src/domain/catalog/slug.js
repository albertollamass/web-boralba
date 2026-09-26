// Dominio · Catálogo — generación de slugs (identidad pública de la categoría).
// Puro: minúsculas, sin tildes, separados por guiones.

export const generateSlug = (name) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
