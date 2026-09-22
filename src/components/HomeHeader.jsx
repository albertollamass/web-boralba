import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/* Categorías mostradas en el desplegable de Productos (escritorio y móvil). */
const PRODUCT_CATEGORIES = [
  { label: 'Tiras LED 220V', to: '/productos?g=tiras-220v' },
  { label: 'Tiras LED 24V', to: '/productos?g=tiras-led' },
  { label: 'Tiras Neón', to: '/productos?g=tiras-neon' },
  { label: 'Perfiles', to: '/productos?g=perfiles' },
  { label: 'Proyectores', to: '/productos?g=proyectores' },
  { label: 'Paneles LED', to: '/productos?g=panel-led' },
  { label: 'Downlight LED / Apliques', to: '/productos' },
  { label: 'Pantallas estancas', to: '/productos?g=pantalla-estanca' },
]

const NAV_ITEMS = [
  { label: 'Productos', to: '/productos', submenu: PRODUCT_CATEGORIES },
  { label: 'Proyectos', to: '/proyectos' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Diseña tu luminaria', to: '/disena-tu-luminaria' },
  { label: 'Empresa', to: '/empresa' },
  { label: 'Contacto', to: '/contacto' },
]

function SearchIcon({ onClick }) {
  return (
    <button type="button" className="bh-search-btn" onClick={onClick} aria-label="Buscar productos">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </button>
  )
}

export default function HomeHeader({ home = false, menuOpen, onMenuToggle, onNavigate, onSearchOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (!menuOpen) setProductsOpen(false)
  }, [menuOpen])

  return (
    <>
      <header className={`bh ${scrolled ? 'bh--scrolled' : ''}${home ? ' bh--home' : ''}`}>
        <div className="bh-inner">
          <Link to="/" className="bh-logo" onClick={onNavigate}>
            <img src="images/logo.png" alt="Boralba Lighting" />
          </Link>

          <nav className="bh-nav" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) =>
              item.submenu ? (
                <div className="bh-drop" key={item.label}>
                  <Link to={item.to} className="bh-nav-link" onClick={onNavigate}>
                    {item.label}
                  </Link>
                  <div className="bh-drop-panel">
                    {item.submenu.map((category) => (
                      <Link key={category.label} to={category.to} className="bh-drop-link" onClick={onNavigate}>
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} to={item.to} className="bh-nav-link" onClick={onNavigate}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="bh-actions">
            <SearchIcon onClick={onSearchOpen} />
            <a href="tel:+34918707113" className="bh-phone">(34) 91 870 71 13</a>
            <Link to="/contacto" className="bh-cta" onClick={onNavigate}>
              Pide presupuesto <span className="bh-cta-arrow">→</span>
            </Link>
          </div>

          <button
            type="button"
            className="bh-burger"
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className={`bh-mobile${home ? ' bh--home' : ''}${menuOpen ? ' bh-mobile--open' : ''}`}>
        <nav className="bh-mobile-nav">
          {NAV_ITEMS.map((item) =>
            item.submenu ? (
              <Fragment key={item.label}>
                <button
                  type="button"
                  className="bh-mobile-link bh-mobile-toggle"
                  aria-expanded={productsOpen}
                  onClick={() => setProductsOpen((open) => !open)}
                >
                  {item.label}
                  <svg className="bh-mobile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className={`bh-mobile-sub${productsOpen ? ' is-open' : ''}`}>
                  <div className="bh-mobile-sub-inner">
                    {item.submenu.map((category) => (
                      <Link key={category.label} to={category.to} className="bh-mobile-sub-link" onClick={onNavigate}>
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </Fragment>
            ) : (
              <Link key={item.label} to={item.to} className="bh-mobile-link" onClick={onNavigate}>
                {item.label}
              </Link>
            ),
          )}
          <button type="button" className="bh-mobile-link" onClick={onSearchOpen}>
            Buscar productos
          </button>
          <a href="tel:+34918707113" className="bh-mobile-link">
            Llamar: (34) 91 870 71 13
          </a>
          <Link to="/contacto" className="bh-mobile-cta" onClick={onNavigate}>
            Pide presupuesto →
          </Link>
        </nav>
      </div>
    </>
  )
}
