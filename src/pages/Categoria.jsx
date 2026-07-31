import { Link, useParams, Navigate } from 'react-router-dom'
import { getCategory, getChildren, getBreadcrumb, getDescendantSlugs, getLeafCategories } from '../data/categories'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function Categoria() {
  const { slug } = useParams()
  const { products } = useProducts()
  const category = getCategory(slug)

  if (!category) return <Navigate to="/productos" replace />

  const children = getChildren(slug)
  const leaf = children.length === 0
  const trail = getBreadcrumb(slug)

  let categoryProducts
  if (leaf) {
    categoryProducts = products.filter((p) => p.category === slug)
  } else {
    const slugs = getDescendantSlugs(slug)
    categoryProducts = products.filter((p) => slugs.includes(p.category))
  }

  const subCats =
    children.length > 0
      ? children
      : getLeafCategories().filter((c) => c.slug !== slug)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/productos">Productos</Link>
            {trail.map((c) => (
              <span key={c.slug}>
                <span>/</span>
                <Link to={`/categoria/${c.slug}`}>{c.name}</Link>
              </span>
            ))}
          </div>
          <h1>{category.name}</h1>
          {category.tagline && <p>{category.tagline}</p>}
          {category.description && <p>{category.description}</p>}
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        {children.length > 0 && (
          <>
            <div className="section-head" style={{ textAlign: 'left', marginBottom: 28 }}>
              <h3 style={{ marginBottom: 4 }}>Subcategorías</h3>
            </div>
            <div className="grid grid-3">
              {children.map((child) => (
                <Link key={child.slug} to={`/categoria/${child.slug}`} className="category-card">
                  <img src={child.image} alt={child.name} loading="lazy" />
                  <div className="overlay">
                    <h3>{child.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 40 }} />
          </>
        )}

        <div className="section-head" style={{ textAlign: 'left', marginBottom: 28 }}>
          <h3 style={{ marginBottom: 4 }}>
            {leaf ? `Productos en ${category.name}` : `Productos de ${category.name}`}
          </h3>
          <span className="muted">
            {categoryProducts.length} producto{categoryProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-4">
            {categoryProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Aún no hay productos en esta categoría</h3>
            <p>
              Estamos ampliando nuestro catálogo. Consulta pronto, o contacta con nosotros para
              más información.
            </p>
            <Link to="/contacto" className="btn btn-primary">
              Contactar
            </Link>
          </div>
        )}

        {leaf && (
          <div style={{ marginTop: 48 }}>
            <div className="section-head" style={{ textAlign: 'left', marginBottom: 24 }}>
              <h3>Otras categorías</h3>
            </div>
            <div className="grid grid-3">
              {subCats.slice(0, 6).map((c) => (
                <Link key={c.slug} to={`/categoria/${c.slug}`} className="category-card">
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <div className="overlay">
                    <h3>{c.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
