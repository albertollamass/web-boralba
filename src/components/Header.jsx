import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROOT, getChildren } from '../data/categories'

function buildTree(slug) {
  return getChildren(slug).map((cat) => ({
    ...cat,
    children: buildTree(cat.slug),
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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const tree = buildTree(ROOT.slug)

  const renderMobileNode = (nodes) =>
    nodes.map((node) => (
      <div key={node.slug}>
        <Link
          to={`/categoria/${node.slug}`}
          onClick={() => setMenuOpen(false)}
          style={{ display: 'inline-block' }}
        >
          {node.name}
        </Link>
        {node.children.length > 0 && (
          <div className="sub-block">{renderMobileNode(node.children)}</div>
        )}
      </div>
    ))

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
          {tree.map((node) => (
            <div key={node.slug}>
              <Link
                to={`/categoria/${node.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'inline-block' }}
              >
                {node.name}
              </Link>
              {node.children.length > 0 && <div>{renderMobileNode(node.children)}</div>}
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
