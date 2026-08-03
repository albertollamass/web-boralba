import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'

export default function Footer() {
  const { getChildren, ROOT } = useCategories()
  const cats = getChildren(ROOT.slug)
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">
              <img src="images/logo.png" alt="Boralba Lighting" />
            </div>
            <p>
              Boralba Lighting, S.L. Soluciones de iluminación profesional para proyectos
              comerciales, arquitectónicos y residenciales a través de distribución.
            </p>
            <p>Partner tecnológico de TRIDONIC.</p>
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
            <h4>Visítanos en</h4>
            <p>
              Calle Destreza, 3. Nave D10
              <br />
              Polígono Los Olivos
              <br />
              28906 Getafe
            </p>
            <h4>Contacto</h4>
            <p>
              <a href="mailto:boralba@boralba.es">boralba@boralba.es</a>
              <br />
              <a href="tel:+34918707113">Tel: (34) 91 870 71 13</a>
            </p>
            <h4>Síguenos en</h4>
            <p>
              <a
                href="https://www.facebook.com/profile.php?id=100063786154063"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>{' '}
              ·{' '}
              <a href="https://www.instagram.com/boralbalighting/" target="_blank" rel="noreferrer">
                Instagram
              </a>
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
