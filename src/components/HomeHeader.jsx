import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Productos', to: '/productos' },
  { label: 'Soluciones', to: '/servicios' },
  { label: 'Proyectos', to: '/proyectos' },
  { label: 'Contacto', to: '/contacto' },
]

export default function HomeHeader({ menuOpen, onMenuToggle, onNavigate }) {
  return (
    <>
      <div className="redesign-hero-top">
        <Link to="/" className="redesign-logo" onClick={onNavigate}>
          <img src="images/logo.png" alt="Boralba Lighting" />
        </Link>
        <nav className="redesign-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link to={item.to} key={item.label}>{item.label}</Link>
          ))}
        </nav>
        <Link to="/contacto" className="redesign-btn-primary redesign-btn-compact redesign-cta-top">
          Solicitar presupuesto
        </Link>
        <button
          type="button"
          className="redesign-menu-toggle"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      <div className={`redesign-mobile-menu${menuOpen ? ' is-open' : ''}`}>
        {navItems.map((item) => (
          <Link to={item.to} key={item.label} onClick={onNavigate}>{item.label}</Link>
        ))}
        <Link to="/contacto" className="redesign-btn-primary redesign-btn-compact" onClick={onNavigate}>
          Solicitar presupuesto
        </Link>
      </div>
    </>
  )
}
