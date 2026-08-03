import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import { searchProducts } from '../lib/search'

export default function Buscar() {
  const { products } = useProducts()
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchProducts(products, query), [products, query])
  const hasQuery = query.trim().length > 0

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Buscar</span>
          </div>
          <h1>Buscador de productos</h1>
          <p>
            Busca por descripción, código de referencia o potencia (p. ej. <strong>50W</strong>).
          </p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="search-box">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Introduce descripción, código o potencia (ej: 50W, DL-15W, panel led…)"
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')} aria-label="Borrar búsqueda">
              ✕
            </button>
          )}
        </div>

        {hasQuery && (
          <p className="search-meta">
            {results.length === 0
              ? 'Sin resultados para tu búsqueda.'
              : `${results.length} producto${results.length === 1 ? '' : 's'} encontrado${results.length === 1 ? '' : 's'}`}
          </p>
        )}

        {hasQuery && results.length === 0 && (
          <div className="empty-state">
            <h3>No hemos encontrado nada</h3>
            <p>
              Prueba con otro término: una potencia como <strong>50W</strong>, un código como{' '}
              <strong>DL-15W</strong>, o una descripción como <strong>panel led</strong>.
            </p>
            <Link to="/productos" className="btn btn-primary">
              Ver todo el catálogo
            </Link>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!hasQuery && (
          <div className="empty-state">
            <h3>¿Qué estás buscando?</h3>
            <p>
              Puedes buscar por <strong>descripción</strong> (ej. "tira led"), por{' '}
              <strong>código de referencia</strong> (ej. "DL-15W") o por{' '}
              <strong>potencia</strong> (ej. "50W").
            </p>
          </div>
        )}
      </div>
    </>
  )
}
