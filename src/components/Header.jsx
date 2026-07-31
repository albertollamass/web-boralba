import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROOT, getChildren } from '../data/categories'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootChildren = getChildren(ROOT.slug)

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>
            Soluciones de Iluminación LED Profesional · Más de 30 años de experiencia
          </span>
          <span>
            <a href="mailto:boralba@boralba.es">boralba@boralba.es</a> ·{' '}
            <a href="tel:+34918707113">(34) 91 870 71 13</a>
          </span>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <img src="/images/logo.png" alt="Boralba Lighting" />
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <div className="nav-item">
              <Link to="/productos" className="nav-link">
                Productos <span className="caret">▾</span>
              </Link>
              <div className="dropdown dropdown-columns">
                {rootChildren.map((cat) => (
                  <Link key={cat.slug} to={`/categoria/${cat.slug}`}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/outlet" className="nav-link">
              Outlet
            </Link>
            <Link to="/proyectos" className="nav-link">
              Proyectos
            </Link>
            <Link to="/servicios" className="nav-link">
              Servicios
            </Link>
            <Link to="/contacto" className="nav-link">
              Contacto
            </Link>
          </nav>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Abrir menú"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/productos" onClick={() => setMenuOpen(false)}>
            Productos
          </Link>
          {rootChildren.map((cat) => (
            <div key={cat.slug}>
              <Link
                to={`/categoria/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'inline-block' }}
              >
                {cat.name} {cat.children?.length ? '▾' : ''}
              </Link>
              {cat.children?.length ? (
                <div>
                  {cat.children.map((child) => (
                    <Link
                      key={child.slug}
                      className="sub"
                      to={`/categoria/${child.slug}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link to="/outlet" onClick={() => setMenuOpen(false)}>
            Outlet
          </Link>
          <Link to="/proyectos" onClick={() => setMenuOpen(false)}>
            Proyectos
          </Link>
          <Link to="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={() => setMenuOpen(false)}>
            Contacto
          </Link>
        </div>
      </header>
    </>
  )
}
