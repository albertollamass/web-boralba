import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'

export default function Footer({ home = false }) {
  const { getChildren, ROOT } = useCategories()
  const cats = getChildren(ROOT.slug)
  const year = new Date().getFullYear()

  return (
    <footer className={`footer${home ? ' footer-home' : ''}`}>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">
              <img src="images/logo.png" alt="Boralba Lighting" />
            </div>
            <p>
              Soluciones de iluminación LED profesional para arquitectos, instaladores,
              interioristas y proyectos que buscan calidad, fiabilidad y un resultado profesional.
            </p>
          </div>
          <div>
            <h4>Productos</h4>
            <ul>
              {cats.map((c) => (
                <li key={c.slug}>
                  <Link to={`/categoria/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Soluciones</h4>
            <ul>
              <li><Link to="/servicios">Asesoramiento y diseño</Link></li>
              <li><Link to="/servicios">Iluminación arquitectónica y lineal</Link></li>
              <li><Link to="/servicios">Exterior, fachada y control</Link></li>
              <li><Link to="/disena-tu-luminaria">Diseña tu luminaria</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li><Link to="/empresa">Sobre Boralba</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
            <h4 style={{ marginTop: 26 }}>Síguenos</h4>
            <p className="footer-social">
              <a
                href="https://www.facebook.com/profile.php?id=100063786154063"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <span>·</span>
              <a href="https://www.instagram.com/boralbalighting/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </p>
            <p className="footer-contact">
              <a href="mailto:boralba@boralba.es">boralba@boralba.es</a>
              <br />
              <a href="tel:+34918707113">(34) 91 870 71 13</a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{year} © BORALBA LIGHTING, SL</span>
          <span className="legal">
            <Link to="/legal/aviso-legal">Aviso Legal</Link>
            <Link to="/legal/politica-privacidad">Política de Privacidad</Link>
            <Link to="/legal/politica-cookies">Política de Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}