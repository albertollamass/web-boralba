import { Link, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'

export default function ProductoDetalle() {
  const { id } = useParams()
  const { getProduct, products } = useProducts()
  const product = getProduct(id)

  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/productos">Productos</Link>
            {category && (
              <span>
                <span>/</span>
                <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="product-detail">
          <div className="product-detail-img">
            <img src={product.image || '/images/placeholder.svg'} alt={product.name} />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              {product.outlet && <span className="badge badge-outlet">Outlet</span>}{' '}
              {product.featured && <span className="badge badge-featured">Destacado</span>}
            </div>
            <h1 style={{ fontSize: '1.8rem' }}>{product.name}</h1>
            <p className="ref" style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
              Ref: {product.ref}
            </p>
            {product.price != null && (
              <p className="price" style={{ fontSize: '1.6rem' }}>
                {product.price.toLocaleString('es-ES')} €{' '}
                {product.unit ? <small>/ {product.unit}</small> : null}
              </p>
            )}
            <p>{product.description}</p>
            <p>
              Categoría:{' '}
              {category ? (
                <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
              ) : (
                product.category
              )}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              <a href="mailto:boralba@boralba.es?subject=Consulta%20producto" className="btn btn-primary">
                Solicitar información
              </a>
              <Link to="/contacto" className="btn btn-outline">
                Contactar
              </Link>
            </div>

            {product.specs && product.specs.length > 0 && (
              <table className="spec-table">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={i}>
                      <th>{s.label}</th>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div className="section-head" style={{ textAlign: 'left', marginBottom: 24 }}>
              <h3>Productos relacionados</h3>
            </div>
            <div className="grid grid-4">
              {related.map((p) => (
                <ProductCardMini key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function ProductCardMini({ product }) {
  return (
    <Link to={`/producto/${product.id}`} className="card" style={{ textDecoration: 'none' }}>
      <div className="card-img">
        <img src={product.image || '/images/placeholder.svg'} alt={product.name} loading="lazy" />
      </div>
      <div className="card-body">
        <h3 style={{ fontSize: '0.95rem' }}>{product.name}</h3>
        <div className="ref">{product.ref}</div>
      </div>
    </Link>
  )
}
