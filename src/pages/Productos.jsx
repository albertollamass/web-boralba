import { Link } from 'react-router-dom'
import { ROOT, getChildren, categories } from '../data/categories'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function Productos() {
  const cats = getChildren(ROOT.slug)
  const { products } = useProducts()

  const byCategory = {}
  products.forEach((p) => {
    if (!byCategory[p.category]) byCategory[p.category] = []
    byCategory[p.category].push(p)
  })

  const orderedCategories = categories.filter((c) => byCategory[c.slug]?.length)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Productos</span>
          </div>
          <h1>Conoce nuestros productos</h1>
          <p>Soluciones de iluminación LED profesional para cualquier proyecto.</p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="grid grid-2">
          {cats.map((cat) => (
            <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="card" style={{ textDecoration: 'none' }}>
              <div className="card-img">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <div className="card-body">
                <h3>{cat.name}</h3>
                <p>{cat.tagline}</p>
                <span className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Ver productos
                </span>
              </div>
            </Link>
          ))}
        </div>

        {orderedCategories.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div className="section-head left" style={{ marginBottom: 32 }}>
              <span className="tag">Catálogo completo</span>
              <h2>Todos los productos por categoría</h2>
              <p>
                Cada producto se asigna a una categoría. Explora cada sección o usa el menú de
                Productos para navegar.
              </p>
            </div>

            {orderedCategories.map((cat) => (
              <div key={cat.slug} style={{ marginBottom: 40 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{cat.name}</h3>
                  <span className="muted" style={{ fontSize: '0.88rem' }}>
                    {byCategory[cat.slug].length} producto{byCategory[cat.slug].length === 1 ? '' : 's'}
                  </span>
                  <Link to={`/categoria/${cat.slug}`} style={{ fontSize: '0.88rem' }}>
                    Ver categoría →
                  </Link>
                </div>
                <div className="grid grid-4">
                  {byCategory[cat.slug].map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-head mt-3" style={{ marginTop: 56 }}>
          <span className="tag">Catálogo completo</span>
          <h2>Descubre todos nuestros productos</h2>
          <p>Accede a nuestro catálogo completo y encuentra la solución de iluminación perfecta para tu proyecto.</p>
          <a
            href="https://www.canva.com/design/DAG2mF_yVsU/ElFlARQAFFWe1Rs1c9D9AA/edit"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mt-2"
            style={{ display: 'inline-flex' }}
          >
            Ver catálogo
          </a>
        </div>
      </div>
    </>
  )
}
