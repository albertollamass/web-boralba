import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function getCardsPerPage() {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(max-width: 640px)').matches) return 1
  if (window.matchMedia('(max-width: 960px)').matches) return 2
  return 3
}

export default function FamilyCarousel({ families, getCatImage }) {
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage)
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(families.length / cardsPerPage)

  useEffect(() => {
    const updateCardsPerPage = () => setCardsPerPage(getCardsPerPage())
    window.addEventListener('resize', updateCardsPerPage)
    return () => window.removeEventListener('resize', updateCardsPerPage)
  }, [])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, Math.max(pageCount - 1, 0)))
  }, [pageCount])

  if (!families.length) return null

  const visibleFamilies = families.slice(page * cardsPerPage, (page + 1) * cardsPerPage)

  return (
    <div className="home-products-carousel" aria-label="Familias de productos">
      {pageCount > 1 && (
        <div className="home-products-controls">
          <span className="home-products-count">{page + 1} / {pageCount}</span>
          <div className="home-products-arrows">
            <button
              type="button"
              className="home-products-arrow"
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
              disabled={page === 0}
              aria-label="Familias anteriores"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              className="home-products-arrow"
              onClick={() => setPage((currentPage) => Math.min(currentPage + 1, pageCount - 1))}
              disabled={page === pageCount - 1}
              aria-label="Siguientes familias"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="home-products-grid">
        {visibleFamilies.map((family) => (
          <article className="home-family-card" key={family.slug}>
            <Link to={`/categoria/${family.slug}`} className="home-family-card-link" aria-label={`Ver gama ${family.name}`}>
              <div className="home-product-image">
                <img src={getCatImage(family.slug)} alt={family.name} loading="lazy" draggable={false} />
              </div>
              <div className="home-family-card-info">
                <h3>{family.name}</h3>
                <span className="home-family-card-cta">Ver gama <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="home-products-pagination" aria-label="Seleccionar página de familias">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={index === page ? 'is-active' : ''}
              onClick={() => setPage(index)}
              aria-label={`Mostrar página ${index + 1}`}
              aria-current={index === page ? 'page' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
