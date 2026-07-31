import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'

export default function ProductoDetalle() {
  const { id } = useParams()
  const { getProduct, products } = useProducts()
  const product = getProduct(id)

  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const gallery = product.gallery?.length ? product.gallery : [product.image]
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
          <Gallery images={gallery} name={product.name} />
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

            {product.icons?.length > 0 && (
              <div className="badge-row">
                {product.icons.map((icon, i) => (
                  <img key={i} src={icon} alt="Badge" loading="lazy" />
                ))}
              </div>
            )}

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
                {product.variants.map((v) => (
                  <div key={v.title} className="variant-col">
                    <h4>{v.title}</h4>
                    <ul>
                      {v.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
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
              <Link to="/contacto" className="btn btn-outline">
                Contactar
              </Link>
              {product.datasheet && (
                <a href={product.datasheet} target="_blank" rel="noreferrer" className="btn btn-outline">
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

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="product-detail-img">
        <img src={images[active]} alt={name} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              className={i === active ? 'thumb active' : 'thumb'}
              onClick={() => setActive(i)}
            >
              <img src={img} alt={`${name} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
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
