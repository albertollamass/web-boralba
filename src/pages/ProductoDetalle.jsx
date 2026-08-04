import { Link, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import Carousel from '../components/Carousel'
import { openPdfDataUrl } from '../lib/pdf'

const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:')

export default function ProductoDetalle() {
  const { id } = useParams()
  const { getProduct, products } = useProducts()
  const { getCategory } = useCategories()
  const product = getProduct(id)

  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const gallery = [product.image, ...(product.gallery || [])].filter(Boolean)
  const badges = (product.icons || []).slice(0, 4)
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

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
          <div>
            <div className="product-carousel">
              <Carousel images={gallery} alt={product.name} />
            </div>
            {badges.length > 0 && (
              <div className="badge-row">
                {badges.map((icon, i) => (
                  <img key={i} src={icon} alt="Badge" loading="lazy" />
                ))}
              </div>
            )}
          </div>
          <div className="product-info">
            <div style={{ marginBottom: 8 }}>
              {product.outlet && <span className="badge badge-outlet">Outlet</span>}{' '}
              {product.featured && <span className="badge badge-featured">Destacado</span>}
            </div>
            <h1 style={{ fontSize: '1.9rem' }}>{product.name}</h1>
            {product.ref && <p className="ref" style={{ color: 'var(--color-text-muted)' }}>Ref: {product.ref}</p>}

            {product.price != null && (
              <p className="price" style={{ fontSize: '1.6rem' }}>
                {product.price.toLocaleString('es-ES')} €{' '}
                {product.unit ? <small>/ {product.unit}</small> : null}
              </p>
            )}

            {product.description && <p>{product.description}</p>}

            <div className="meta-links">
              {category && (
                <p>
                  Categoría:{' '}
                  <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
                </p>
              )}
              {product.tags?.length > 0 && (
                <p>
                  Etiquetas:{' '}
                  {product.tags.map((t) => (
                    <span key={t} className="tag-chip">{t}</span>
                  ))}
                </p>
              )}
            </div>

            {product.variants?.length > 0 && (
              <div className="variant-table">
                {product.variants.map((v, i) => (
                  <div key={i} className="variant-row">
                    {v.image && <img className="variant-img" src={v.image} alt={v.title} loading="lazy" />}
                    <div className="variant-col">
                      <h4>{v.title}</h4>
                      <ul>
                        {(v.items || []).map((it, j) => (
                          <li key={j}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              <a
                href="mailto:boralba@boralba.es?subject=Consulta%20producto"
                className="btn btn-primary"
              >
                Solicitar información
              </a>
              <Link to="/contacto" className="btn btn-outline" target="_blank" rel="noreferrer">
                Contactar
              </Link>
              {product.datasheet && (
                <a
                  href={isDataUrl(product.datasheet) ? undefined : product.datasheet}
                  onClick={
                    isDataUrl(product.datasheet)
                      ? (e) => {
                          e.preventDefault()
                          openPdfDataUrl(product.datasheet)
                        }
                      : undefined
                  }
                  target={isDataUrl(product.datasheet) ? undefined : '_blank'}
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  Ficha técnica
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="product-description" style={{ marginTop: 56 }}>
          <div className="tabs">
            <button className="tab active">Descripción</button>
          </div>
          <div className="tab-content">
            {product.longDescription && (
              <div className="desc-block">
                {product.longDescription.map((p, i) => (
                  <RichText key={i} text={p} as="p" />
                ))}
              </div>
            )}

            {product.features?.length > 0 && (
              <div className="desc-block">
                <h2>Características principales</h2>
                <ul>
                  {product.features.map((f, i) => (
                    <li key={i}>
                      <RichText text={f} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.applications?.length > 0 && (
              <div className="desc-block">
                <h2>Aplicaciones recomendadas</h2>
                <ul>
                  {product.applications.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.advantages?.length > 0 && (
              <div className="desc-block">
                <h2>Ventajas técnicas</h2>
                <ul className="checklist">
                  {product.advantages.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.specs?.length > 0 && (
              <div className="desc-block">
                <h2>Datos técnicos</h2>
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
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div className="section-head left" style={{ marginBottom: 24 }}>
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

function RichText({ text, as }) {
  const Tag = as || 'span'
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <Tag>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </Tag>
  )
}

function ProductCardMini({ product }) {
  return (
    <Link to={`/producto/${product.id}`} className="card" style={{ textDecoration: 'none' }}>
      <div className="card-img">
        <img src={product.image || 'images/placeholder.svg'} alt={product.name} loading="lazy" />
      </div>
      <div className="card-body">
        <h3 style={{ fontSize: '0.95rem' }}>{product.name}</h3>
        <div className="ref">{product.ref}</div>
      </div>
    </Link>
  )
}
