import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'

function buildTree(categories, getChildren, slug) {
  return getChildren(slug).map((cat) => ({
    ...cat,
    children: buildTree(categories, getChildren, cat.slug),
  }))
}

const FLYOUT_W = 248
const PANEL_W = 264
const GAP = 6
const EDGE = 8

function clampX(left, width) {
  const maxLeft = window.innerWidth - width - EDGE
  return Math.min(Math.max(EDGE, left), maxLeft)
}

function clampTop(top) {
  return Math.min(Math.max(EDGE, top), window.innerHeight - 24)
}

function FlyoutItem({ node }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const liRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    if (!node.children.length) return
    const rect = liRef.current.getBoundingClientRect()
    const left = clampX(rect.left - FLYOUT_W - GAP, FLYOUT_W)
    setPos({ left, top: clampTop(rect.top - 4) })
    setOpen(true)
  }

  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <li
      ref={liRef}
      className={node.children.length > 0 ? 'has-sub' : ''}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <Link to={`/categoria/${node.slug}`}>
        <span>{node.name}</span>
        {node.children.length > 0 && <span className="chevron">‹</span>}
      </Link>
      {open && (
        <div className="flyout" style={{ position: 'fixed', ...pos, width: FLYOUT_W }}>
          <ul className="flyout-list">
            {node.children.map((child) => (
              <FlyoutItem key={child.slug} node={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

function ProductsMenu({ tree }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const itemRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    const rect = itemRef.current.getBoundingClientRect()
    setPos({
      left: clampX(rect.left, PANEL_W),
      top: rect.bottom + GAP,
    })
    setOpen(true)
  }

  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <div className="nav-item" ref={itemRef} onMouseEnter={show} onMouseLeave={hide}>
      <Link to="/productos" className="nav-link">
        Productos <span className="caret">▾</span>
      </Link>
      {open && (
        <div
          className="dropdown dropdown-flyout"
          style={{ position: 'fixed', ...pos, width: PANEL_W }}
        >
          <ul className="flyout-list flyout-root">
            {tree.map((node) => (
              <FlyoutItem key={node.slug} node={node} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MobileNode({ node, depth = 0, onNavigate }) {
  const [open, setOpen] = useState(false)
  const hasChildren = node.children.length > 0

  return (
    <div className="mobile-node">
      {hasChildren ? (
        <button
          className="mobile-toggle sub-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{ paddingLeft: 16 + depth * 18 }}
        >
          <span>{node.name}</span>
          <span className="caret">{open ? '▴' : '▾'}</span>
        </button>
      ) : (
        <Link
          to={`/categoria/${node.slug}`}
          onClick={onNavigate}
          className="sub leaf"
          style={{ paddingLeft: 16 + depth * 18 }}
        >
          {node.name}
        </Link>
      )}
      {open && (
        <div className="sub-block">
          {node.children.map((child) => (
            <MobileNode key={child.slug} node={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [productosOpen, setProductosOpen] = useState(false)
  const { categories, getChildren, ROOT } = useCategories()
  const tree = buildTree(categories, getChildren, ROOT.slug)

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
            <img src="images/logo.png" alt="Boralba Lighting" />
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <ProductsMenu tree={tree} />
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
            <Link to="/buscar" className="nav-link nav-search" aria-label="Buscar productos" title="Buscar productos">
              <svg
                width="18"
                height="18"
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
          <Link to="/buscar" className="mobile-search" onClick={() => setMenuOpen(false)}>
            <svg
              width="16"
              height="16"
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
            Buscar productos
          </Link>
          <button
            className="mobile-toggle"
            onClick={() => setProductosOpen((o) => !o)}
            aria-expanded={productosOpen}
          >
            <span>Productos</span>
            <span className="caret">{productosOpen ? '▴' : '▾'}</span>
          </button>
          {productosOpen && (
            <div className="mobile-submenu">
              <Link
                to="/productos"
                onClick={() => setMenuOpen(false)}
                className="sub all"
                style={{ paddingLeft: 16 }}
              >
                Ver todos los productos
              </Link>
              {tree.map((node) => (
                <MobileNode
                  key={node.slug}
                  node={node}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </div>
          )}
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
