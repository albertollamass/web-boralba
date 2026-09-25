import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer footer-minimal">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <img src="images/logo.png" alt="Boralba Lighting" />
            </div>
            <p>
              Soluciones de iluminación profesional para espacios que buscan calidad,
              precisión y carácter.
            </p>
          </div>
          <nav aria-label="Navegación del footer">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/disena-tu-luminaria">Diseña tu luminaria</Link></li>
              <li><Link to="/empresa">Empresa</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </nav>
          <div className="footer-contact-column">
            <h4>Contacto</h4>
            <p className="footer-contact">
              <a href="mailto:boralba@boralba.es">boralba@boralba.es</a>
              <a href="tel:+34918707113">(34) 91 870 71 13</a>
              <span>Getafe · Madrid</span>
              <a href="https://www.instagram.com/boralbalighting/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Boralba Lighting</span>
          <span className="legal">
            <Link to="/legal/politica-privacidad">Política de privacidad</Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/politica-cookies">Cookies</Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/aviso-legal">Aviso legal</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
