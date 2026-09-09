import { Link, useParams, Navigate } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'

function CategoryProductCard({ product, categoryName }) {
  return (
    <Link className="subcategory-product-card" to={`/producto/${product.id}`}>
      <div className="subcategory-product-image">
        <img src={product.image || 'images/placeholder.svg'} alt={product.name || 'Producto Boralba'} loading="lazy" />
      </div>
      <div className="subcategory-product-copy">
        <span>{categoryName}</span>
        <h3>{product.name || 'Producto sin nombre'}</h3>
        <p>{product.ref || 'Sin código de producto'}</p>
      </div>
    </Link>
  )
}

export default function Categoria() {
  const { slug } = useParams()
  const { getCategory, getChildren, getBreadcrumb, getDescendantSlugs, getLeafCategories } = useCategories()
  const { products, hydrated } = useProducts()
  const category = getCategory(slug)

  if (!category) return <Navigate to="/productos" replace />

  const children = getChildren(slug)
  const trail = getBreadcrumb(slug)
  const categorySlugs = new Set(getDescendantSlugs(slug))
  const productsInCategory = products.filter((product) => {
    const assignedCategories = [product.category, ...(Array.isArray(product.categories) ? product.categories : [])].filter(Boolean)
    return assignedCategories.some((assignedCategory) => categorySlugs.has(assignedCategory))
  })
  const leaf = children.length === 0
  const subCats = children.length > 0 ? children : getLeafCategories().filter((item) => item.slug !== slug)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link><span>/</span><Link to="/productos">Productos</Link>
            {trail.map((item) => <span key={item.slug}><span>/</span><Link to={`/categoria/${item.slug}`}>{item.name}</Link></span>)}
          </div>
          <h1>{category.name}</h1>
          {category.tagline && <p>{category.tagline}</p>}
          {category.description && <p>{category.description}</p>}
        </div>
      </div>

      <div className="container section category-page-content" style={{ paddingTop: 0 }}>
        {children.length > 0 && <>
          <div className="section-head left"><h3 style={{ marginBottom: 4 }}>Subcategorías</h3></div>
          <div className="grid grid-3">
            {children.map((child) => <Link key={child.slug} to={`/categoria/${child.slug}`} className="category-card"><img src={child.image || 'images/placeholder.svg'} alt={child.name} loading="lazy" /><div className="overlay"><h3>{child.name}</h3></div></Link>)}
          </div>
          <div style={{ marginTop: 40 }} />
        </>}

        {children.length === 0 && (!hydrated ? <div className="empty-state"><h3>Cargando productos...</h3></div> : <>
          <div className="section-head left category-products-heading">
            <h3 style={{ marginBottom: 4 }}>{leaf ? `Productos en ${category.name}` : `Todos los productos de ${category.name}`}</h3>
            <span className="muted">{productsInCategory.length} producto{productsInCategory.length === 1 ? '' : 's'}</span>
          </div>
          {productsInCategory.length > 0 ? <div className="subcategory-product-grid">{productsInCategory.map((product) => <CategoryProductCard key={product.id} product={product} categoryName={category.name} />)}</div> : <div className="empty-state"><h3>Actualmente no hay productos disponibles en esta subcategoría.</h3><p>Consulta otra subcategoría o vuelve a explorar el catálogo.</p></div>}
        </>)}

        {leaf && subCats.length > 0 && <div style={{ marginTop: 48 }}><div className="section-head left"><h3>Otras categorías</h3></div><div className="grid grid-3">{subCats.slice(0, 6).map((item) => <Link key={item.slug} to={`/categoria/${item.slug}`} className="category-card"><img src={item.image || 'images/placeholder.svg'} alt={item.name} loading="lazy" /><div className="overlay"><h3>{item.name}</h3></div></Link>)}</div></div>}
      </div>
    </>
  )
}
