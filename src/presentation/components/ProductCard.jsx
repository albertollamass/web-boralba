import { Link } from 'react-router-dom'
import { productPath } from '../../domain/catalog/slug'

export default function ProductCard({ product, variant = '' }) {
  const specs = (product.specs || []).filter((spec) => spec.value).slice(0, 3)
  const available = product.available !== false && product.availability !== 'Agotado' && product.stock !== 0
  return (
    <div className={`card product-card${variant ? ` product-card--${variant}` : ''}`}>
      <div className="card-img">
        <Link to={productPath(product)}>
            <img
              src={product.image || 'images/placeholder.svg'}
              srcSet={product.imageSrcSet || undefined}
              sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 280px"
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
        </Link>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 8 }}>
          {product.outlet && <span className="badge badge-outlet">Outlet</span>}{' '}
          {product.featured && <span className="badge badge-featured">Destacado</span>}
        </div>
        <h3>
          <Link to={productPath(product)}>{product.name}</Link>
        </h3>
        <div className="ref">{product.ref}</div>
        {variant === 'editorial' && <div className="product-card-meta">{specs.map((spec) => <span key={`${spec.label}-${spec.value}`}>{spec.label}: {spec.value}{spec.unit ? ` ${spec.unit}` : ''}</span>)}</div>}
        <p>{product.description}</p>
        {variant === 'editorial' && <div className={`product-card-availability${available ? '' : ' is-unavailable'}`}><i />{available ? 'Disponible' : 'Consultar disponibilidad'}</div>}
        <div className="card-footer">
          <span className="price">
            {product.price != null ? `${product.price.toLocaleString('es-ES')} €` : 'Consultar'}
            {product.price != null && product.unit ? <small> / {product.unit}</small> : null}
          </span>
          <Link to={productPath(product)} className="btn btn-outline btn-sm">
            {variant === 'editorial' ? 'Ver producto' : 'Ver'}
          </Link>
        </div>
      </div>
    </div>
  )
}
