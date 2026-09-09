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

function FlyoutItem({ node, open, onEnter, onLeave }) {
  const [pos, setPos] = useState({})
  const liRef = useRef(null)

  const show = () => {
    onEnter()
    if (!node.children.length) return
    const rect = liRef.current.getBoundingClientRect()
    const left = clampX(rect.left - FLYOUT_W - GAP, FLYOUT_W)
    setPos({ left, top: clampTop(rect.top - 4) })
  }

  return (
    <li
      ref={liRef}
      className={node.children.length > 0 ? 'has-sub' : ''}
      onMouseEnter={show}
      onMouseLeave={onLeave}
    >
      <Link to={`/categoria/${node.slug}`}>
        <span>{node.name}</span>
        {node.children.length > 0 && <span className="chevron">‹</span>}
      </Link>
      {open && node.children.length > 0 && (
        <div className="flyout" style={{ position: 'fixed', ...pos, width: FLYOUT_W }}>
          <FlyoutLevel nodes={node.children} listClassName="flyout-list" />
        </div>
      )}
    </li>
  )
}

// Un solo abierto por nivel: al entrar en un item se cierra el hermano
// al instante (sin esperar su temporizador) y el retardo corto solo se
// usa al salir del menú del todo.
function FlyoutLevel({ nodes, listClassName = 'flyout-list' }) {
  const [openSlug, setOpenSlug] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const openItem = (slug) => {
    clearTimeout(timer.current)
    setOpenSlug(slug)
  }

  const scheduleClose = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenSlug(null), 100)
  }

  return (
    <ul className={listClassName}>
      {nodes.map((child) => (
        <FlyoutItem
          key={child.slug}
          node={child}
          open={openSlug === child.slug}
          onEnter={() => openItem(child.slug)}
          onLeave={scheduleClose}
        />
      ))}
    </ul>
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
    timer.current = setTimeout(() => setOpen(false), 100)
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
          <FlyoutLevel nodes={tree} listClassName="flyout-list flyout-root" />
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
