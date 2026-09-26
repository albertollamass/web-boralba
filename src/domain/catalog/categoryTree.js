// Dominio · Catálogo — árbol de categorías.
//
// Lógica pura del lenguaje ubicuo ("familia", "subcategoría", "migas"): el campo
// `parent` es la fuente de verdad de la jerarquía. Sin dependencias: ni React,
// ni Firebase, ni ningún otro detalle de infraestructura.

export const ROOT = {
  slug: 'productos',
  name: 'Productos',
}

// Helpers para el árbol de categorías.
// Operan sobre cualquier lista (la de la nube) y usan el campo
// `parent` como fuente de verdad de la jerarquía (más robusto para editar).
export const buildCategoryIndex = (list) => {
  const bySlug = Object.fromEntries((list || []).map((c) => [c.slug, c]))

  const getCategory = (slug) => bySlug[slug]

  const getChildren = (slug) => {
    const parentSlug = slug === ROOT.slug ? ROOT.slug : slug
    return (list || []).filter((c) => c.parent === parentSlug)
  }

  const getBreadcrumb = (slug) => {
    const trail = []
    let current = bySlug[slug]
    while (current) {
      trail.unshift(current)
      current = bySlug[current.parent]
    }
    return trail
  }

  const getCategoryPathLabel = (catSlug) =>
    getBreadcrumb(catSlug)
      .map((c) => c.name)
      .join(' › ')

  const getLeafCategories = () =>
    (list || []).filter((c) => !(list || []).some((child) => child.parent === c.slug))

  const getDescendantSlugs = (slug) => {
    const result = [slug]
    const visit = (s) => {
      getChildren(s).forEach((child) => {
        result.push(child.slug)
        visit(child.slug)
      })
    }
    visit(slug)
    return result
  }

  return { getCategory, getChildren, getBreadcrumb, getCategoryPathLabel, getLeafCategories, getDescendantSlugs, bySlug }
}
