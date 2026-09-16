import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { searchProducts } from '../lib/search'

const QUICK_TAGS = ['24V', 'COB', 'CRI90', '4000K', 'Perfiles', 'RGB', 'IP65', 'CCT', 'Neón', 'Casambi']

export default function HomeSearch() {
  const { products } = useProducts()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchProducts(products, query, { synonyms: settings?.searchSynonyms }).slice(0, 8)
  }, [products, query, settings?.searchSynonyms])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  const handleTag = (tag) => {
    setQuery(tag)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  return (
    <div className="hs-wrap" ref={wrapperRef}>
      <form className="hs-bar" onSubmit={handleSubmit}>
        <svg className="hs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="hs-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Buscar por producto, potencia, tensión, referencia o temperatura de color"
        />
        <button type="submit" className="hs-submit">Buscar</button>
      </form>

      <div className="hs-tags">
        {QUICK_TAGS.map((tag) => (
          <button key={tag} type="button" className="hs-tag" onClick={() => handleTag(tag)}>{tag}</button>
        ))}
      </div>

      {isOpen && query.trim() && (
        <div className="hs-dropdown">
          {results.length === 0 && (
            <div className="hs-empty">
              <p>No se encontraron productos para "<strong>{query}</strong>"</p>
              <Link to="/productos" className="hs-view-all" onClick={() => setIsOpen(false)}>Ver todo el catálogo →</Link>
            </div>
          )}
          {results.length > 0 && (
            <>
              <div className="hs-results">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/producto/${p.id}`}
                    className="hs-result"
                    onClick={() => setIsOpen(false)}
                  >
                    <img src={p.image || 'images/placeholder.svg'} alt={p.name} className="hs-result-img" />
                    <div className="hs-result-info">
                      <span className="hs-result-name">{p.name}</span>
                      {p.ref && <span className="hs-result-ref">{p.ref}</span>}
                    </div>
                    <span className="hs-result-arrow">→</span>
                  </Link>
                ))}
              </div>
              <Link
                to={`/buscar?q=${encodeURIComponent(query.trim())}`}
                className="hs-view-all"
                onClick={() => setIsOpen(false)}
              >
                Ver todos los resultados ({results.length}) →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
