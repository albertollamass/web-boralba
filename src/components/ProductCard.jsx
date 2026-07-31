import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <div className="card">
      <div className="card-img">
        <Link to={`/producto/${product.id}`}>
          <img src={product.image || '/images/placeholder.svg'} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 8 }}>
          {product.outlet && <span className="badge badge-outlet">Outlet</span>}{' '}
          {product.featured && <span className="badge badge-featured">Destacado</span>}
        </div>
        <h3>
          <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="ref">{product.ref}</div>
        <p>{product.description}</p>
        <div className="card-footer">
          <span className="price">
            {product.price != null ? `${product.price.toLocaleString('es-ES')} €` : 'Consultar'}
            {product.price != null && product.unit ? <small> / {product.unit}</small> : null}
          </span>
          <Link to={`/producto/${product.id}`} className="btn btn-outline btn-sm">
            Ver
          </Link>
        </div>
      </div>
    </div>
  )
}
