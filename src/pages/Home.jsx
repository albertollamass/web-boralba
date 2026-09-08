import { Link } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext'
import { useProducts } from '../context/ProductsContext'
import { useSiteSettings } from '../context/SiteSettingsContext'

const families = [
  { slug: 'tiras-led-2', name: 'Tiras LED', desc: 'Iluminación flexible y eficiente para cualquier proyecto.', img: 'images/tiras-led.png' },
  { slug: 'perfiles', name: 'Perfiles', desc: 'Perfiles de aluminio para acabados profesionales.', img: 'images/perfiles.png' },
  { slug: 'tiras-neon', name: 'Neón Flex', desc: 'Línea de luz continua con efecto neón LED.', img: 'images/neon.png' },
  { slug: 'controladores-y-fuentes', name: 'Drivers y fuentes', desc: 'Alimentación y control para sistemas LED.', img: 'images/fuentes-drivers.png' },
  { slug: 'casambi', name: 'Control y regulación', desc: 'Casambi, DALI y sistemas de control profesional.', img: 'images/fuentes-drivers.png' },
  { slug: 'downlight-led', name: 'Luminarias', desc: 'Downlights, paneles y proyectores LED profesionales.', img: 'images/downlight.png' },
]

const solutions = [
  { icon: '01', title: 'Para instaladores', desc: 'Productos compatibles, documentación técnica y soporte directo.' },
  { icon: '02', title: 'Para arquitectos e interioristas', desc: 'Inspiración, detalles constructivos y asesoramiento de proyecto.' },
  { icon: '03', title: 'Para distribuidores', desc: 'Catálogo profesional, atención comercial y disponibilidad.' },
]

const experienceItems = [
  'Más de 30 años de experiencia',
  'Asesoramiento técnico especializado',
  'Corte y preparación a medida',
  'Selección de componentes compatibles',
  'Atención directa a profesionales',
  'Soluciones para proyectos de cualquier escala',
]

const smartPillars = [
  { num: '01', title: 'Diseño de la solución' },
  { num: '02', title: 'Programación y puesta en marcha' },
  { num: '03', title: 'Asistencia técnica' },
]

const applications = [
  { label: 'Residencial', img: 'images/lobby.png' },
  { label: 'Retail', img: 'images/productos.png' },
  { label: 'Hoteles y restauración', img: 'images/asesoramiento.png' },
]

