import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../lib/seo'

export default function Empresa() {
  return (
    <>
      <Seo
        title="Empresa — Más de 30 años en iluminación"
        description="Boralba Lighting desde 2006 en Getafe (Madrid): distribución, diseño de iluminación, control Tridonic, puesta en marcha y marca propia HALOPACK. Más de 30 años de experiencia en el sector."
        path="/empresa"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Empresa', url: canonicalFor('/empresa') },
        ])}
      />
      <div className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Empresa</span>
          </nav>
          <h1>Más de 30 años evolucionando con la iluminación</h1>
          <p>
            Desde 2006, Boralba Lighting ha pasado de la distribución a ofrecer soluciones
            completas para proyectos profesionales: asesoramiento, diseño, suministro, control y
            puesta en marcha.
          </p>
        </div>
      </div>

      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="split">
          <div className="split-text">
            <span className="tag">Sobre Boralba</span>
            <h2>Iluminación, tecnología y soluciones propias</h2>
            <p>
              Combinamos iluminación profesional con diseño, control y puesta en marcha, además de
              soluciones propias bajo nuestra marca HALOPACK e integración de tecnología Tridonic.
            </p>
            <ul className="checklist">
              <li>+30 años de experiencia en el sector</li>
              <li>Boralba Lighting S.L. desde 2006 en Getafe, Madrid</li>
              <li>Proyectos · Tecnología · HALOPACK</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/proyectos" className="btn btn-primary">Ver proyectos</Link>
              <Link to="/contacto" className="btn btn-outline">Hablar con nosotros</Link>
            </div>
          </div>
          <div className="split-img">
            <img
              src="images/almacen.png"
              alt="Instalaciones de Boralba Lighting en Getafe, Madrid"
              loading="lazy"
              width="1200"
              height="800"
            />
          </div>
        </div>

        <div className="section-head" style={{ marginTop: 56 }}>
          <span className="tag">Contacto directo</span>
          <h2>¿Tienes un proyecto entre manos?</h2>
          <p>
            Llámanos al <a href={SITE.phoneHref}>{SITE.phone}</a> o escríbenos a{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Respuesta en menos de 24h.
          </p>
        </div>
      </div>
    </>
  )
}