export default function Home() {
  const { getCategory } = useCategories()
  const { products } = useProducts()
  const { settings } = useSiteSettings()
  const featured = products.filter((p) => p.featured).slice(0, 4)
  const outletCount = products.filter((p) => p.outlet).length

  const specLine = (p) => {
    const specs = Array.isArray(p.specs) ? p.specs : []
    const parts = specs.slice(0, 3).map((s) => `${s.value}${s.unit ? ` ${s.unit}` : ''}`).filter(Boolean)
    return parts.join(' · ')
  }

  const getCatImage = (slug) => {
    const cat = getCategory(slug)
    return cat?.image || 'images/placeholder.svg'
  }

  return (
    <>
      {/* ── 1. HERO ────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-content">
            <span className="home-hero-badge">Soluciones LED profesionales</span>
            <h1>Iluminación LED que transforma espacios</h1>
            <p className="home-hero-sub">Soluciones profesionales para arquitectura, interiorismo e instalación.</p>
            <p className="home-hero-text">Te ayudamos a seleccionar y configurar todos los componentes de tu proyecto: iluminación, perfiles, alimentación y control.</p>
            <div className="home-hero-ctas">
              <Link to="/productos" className="btn btn-primary">Descubrir productos</Link>
              <Link to="/contacto" className="btn btn-outline btn-outline--light">Cuéntanos tu proyecto</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FAMILIAS ────────────────────────────────────── */}
      <section className="section home-families">
        <div className="container">
          <div className="section-head">
            <span className="tag">Nuestro catálogo</span>
            <h2>Familias de productos para cada proyecto</h2>
            <p>Todo lo que necesitas para proyectos de iluminación LED profesional.</p>
          </div>
          <div className="home-families-grid">
            {families.map((f) => (
              <Link key={f.slug} to={`/categoria/${f.slug}`} className="home-family-card">
                <div className="home-family-img"><img src={getCatImage(f.slug)} alt={f.name} loading="lazy" /></div>
                <div className="home-family-body">
                  <h3>{f.name}</h3>
                  <p>{f.desc}</p>
                  <span className="home-family-link">Ver productos &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 36 }}>
            <Link to="/productos" className="btn btn-primary">Ver todos los productos</Link>
          </div>
        </div>
      </section>

      {/* ── 3. PRODUCTOS DESTACADOS ────────────────────────── */}
      {featured.length > 0 && (
        <section className="section home-featured">
          <div className="container">
            <div className="section-head">
              <span className="tag">Destacados</span>
              <h2>Productos destacados</h2>
              <p>Una selección de soluciones para proyectos profesionales.</p>
            </div>
            <div className="grid grid-4">
              {featured.map((p) => (
                <Link key={p.id} to={`/producto/${p.id}`} className="home-product-card">
                  <div className="home-product-img"><img src={p.image || 'images/placeholder.svg'} alt={p.name} loading="lazy" /></div>
                  <div className="home-product-body">
                    <h3>{p.name}</h3>
                    {specLine(p) && <p className="home-product-specs">{specLine(p)}</p>}
                    {p.ref && <p className="home-product-ref">Ref. {p.ref}</p>}
                    <span className="home-product-link">Ver producto &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. VALUE PROP ──────────────────────────────────── */}
      <section className="section home-value">
        <div className="container">
          <div className="home-value-inner">
            <div className="home-value-text">
              <span className="tag">Nuestra diferencia</span>
              <h2>No vendemos productos aislados. Configuramos soluciones.</h2>
              <p>Seleccionamos los componentes compatibles para que la instalación funcione correctamente desde el primer momento.</p>
              <Link to="/contacto" className="btn btn-primary" style={{ marginTop: 8 }}>Configurar mi proyecto</Link>
            </div>
            <div className="home-value-flow">
              <div className="home-flow-step"><span className="home-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
              </span><strong>Iluminación</strong></div>
              <span className="home-flow-plus">+</span>
              <div className="home-flow-step"><span className="home-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
              </span><strong>Perfiles</strong></div>
              <span className="home-flow-plus">+</span>
              <div className="home-flow-step"><span className="home-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span><strong>Alimentación</strong></div>
              <span className="home-flow-plus">+</span>
              <div className="home-flow-step"><span className="home-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>
              </span><strong>Control</strong></div>
              <span className="home-flow-equals">=</span>
              <div className="home-flow-step home-flow-result"><span className="home-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </span><strong>Proyecto de éxito</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SOLUCIONES POR CLIENTE ──────────────────────── */}
      <section className="section home-clients">
        <div className="container">
          <div className="section-head">
            <span className="tag">Por tipo de cliente</span>
            <h2>Encuentra tu solución</h2>
          </div>
          <div className="grid grid-3">
            {solutions.map((s) => (
              <article key={s.icon} className="home-client-card">
                <span className="home-client-num">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. EXPERIENCIA ─────────────────────────────────── */}
      <section className="section home-experience">
        <div className="container">
          <div className="home-exp-grid">
            <div className="home-exp-img"><img src="images/asesoramiento.png" alt="Asesoramiento Boralba" /></div>
            <div className="home-exp-content">
              <span className="tag">Sobre nosotros</span>
              <h2>Más de 30 años haciendo fácil la iluminación profesional</h2>
              <ul className="home-exp-list">
                {experienceItems.map((item, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contacto" className="btn btn-primary" style={{ marginTop: 8 }}>Conoce Boralba</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SMART LIGHTING ──────────────────────────────── */}
      <section className="section home-smart">
        <div className="container">
          <div className="home-smart-grid">
            <div className="home-smart-content">
              <span className="tag tag--light">Smart Lighting</span>
              <h2>Controla la iluminación. Transforma el espacio.</h2>
              <p>Diseñamos, configuramos y ponemos en marcha soluciones de control mediante Casambi, DALI y otros sistemas profesionales.</p>
              <div className="home-smart-pillars">
                {smartPillars.map((p) => (
                  <div key={p.num} className="home-smart-pillar">
                    <span className="home-smart-num">{p.num}</span>
                    <span>{p.title}</span>
                  </div>
                ))}
              </div>
              <Link to="/servicios" className="btn btn-primary" style={{ marginTop: 14 }}>Descubrir Smart Lighting</Link>
            </div>
            <div className="home-smart-img"><img src="images/eslogan.png" alt="Control de iluminación" /></div>
          </div>
        </div>
      </section>

      {/* ── 8. APLICACIONES ────────────────────────────────── */}
      <section className="section home-applications">
        <div className="container">
          <div className="section-head">
            <span className="tag">Ideas de aplicación</span>
            <h2>Iluminación aplicada a espacios reales</h2>
          </div>
          <div className="grid grid-3">
            {applications.map((a) => (
              <figure key={a.label} className="home-app-card">
                <img src={a.img} alt={a.label} loading="lazy" />
                <figcaption>
                  <span>{a.label}</span>
                  <small>Imagen de inspiración</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FABRICANTES ─────────────────────────────────── */}
      <section className="section home-brands">
        <div className="container">
          <div className="section-head">
            <span className="tag">Tecnología de primeras marcas</span>
            <h2>Trabajamos con fabricantes especializados</h2>
            <p>Garantizamos fiabilidad, compatibilidad y calidad de luz.</p>
          </div>
          <div className="home-brands-row">
            <div className="home-brand-logo"><img src="images/tridonic.png" alt="Tridonic" /></div>
            <div className="home-brand-placeholder">+</div>
          </div>
        </div>
      </section>

      {/* ── 10. OUTLET ─────────────────────────────────────── */}
      {outletCount > 0 && (
        <section className="section home-outlet">
          <div className="container">
            <div className="home-outlet-card">
              <div className="home-outlet-text">
                <span className="tag">Outlet</span>
                <h2>Outlet profesional</h2>
                <p>Últimas unidades y productos descatalogados disponibles hasta fin de existencias.</p>
                <p className="home-outlet-count">{outletCount} producto{outletCount > 1 ? 's' : ''} disponible{outletCount > 1 ? 's' : ''}</p>
              </div>
              <Link to="/outlet" className="btn btn-primary">Ver outlet</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 11. PRE-FOOTER CTA ─────────────────────────────── */}
      <section className="home-cta">
        <div className="container home-cta-inner">
          <div className="home-cta-text">
            <h2>¿Tienes un proyecto de iluminación?</h2>
            <p>Cuéntanos qué necesitas y nuestro equipo te ayudará a seleccionar una solución completa.</p>
          </div>
          <div className="home-cta-actions">
            <Link to="/contacto" className="btn btn-primary btn-outline--light">Solicitar asesoramiento</Link>
            <a href={`tel:${settings.phone}`} className="home-cta-contact">{settings.phone}</a>
            <a href={`mailto:${settings.email}`} className="home-cta-contact">{settings.email}</a>
          </div>
        </div>
      </section>
    </>
  )
}
